import { NextRequest, NextResponse } from "next/server";
import { corsCheck, requireAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

// GET /api/agent-status — returns recent run history from agent_runs table
export async function GET(req: NextRequest) {
  const corsError = corsCheck(req);
  if (corsError) return corsError;

  const rateLimitError = await rateLimit(req);
  if (rateLimitError) return rateLimitError;

  const { error: adminError } = await requireAdmin(req);
  if (adminError) return adminError;

  try {
    const { getAdminSupabase } = await import("@/lib/supabase");
    const admin = getAdminSupabase();

    const { data, error } = await admin
      .from("agent_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(20);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ runs: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function OPTIONS(req: NextRequest) {
  return corsCheck(req) ?? new NextResponse(null, { status: 204 });
}
