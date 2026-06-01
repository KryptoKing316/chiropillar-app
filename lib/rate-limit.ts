import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Rate Limiter — 60 requests per 60 seconds per IP
//
// Uses Upstash Redis when UPSTASH_REDIS_REST_URL is configured (production).
// Falls back to an in-memory Map when Redis is not configured (development).
// Swap to Upstash for production: set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
// ---------------------------------------------------------------------------

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 60;

// Stricter limits for expensive endpoints (agent runs, AI calls)
const AGENT_WINDOW_MS = 3_600_000; // 1 hour
const AGENT_MAX_REQUESTS = 5;      // max 5 pipeline runs per hour per IP

// In-memory fallback (single server instance only — fine for dev, not for multi-replica prod)
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

async function checkUpstash(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MAX_REQUESTS, "60 s"),
    analytics: true,
  });

  const { success, remaining } = await ratelimit.limit(ip);
  return { allowed: success, remaining };
}

function checkMemory(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = memoryStore.get(ip);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  entry.count += 1;
  const remaining = Math.max(0, MAX_REQUESTS - entry.count);
  return { allowed: entry.count <= MAX_REQUESTS, remaining };
}

// Stricter rate limit for agent pipeline runs (5 per hour per IP)
export async function rateLimitAgentRun(req: NextRequest): Promise<NextResponse | null> {
  const ip = getClientIp(req);
  const key = `agent_run:${ip}`;
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + AGENT_WINDOW_MS });
    return null;
  }

  entry.count += 1;
  if (entry.count > AGENT_MAX_REQUESTS) {
    return NextResponse.json(
      { error: "Too many pipeline runs. Maximum 5 per hour." },
      { status: 429, headers: { "Retry-After": "3600" } }
    );
  }
  return null;
}

// Call this at the top of every API route handler
export async function rateLimit(req: NextRequest): Promise<NextResponse | null> {
  const ip = getClientIp(req);
  let allowed: boolean;
  let remaining: number;

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      ({ allowed, remaining } = await checkUpstash(ip));
    } catch {
      // If Redis is unreachable, fail open (allow the request) but log it
      console.warn("[rate-limit] Upstash unavailable, failing open for IP:", ip);
      return null;
    }
  } else {
    ({ allowed, remaining } = checkMemory(ip));
  }

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before retrying." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Limit": String(MAX_REQUESTS),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // Allowed — caller can add X-RateLimit-Remaining header to response if desired
  return null;
}
