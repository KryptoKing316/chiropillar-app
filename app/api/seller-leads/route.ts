import { NextRequest, NextResponse } from "next/server";
import { corsCheck, requireAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText, sanitizeStateCode, sanitizeInt } from "@/lib/sanitize";
import { logAdminAction } from "@/lib/server/admin-log";

// GET /api/seller-leads — admin only
// Query params: ?run_id=xxx&sort=score&state=TX&page=1
export async function GET(req: NextRequest) {
  const corsError = corsCheck(req);
  if (corsError) return corsError;

  const rateLimitError = await rateLimit(req);
  if (rateLimitError) return rateLimitError;

  const { user, error: adminError } = await requireAdmin(req);
  if (adminError) return adminError;
  await logAdminAction(req, "seller_leads_viewed", { user_id: user?.id });

  try {
    const { getAdminSupabase } = await import("@/lib/supabase");
    const admin = getAdminSupabase();

    const { searchParams } = new URL(req.url);
    const runId = sanitizeText(searchParams.get("run_id") || "");
    const sort = sanitizeText(searchParams.get("sort") || "sell_readiness_score");
    const state = sanitizeStateCode(searchParams.get("state") || "");
    const page = sanitizeInt(searchParams.get("page") || "1", 1, 1000) ?? 1;
    const pageSize = 50;

    let query = admin
      .from("seller_leads")
      .select("*")
      .order(sort === "score" ? "sell_readiness_score" : "date_found", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (runId) query = query.eq("run_id", runId);
    if (state) query = query.eq("state", state);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data, page, pageSize });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function OPTIONS(req: NextRequest) {
  return corsCheck(req) ?? new NextResponse(null, { status: 204 });
}
