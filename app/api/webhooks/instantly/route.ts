import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/webhooks/instantly
 *
 * Receives real-time events from Instantly.ai:
 *   - reply          → lead replied to our email
 *   - email_opened   → lead opened the email
 *   - email_bounced  → email bounced (bad address)
 *   - unsubscribed   → lead opted out
 *   - lead_interested → Instantly marked lead as interested
 *
 * Setup in Instantly:
 *   Settings → Integrations → Webhooks → Add Webhook
 *   URL: https://app.kingdombroker.com/api/webhooks/instantly
 *   Secret: set INSTANTLY_WEBHOOK_SECRET in .env.local (any random string you create)
 *   Events: reply, email_opened, email_bounced, unsubscribed, lead_interested
 */

export async function POST(req: NextRequest) {
  // 1. Verify webhook secret so only Instantly can call this
  const secret = req.headers.get("x-instantly-signature") || req.headers.get("x-webhook-secret");
  const expectedSecret = process.env.INSTANTLY_WEBHOOK_SECRET;

  if (expectedSecret && secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 2. Extract key fields from Instantly payload
  const eventType = (body.event_type || body.type || body.event) as string;
  const leadEmail = (body.lead_email || body.email || (body.lead as Record<string, unknown>)?.email) as string;
  const campaignId = (body.campaign_id || (body.campaign as Record<string, unknown>)?.id) as string;
  const replyText = (body.reply_text || body.message || body.body) as string | undefined;
  const enrichmentData = body.enrichment_data || body.enrichment || null;

  if (!eventType || !leadEmail) {
    // Silently accept — Instantly sends test pings with no data
    return NextResponse.json({ received: true });
  }

  try {
    const { getAdminSupabase } = await import("@/lib/supabase");
    const admin = getAdminSupabase();

    // 3. Log every event to outreach_events for future analysis
    await admin.from("outreach_events").insert({
      lead_email: leadEmail,
      event_type: eventType,
      campaign_id: campaignId ?? null,
      reply_text: replyText ?? null,
      enrichment_data: enrichmentData ?? null,
      raw_payload: body,
      created_at: new Date().toISOString(),
    });

    // 4. Update the lead record in buyer_leads or seller_leads
    //    We search both tables since we don't know which pipeline it came from
    const now = new Date().toISOString();

    if (eventType === "reply" || eventType === "email_reply") {
      // Mark as replied in both tables (one will be a no-op)
      await Promise.all([
        admin
          .from("buyer_leads")
          .update({ outreach_status: "Replied", replied_at: now, last_reply: replyText ?? null })
          .eq("email", leadEmail),
        admin
          .from("seller_leads")
          .update({ outreach_status: "Replied", replied_at: now, last_reply: replyText ?? null })
          .eq("owner_email", leadEmail),
      ]);

    } else if (eventType === "lead_interested") {
      await Promise.all([
        admin.from("buyer_leads").update({ outreach_status: "Interested" }).eq("email", leadEmail),
        admin.from("seller_leads").update({ outreach_status: "Interested" }).eq("owner_email", leadEmail),
      ]);

    } else if (eventType === "email_bounced" || eventType === "bounced") {
      await Promise.all([
        admin.from("buyer_leads").update({ outreach_status: "Bounced" }).eq("email", leadEmail),
        admin.from("seller_leads").update({ outreach_status: "Bounced" }).eq("owner_email", leadEmail),
      ]);

    } else if (eventType === "unsubscribed") {
      await Promise.all([
        admin.from("buyer_leads").update({ outreach_status: "Unsubscribed" }).eq("email", leadEmail),
        admin.from("seller_leads").update({ outreach_status: "Unsubscribed" }).eq("owner_email", leadEmail),
      ]);
    }

    // 5. If enrichment data came with the event, store it for smarter future emails
    if (enrichmentData && leadEmail) {
      await admin
        .from("buyer_leads")
        .update({ enrichment_data: enrichmentData })
        .eq("email", leadEmail);
    }

    return NextResponse.json({ received: true, event: eventType, email: leadEmail });

  } catch (err) {
    console.error("[webhook/instantly] error:", err);
    // Always return 200 so Instantly doesn't retry spam
    return NextResponse.json({ received: true, warning: "Internal logging error" });
  }
}

// Instantly sends GET to verify the endpoint exists
export async function GET() {
  return NextResponse.json({ status: "Kingdom Broker webhook active" });
}
