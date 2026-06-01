import { NextRequest, NextResponse } from "next/server";
import { corsCheck, requireSession, requireDealOwnership } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeUuid } from "@/lib/sanitize";
import { getQboOAuthClient, QBO_SCOPES } from "@/lib/qbo";
import { randomBytes } from "node:crypto";

// GET /api/qbo/authorize?deal_id=<uuid>
// Redirects the seller to Intuit's OAuth consent screen. After they grant
// access, Intuit redirects them back to /api/qbo/callback with a code
// + realmId + state.
//
// We embed the deal_id in the OAuth state param (signed via a random nonce)
// so the callback knows which deal to associate the connection with.
export async function GET(req: NextRequest) {
  const corsError = corsCheck(req);
  if (corsError) return corsError;

  const rateLimitError = await rateLimit(req);
  if (rateLimitError) return rateLimitError;

  const { error: authError } = await requireSession(req);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const dealId = sanitizeUuid(searchParams.get("deal_id"));
  if (!dealId) {
    return NextResponse.json({ error: "Invalid deal_id." }, { status: 400 });
  }

  const { error: ownershipError } = await requireDealOwnership(req, dealId);
  if (ownershipError) return ownershipError;

  // CSRF nonce — stored in a short-lived signed cookie, verified in callback
  const nonce = randomBytes(16).toString("hex");
  const state = `${dealId}.${nonce}`;

  const client = getQboOAuthClient();
  const authUri = client.authorizeUri({
    scope: QBO_SCOPES,
    state,
  });

  const response = NextResponse.redirect(authUri);
  response.cookies.set("qbo_oauth_nonce", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}
