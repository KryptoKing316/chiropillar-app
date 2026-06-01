// ============================================================
// Demo Mode Guard
// Enforces read-only access and session expiry for demo accounts.
// ============================================================

export const DEMO_EMAIL = 'demo@kingdombroker.com'
export const DEMO_SESSION_DURATION_MS = 4 * 60 * 60 * 1000 // 4 hours
export const DEMO_SESSION_KEY = 'kb_demo_started_at'

// Server-side: checks if the current user is the demo account
// Used in API routes to block writes
export function isDemoUser(userEmail: string | undefined | null): boolean {
  return userEmail?.toLowerCase() === DEMO_EMAIL
}

// Server-side: block write operations for demo users
// Returns a NextResponse error if demo user attempts a write, otherwise null
export async function blockDemoWrites(req: import('next/server').NextRequest) {
  const { requireSession } = await import('@/lib/auth')
  const { user } = await requireSession(req)

  if (!user) return null // Auth check handles this

  if (isDemoUser(user.email)) {
    return new (await import('next/server')).NextResponse(
      JSON.stringify({ error: 'Demo accounts are read-only. Sign up for full access.' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  return null
}
