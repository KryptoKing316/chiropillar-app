import { spawn } from "child_process";
import path from "path";

/**
 * Spawns KB_Orchestrator.py as a detached background process.
 * Returns immediately — the Python process keeps running after the API responds.
 * Progress is written directly to Supabase agent_runs by the Python script.
 *
 * Working dir is set to the python/ folder so .env, google_credentials.json,
 * and kb_memory.json are all found automatically.
 */
export function spawnOrchestrator(
  type: "seller" | "buyer" | "both" | "quick",
  runId: string
): { pid: number | undefined; error?: string } {
  try {
    // From kingdom-broker/, go up one level to the project root
    const projectRoot = path.join(process.cwd(), "..");
    const scriptPath = path.join(projectRoot, "KB_Orchestrator.py");
    const pythonCwd = path.join(projectRoot, "python");

    const flags: string[] = ["--run-id", runId];
    if (type === "seller") flags.push("--seller-only");
    else if (type === "buyer") flags.push("--buyer-only");
    else if (type === "quick") flags.push("--quick", "--buyer-only");
    // "both" = no extra flags (default parallel run)

    console.log(
      `[KB Orchestrator] Spawning: python3 ${scriptPath} ${flags.join(" ")}`
    );
    console.log(`[KB Orchestrator] Working dir: ${pythonCwd}`);

    const child = spawn("python3", [scriptPath, ...flags], {
      cwd: pythonCwd,
      detached: true,
      stdio: "ignore", // fully detached — output goes to Python's own stdout
    });

    child.unref(); // let Node exit without waiting for Python

    console.log(`[KB Orchestrator] Spawned PID ${child.pid}`);
    return { pid: child.pid };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[KB Orchestrator] Spawn failed: ${msg}`);
    return { pid: undefined, error: msg };
  }
}
