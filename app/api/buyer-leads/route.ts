import { NextRequest, NextResponse } from "next/server";
import { corsCheck, requireAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText, sanitizeInt } from "@/lib/sanitize";
import { logAdminAction } from "@/lib/server/admin-log";

// GET /api/buyer-leads — admin only
// Query params: ?run_id=xxx&sort=fit_score&type=family_office&page=1
export async function GET(req: NextRequest) {
  const corsError = corsCheck(req);
  if (corsError) return corsError;

  const rateLimitError = await rateLimit(req);
  if (rateLimitError) return rateLimitError;

  const { user, error: adminError } = await requireAdmin(req);
  if (adminError) return adminError;
  await logAdminAction(req, "buyer_leads_viewed", { user_id: user?.id });

  try {
    const { getAdminSupabase } = await import("@/lib/supabase");
    const admin = getAdminSupabase();

    const { searchParams } = new URL(req.url);
    const runId = sanitizeText(searchParams.get("run_id") || "");
    const sort = sanitizeText(searchParams.get("sort") || "fit_score");
    const investorType = sanitizeText(searchParams.get("type") || "");
    const page = sanitizeInt(searchParams.get("page") || "1", 1, 1000) ?? 1;
    const pageSize = 50;

    let query = admin
      .from("buyer_leads")
      .select("*")
      .order(sort === "fit_score" ? "fit_score" : "date_found", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (runId) query = query.eq("run_id", runId);
    if (investorType) query = query.eq("investor_type", investorType);

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
