import { NextRequest, NextResponse } from "next/server";
import { corsCheck, requireSession, requireDealOwnership } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeUuid } from "@/lib/sanitize";
import { getPlaidClient, applyTradesRules } from "@/lib/plaid";

// POST /api/plaid/sync-transactions
// Body: { deal_id, connection_id }
// Returns: { synced, added, modified, removed, add_back_candidates }
//
// Calls Plaid /transactions/sync (cursor-based incremental sync), applies
// trades-business categorization rules, and writes results to
// bank_transactions. Trades-tuned Claude categorization for unmatched
// transactions happens in a separate agent job (lib/agents/trades-categorizer)
// scheduled via cron, not in this synchronous request.
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
  if (!connectionId) return NextResponse.json({ error: "Invalid connection_id." }, { status: 400 });

  const { error: ownershipError } = await requireDealOwnership(req, dealId);
  if (ownershipError) return ownershipError;

  try {
    const { getAdminSupabase } = await import("@/lib/supabase");
    const admin = getAdminSupabase();

    // Fetch the connection row — verify it belongs to this deal
    const { data: conn } = await admin
      .from("plaid_connections")
      .select("*")
      .eq("id", connectionId)
      .eq("deal_id", dealId)
      .single();

    if (!conn) {
      return NextResponse.json({ error: "Connection not found." }, { status: 404 });
    }

    const plaid = getPlaidClient();

    // Cursor-based sync — Plaid recommends this over the deprecated
    // /transactions/get endpoint. cursor starts as null on first call.
    let cursor: string | null = conn.cursor || null;
    let hasMore = true;
    const added: Array<Record<string, unknown>> = [];
    const modified: Array<Record<string, unknown>> = [];
    const removed: string[] = [];
    let iterations = 0;
    const MAX_ITERATIONS = 20; // safety cap — Plaid usually finishes in 1-3

    while (hasMore && iterations < MAX_ITERATIONS) {
      const syncRes = await plaid.transactionsSync({
        access_token: conn.access_token,
        cursor: cursor ?? undefined,
      });

      added.push(...syncRes.data.added);
      modified.push(...syncRes.data.modified);
      removed.push(...syncRes.data.removed.map((r) => r.transaction_id));
      hasMore = syncRes.data.has_more;
      cursor = syncRes.data.next_cursor;
      iterations++;
    }

    // Categorize and persist added transactions
    let addBackCandidates = 0;
    const rows = added.map((txn) => {
      const name = String((txn as { name?: string }).name || "");
      const merchant = (txn as { merchant_name?: string | null }).merchant_name ?? null;
      const tradesRule = applyTradesRules(name, merchant);

      if (tradesRule?.isAddBackCandidate) addBackCandidates++;

      return {
        deal_id: dealId,
        plaid_transaction_id: (txn as { transaction_id: string }).transaction_id,
        date: (txn as { date: string }).date,
        name,
        merchant_name: merchant,
        amount: (txn as { amount: number }).amount,
        plaid_category: (txn as { category?: string[] }).category ?? null,
        kb_category: tradesRule?.kbCategory ?? null,
        is_add_back_candidate: tradesRule?.isAddBackCandidate ?? false,
        add_back_reason: tradesRule?.addBackReason ?? null,
        account_id: (txn as { account_id: string }).account_id,
        pending: (txn as { pending?: boolean }).pending ?? false,
      };
    });

    if (rows.length > 0) {
      const { error: insertError } = await admin
        .from("bank_transactions")
        .upsert(rows, { onConflict: "plaid_transaction_id" });

      if (insertError) {
        console.error("[plaid/sync] insert error:", insertError.message);
      }
    }

    // Apply removed
    if (removed.length > 0) {
      await admin
        .from("bank_transactions")
        .delete()
        .in("plaid_transaction_id", removed);
    }

    // Update cursor + last_synced_at on the connection
    await admin
      .from("plaid_connections")
      .update({
        cursor,
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", connectionId);

    return NextResponse.json({
      success: true,
      synced: added.length + modified.length,
      added: added.length,
      modified: modified.length,
      removed: removed.length,
      add_back_candidates: addBackCandidates,
    });
  } catch (err) {
    console.error("[plaid/sync] error:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json(
      { error: "Could not sync transactions." },
      { status: 500 }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return corsCheck(req) ?? new NextResponse(null, { status: 204 });
}
