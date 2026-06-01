import { NextRequest, NextResponse } from "next/server";
import { corsCheck } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

// GET /api/health — public endpoint, no auth required
// Used for uptime monitoring. Still rate-limited and CORS-checked.
export async function GET(req: NextRequest) {
  const corsError = corsCheck(req);
  if (corsError) return corsError;

  const rateLimitError = await rateLimit(req);
  if (rateLimitError) return rateLimitError;

  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}

export async function OPTIONS(req: NextRequest) {
  return corsCheck(req) ?? new NextResponse(null, { status: 204 });
}
