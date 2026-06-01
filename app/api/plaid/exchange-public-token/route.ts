import { NextRequest, NextResponse } from "next/server";
import { corsCheck, requireSession, requireDealOwnership } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeUuid, sanitizeText } from "@/lib/sanitize";
import { blockDemoWrites } from "@/lib/demo-guard";
import { getPlaidClient } from "@/lib/plaid";

// POST /api/plaid/exchange-public-token
// Body: { deal_id, public_token, institution_name? }
// Returns: { connection_id, item_id, institution_name }
//
// Exchanges the short-lived Plaid public_token (returned by Plaid Link in the
// browser) for a long-lived access_token, then stores it in
// plaid_connections so the sync route can pull transactions on demand.
export async function POST(req: NextRequest) {
  const corsError = corsCheck(req);
  if (corsError) return corsError;

  const rateLimitError = await rateLimit(req);
  if (rateLimitError) return rateLimitError;

  const { error: authError } = await requireSession(req);
  if (authError) return authError;

  const demoBlock = await blockDemoWrites(req);
  if (demoBlock) return demoBlock;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const dealId = sanitizeUuid(body.deal_id);
  const publicToken = sanitizeText(body.public_token as string);
  const institutionName = sanitizeText((body.institution_name as string) || "Unknown Bank");

  if (!dealId) return NextResponse.json({ error: "Invalid deal_id." }, { status: 400 });
  if (!publicToken) return NextResponse.json({ error: "Missing public_token." }, { status: 400 });

  const { error: ownershipError } = await requireDealOwnership(req, dealId);
  if (ownershipError) return ownershipError;

  try {
    const plaid = getPlaidClient();
    const tokenRes = await plaid.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = tokenRes.data.access_token;
    const itemId = tokenRes.data.item_id;

    const { getAdminSupabase } = await import("@/lib/supabase");
    const admin = getAdminSupabase();

    const { data: connRow, error: insertError } = await admin
      .from("plaid_connections")
      .upsert(
        {
          deal_id: dealId,
          plaid_item_id: itemId,
          access_token: accessToken,
          institution_name: institutionName,
          last_synced_at: null,
        },
        { onConflict: "plaid_item_id" }
      )
      .select("id")
      .single();

    if (insertError || !connRow) {
      console.error("[plaid/exchange-public-token] insert error:", insertError?.message);
      return NextResponse.json({ error: "Could not save connection." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      connection_id: connRow.id,
      item_id: itemId,
      institution_name: institutionName,
    });
  } catch (err) {
    console.error("[plaid/exchange-public-token] error:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json(
      { error: "Could not exchange Plaid token." },
      { status: 500 }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return corsCheck(req) ?? new NextResponse(null, { status: 204 });
}
