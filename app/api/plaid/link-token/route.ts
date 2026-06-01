import { NextRequest, NextResponse } from "next/server";
import { corsCheck, requireSession, requireDealOwnership } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeUuid } from "@/lib/sanitize";
import { blockDemoWrites } from "@/lib/demo-guard";
import { Products, CountryCode } from "plaid";
import { getPlaidClient } from "@/lib/plaid";

// POST /api/plaid/link-token
// Body: { deal_id }
// Returns: { link_token, expiration }
//
// Creates a Plaid Link token for the seller to connect their bank.
// The link_token is short-lived and scoped to this user.
export async function POST(req: NextRequest) {
  const corsError = corsCheck(req);
  if (corsError) return corsError;

  const rateLimitError = await rateLimit(req);
  if (rateLimitError) return rateLimitError;

  const { error: authError, user } = await requireSession(req);
  if (authError || !user) return authError ?? NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const demoBlock = await blockDemoWrites(req);
  if (demoBlock) return demoBlock;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const dealId = sanitizeUuid(body.deal_id);
  if (!dealId) return NextResponse.json({ error: "Invalid deal_id." }, { status: 400 });

  const { error: ownershipError } = await requireDealOwnership(req, dealId);
  if (ownershipError) return ownershipError;

  try {
    const plaid = getPlaidClient();
    const res = await plaid.linkTokenCreate({
      user: { client_user_id: user.id },
      client_name: "Kingdom Broker",
      products: [Products.Transactions, Products.Auth],
      country_codes: [CountryCode.Us],
      language: "en",
      // 24 months of transactions
      transactions: { days_requested: 730 },
      // Webhook for transaction-sync notifications (server URL set in Plaid dashboard
      // OR override here in production)
      webhook: process.env.PLAID_WEBHOOK_URL,
    });

    return NextResponse.json({
      link_token: res.data.link_token,
      expiration: res.data.expiration,
    });
  } catch (err) {
    console.error("[plaid/link-token] error:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json(
      { error: "Could not create Plaid link token." },
      { status: 500 }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return corsCheck(req) ?? new NextResponse(null, { status: 204 });
}
