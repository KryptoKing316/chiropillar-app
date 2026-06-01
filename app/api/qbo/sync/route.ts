import { NextRequest, NextResponse } from "next/server";
import { corsCheck, requireSession, requireDealOwnership } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeUuid } from "@/lib/sanitize";
import {
  fetchProfitAndLoss,
  fetchBalanceSheet,
  fetchChartOfAccounts,
  getQboOAuthClient,
} from "@/lib/qbo";

// POST /api/qbo/sync
// Body: { deal_id, connection_id }
// Returns: { synced_years, pl_rows, bs_rows, account_count }
//
// Pulls last 3 fiscal years of P&L + Balance Sheet + the full Chart of
// Accounts. Refreshes the access token first if it's expired.
export async function POST(req: NextRequest) {
  const corsError = corsCheck(req);
  if (corsError) return corsError;

  const rateLimitError = await rateLimit(req);
  if (rateLimitError) return rateLimitError;

  const { error: authError } = await requireSession(req);
  if (authError) return authError;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const dealId = sanitizeUuid(body.deal_id);
  const connectionId = sanitizeUuid(body.connection_id);

  if (!dealId) return NextResponse.json({ error: "Invalid deal_id." }, { status: 400 });
  if (!connectionId)
    return NextResponse.json({ error: "Invalid connection_id." }, { status: 400 });

  const { error: ownershipError } = await requireDealOwnership(req, dealId);
  if (ownershipError) return ownershipError;

  try {
    const { getAdminSupabase } = await import("@/lib/supabase");
    const admin = getAdminSupabase();

    const { data: conn } = await admin
      .from("qbo_connections")
      .select("*")
      .eq("id", connectionId)
      .eq("deal_id", dealId)
      .single();

    if (!conn) {
      return NextResponse.json({ error: "Connection not found." }, { status: 404 });
    }

    let accessToken = conn.access_token as string;
    const refreshToken = conn.refresh_token as string;
    const realmId = conn.realm_id as string;
    const expiresAt = conn.expires_at ? new Date(conn.expires_at).getTime() : 0;

    // Refresh token if expired (or within 60s of expiry)
    if (Date.now() > expiresAt - 60_000) {
      const client = getQboOAuthClient();
      client.setToken({
        access_token: accessToken,
        refresh_token: refreshToken,
        realmId,
      });
      const refreshed = await client.refresh();
      accessToken = refreshed.token.access_token;

      await admin
        .from("qbo_connections")
        .update({
          access_token: refreshed.token.access_token,
          refresh_token: refreshed.token.refresh_token,
          expires_at: new Date(
            Date.now() + refreshed.token.expires_in * 1000
          ).toISOString(),
        })
        .eq("id", connectionId);
    }

    // Pull last 3 fiscal years
    const thisYear = new Date().getFullYear();
    const years = [thisYear - 1, thisYear - 2, thisYear - 3];
    let plCount = 0;
    let bsCount = 0;

    for (const year of years) {
      try {
        const pl = await fetchProfitAndLoss(realmId, accessToken, year);
        await admin.from("qbo_profit_loss").upsert(
          {
            deal_id: dealId,
            connection_id: connectionId,
            year,
            report_data: pl,
          },
          { onConflict: "deal_id,year" }
        );
        plCount++;
      } catch (e) {
        console.error(`[qbo/sync] P&L ${year}:`, e instanceof Error ? e.message : "fail");
      }

      try {
        const bs = await fetchBalanceSheet(realmId, accessToken, year);
        await admin.from("qbo_balance_sheet").upsert(
          {
            deal_id: dealId,
            connection_id: connectionId,
            year,
            report_data: bs,
          },
          { onConflict: "deal_id,year" }
        );
        bsCount++;
      } catch (e) {
        console.error(`[qbo/sync] BS ${year}:`, e instanceof Error ? e.message : "fail");
      }
    }

    // Chart of Accounts
    let accountCount = 0;
    try {
      const coa = await fetchChartOfAccounts(realmId, accessToken);
      await admin.from("qbo_chart_of_accounts").upsert(
        {
          deal_id: dealId,
          connection_id: connectionId,
          accounts_data: coa,
          fetched_at: new Date().toISOString(),
        },
        { onConflict: "deal_id,connection_id" }
      );
      // Count entries if we can
      const coaObj = coa as { QueryResponse?: { Account?: unknown[] } };
      accountCount = coaObj.QueryResponse?.Account?.length ?? 0;
    } catch (e) {
      console.error("[qbo/sync] CoA:", e instanceof Error ? e.message : "fail");
    }

    await admin
      .from("qbo_connections")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", connectionId);

    return NextResponse.json({
      success: true,
      synced_years: years,
      pl_rows: plCount,
      bs_rows: bsCount,
      account_count: accountCount,
    });
  } catch (err) {
    console.error("[qbo/sync] error:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "QBO sync failed." }, { status: 500 });
  }
}

export async function OPTIONS(req: NextRequest) {
  return corsCheck(req) ?? new NextResponse(null, { status: 204 });
}
