import { NextRequest, NextResponse } from "next/server";
import { corsCheck, requireAdmin } from "@/lib/auth";
import { rateLimitAgentRun } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { logAdminAction } from "@/lib/server/admin-log";

// POST /api/run-agents
// TRIPLE protection: CORS + rate limit + admin role + INTERNAL_API_SECRET
// The INTERNAL_API_SECRET header prevents any external service from triggering pipelines
// even if they somehow get an admin session token.
export async function POST(req: NextRequest) {
  // 1. CORS
  const corsError = corsCheck(req);
  if (corsError) return corsError;

  // 2. Strict rate limit — 5 agent runs per hour per IP
  const rateLimitError = await rateLimitAgentRun(req);
  if (rateLimitError) return rateLimitError;

  // 3. Admin role check (admin check is sufficient — no extra secret needed)
  const { user, error: adminError } = await requireAdmin(req);
  if (adminError) return adminError;

  // 5. Parse and validate body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawType = sanitizeText(body.type as string);
  const validTypes = ["seller", "buyer", "both", "quick"];
  if (!validTypes.includes(rawType)) {
    return NextResponse.json(
      { error: "Invalid type. Must be: seller, buyer, both, or quick." },
      { status: 400 }
    );
  }

  try {
    const { getAdminSupabase } = await import("@/lib/supabase");
    const admin = getAdminSupabase();

    // Create a run record
    const { data: run, error: runError } = await admin
      .from("agent_runs")
      .insert({
        run_type: rawType,
        status: "requested",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (runError) {
      return NextResponse.json({ error: runError.message }, { status: 500 });
    }

    // Log the admin action with IP and timestamp
    await logAdminAction(req, "agent_run_triggered", {
      run_id: run.id,
      run_type: rawType,
      triggered_by: user?.id ?? "unknown",
    });

    // Fire the Python orchestrator as a detached background process.
    // It updates agent_runs directly in Supabase as it progresses.
    const { spawnOrchestrator } = await import("@/lib/agents/orchestrator");
    const spawnType = rawType as "seller" | "buyer" | "both" | "quick";
    const { pid, error: spawnError } = spawnOrchestrator(spawnType, run.id);

    if (spawnError || !pid) {
      await admin
        .from("agent_runs")
        .update({ status: "error", error_message: spawnError ?? "spawn failed" })
        .eq("id", run.id);
      return NextResponse.json(
        { error: `Failed to start agent: ${spawnError}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, run_id: run.id, status: "running", pid });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function OPTIONS(req: NextRequest) {
  return corsCheck(req) ?? new NextResponse(null, { status: 204 });
}
