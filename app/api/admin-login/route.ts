import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin-login
 * Emergency admin bypass — generates a magic link without sending an email.
 * Bypasses Supabase email rate limits entirely.
 * Protected by ADMIN_LOGIN_CODE env var — never expose this route publicly.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const code = body.code as string;
  const expectedCode = process.env.ADMIN_LOGIN_CODE;

  if (!expectedCode) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  if (!code || code !== expectedCode) {
    // Generic error — don't reveal whether code was close or wrong
    return NextResponse.json({ error: "Invalid code" }, { status: 403 });
  }

  try {
    const { getAdminSupabase } = await import("@/lib/supabase");
    const admin = getAdminSupabase();

    // Generate a magic link without sending an email
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: "eric@kingdombroker.com",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/overview`,
      },
    });

    if (error || !data?.properties?.action_link) {
      return NextResponse.json({ error: "Failed to generate link" }, { status: 500 });
    }

    return NextResponse.json({ link: data.properties.action_link });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
