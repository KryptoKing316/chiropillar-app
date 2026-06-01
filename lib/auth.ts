import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { ALLOWED_ORIGINS } from "@/next.config";

// Validates session from Authorization header OR browser cookies.
// Tries the token first (explicit), falls back to cookies (browser session).
export async function requireSession(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === "production") {
      return {
        session: null,
        user: null,
        error: NextResponse.json({ error: "Auth service not configured" }, { status: 503 }),
      };
    }
    return { session: null, user: null, error: null };
  }

  // 1. Try Authorization header (explicit token from client)
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "").trim();

  if (token) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (!error && user) {
      return { session: { user, access_token: token } as never, user, error: null };
    }
  }

  // 2. Fall back to cookies (browser session set by /auth/callback)
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return req.cookies.getAll(); },
      setAll() {}, // read-only in API routes
    },
  });

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    return {
      session: null,
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { session, user: session.user, error: null };
}

// Whitelisted admin emails (can upload knowledge, manage personas, etc.)
const ADMIN_EMAILS = [
  "eric@kingdombroker.com",
  "thiago.souza@nexxess.com",
  "scott.mcgrath@nexxess.com",
];

// Checks if the user has admin role in their profile
export async function requireAdmin(req: NextRequest) {
  const { session, user, error } = await requireSession(req);
  if (error) return { user: null, error };

  // In dev/demo mode without Supabase, skip admin check
  if (!user) return { user: null, error: null };

  const userEmail = (user.email || "").toLowerCase();
  const isWhitelisted = ADMIN_EMAILS.includes(userEmail);

  if (isWhitelisted) {
    return { user, error: null };
  }

  const { getAdminSupabase } = await import("@/lib/supabase");
  const admin = getAdminSupabase();

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return {
      user: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { user, error: null };
}

// Validates that the authenticated user owns the requested deal
// Returns 403 (not 404) if the deal exists but belongs to someone else
export async function requireDealOwnership(req: NextRequest, dealId: string) {
  const { session, user, error } = await requireSession(req);
  if (error) return { deal: null, error };
  if (!user) return { deal: null, error: null };

  const { getAdminSupabase } = await import("@/lib/supabase");
  const admin = getAdminSupabase();

  // First check if the deal exists at all
  const { data: deal } = await admin
    .from("deals")
    .select("id, seller_id")
    .eq("id", dealId)
    .single();

  if (!deal) {
    // Return 403 not 404 — don't reveal whether deal exists
    return {
      deal: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  if (deal.seller_id !== user.id) {
    return {
      deal: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { deal, error: null };
}

// Validate and enforce CORS for API routes
export function corsCheck(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin");

  // Allow requests with no origin header (same-origin, server-to-server)
  if (!origin) return null;

  if (!ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json({ error: "CORS: origin not allowed" }, { status: 403 });
  }

  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  return null;
}
