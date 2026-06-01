import { NextRequest, NextResponse } from "next/server";
import { corsCheck, requireSession, requireDealOwnership } from "@/lib/auth";
import { sanitizeUuid, sanitizeText } from "@/lib/sanitize";
import { getQboOAuthClient, fetchCompanyInfo } from "@/lib/qbo";

// GET /api/qbo/callback?code=...&state=<dealId.nonce>&realmId=...
//
// Intuit redirects back here after the seller grants access. We:
//   1. Verify the state param matches our CSRF nonce cookie
//   2. Exchange the authorization code for access_token + refresh_token
//   3. Store the tokens in qbo_connections
//   4. Redirect the seller back to the financials page
export async function GET(req: NextRequest) {
  const corsError = corsCheck(req);
  if (corsError) return corsError;

  const { error: authError } = await requireSession(req);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const code = sanitizeText(searchParams.get("code"));
  const state = sanitizeText(searchParams.get("state"));
  const realmId = sanitizeText(searchParams.get("realmId"));
  const errorParam = searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(
      new URL(`/financials?qbo_error=${encodeURIComponent(errorParam)}`, req.url)
    );
  }

  if (!code || !state || !realmId) {
    return NextResponse.json(
      { error: "Missing OAuth params." },
      { status: 400 }
    );
  }

  const [dealIdRaw, stateNonce] = state.split(".");
  const dealId = sanitizeUuid(dealIdRaw);
  if (!dealId) {
    return NextResponse.json({ error: "Invalid state." }, { status: 400 });
  }

  // CSRF check
  const cookieNonce = req.cookies.get("qbo_oauth_nonce")?.value;
  if (!cookieNonce || cookieNonce !== stateNonce) {
    return NextResponse.json({ error: "State mismatch (CSRF)." }, { status: 403 });
  }

  const { error: ownershipError } = await requireDealOwnership(req, dealId);
  if (ownershipError) return ownershipError;

  try {
    const client = getQboOAuthClient();
    const tokenRes = await client.createToken(req.url);
    const { access_token, refresh_token, expires_in } = tokenRes.token;

    // Look up the company name so the dashboard can show a friendly label
    const info = await fetchCompanyInfo(realmId, access_token);

    const { getAdminSupabase } = await import("@/lib/supabase");
    const admin = getAdminSupabase();

    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

    await admin
      .from("qbo_connections")
      .upsert(
        {
          deal_id: dealId,
          realm_id: realmId,
          access_token,
          refresh_token,
          expires_at: expiresAt,
          company_name: info?.companyName || info?.legalName || "Connected",
          last_synced_at: null,
        },
        { onConflict: "deal_id,realm_id" }
      );

    const response = NextResponse.redirect(
      new URL(`/financials?qbo_connected=1&realm=${encodeURIComponent(realmId)}`, req.url)
    );
    response.cookies.delete("qbo_oauth_nonce");
    return response;
  } catch (err) {
    console.error("[qbo/callback] error:", err instanceof Error ? err.message : "unknown");
    return NextResponse.redirect(
      new URL(`/financials?qbo_error=token_exchange_failed`, req.url)
    );
  }
}
