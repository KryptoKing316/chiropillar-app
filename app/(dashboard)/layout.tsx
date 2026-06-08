import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Sidebar from '@/components/dashboard/Sidebar'

// ProMed VA dashboard layout · 3-user whitelist enforcement
// Only emails in the chiropillar_team table can access /calculator, /targets, etc.
// Everyone else gets redirected to /login.
//
// Local-dev shortcut: if Supabase isn't configured, allow access in demo mode
// so the calculator can still be opened during build/preview.

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  let userEmail: string | undefined
  let isAuthorized = false
  let isDemoSession = false

  try {
    const cookieStore = await cookies()

    // ── Demo session check (precedes auth) ──
    // The "View Live Demo" button on /login POSTs to /api/demo-mode which sets
    // this cookie for 30 min. While it's present, anyone can browse the platform
    // in read-only mode without a magic link.
    isDemoSession = cookieStore.get('chiropillar-demo')?.value === '1'

    // @supabase/ssr requires getAll/setAll on the cookies adapter.
    // setAll is a no-op here — server components can't mutate response cookies;
    // session refresh happens via the /auth/callback route + middleware.
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() { /* read-only in server component context */ },
        },
      }
    )
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user?.email) {
      userEmail = session.user.email.toLowerCase()

      // Validate against the whitelist via service-role client.
      // chiropillar_team is the canonical whitelist; if that table doesn't
      // exist in this Supabase project (early-stage / migrated from KB app),
      // we fall back to checking profiles.role IN ('admin','viewer').
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const sk  = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (url && sk) {
        const admin = createClient(url, sk, { auth: { persistSession: false } })
        const teamCheck = await admin
          .from('chiropillar_team')
          .select('email, active')
          .eq('email', userEmail)
          .eq('active', true)
          .maybeSingle()
        if (teamCheck.data) {
          isAuthorized = true
        } else {
          // Fallback: profiles table (the shared KB app profiles table)
          const profCheck = await admin
            .from('profiles')
            .select('email, role')
            .eq('email', userEmail)
            .in('role', ['admin', 'viewer'])
            .maybeSingle()
          isAuthorized = !!profCheck.data
        }
      }
    }
  } catch {
    // Supabase not configured (local dev / preview) — fall through
  }

  // ── Production guard ──
  // If Supabase IS configured AND user isn't on the whitelist AND no demo cookie → /login
  // If Supabase isn't configured (local dev) → allow access so we can preview UI
  const supaConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  if (supaConfigured && !isAuthorized && !isDemoSession) {
    redirect('/login')
  }

  // Demo mode renders identically to admin — no watermark, no banner.
  // Wagner / McGrath / prospective applicants should see the platform exactly
  // as a logged-in admin would, with sample data populating tables.
  //
  // ERIC-ONLY surfaces (future internal tools) — gated by email.
  // Both Eric@kingdombroker.com and ericcskeldon@gmail.com are recognized.
  const ericEmails = ['eric@kingdombroker.com', 'ericcskeldon@gmail.com']
  const isEricOnly = !!userEmail && ericEmails.includes(userEmail.toLowerCase())

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--kb-bg)', overflow: 'hidden' }}>
      <Sidebar userEmail={userEmail ?? 'demo@chiropillar.com'} isDemo={false} isAdmin={true} isEricOnly={isEricOnly} />
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--kb-bg)' }}>
        {children}
      </main>
    </div>
  )
}
