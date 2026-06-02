import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Sidebar from '@/components/dashboard/Sidebar'

// ChiroPillar dashboard layout · 3-user whitelist enforcement
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

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
    )
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user?.email) {
      userEmail = session.user.email.toLowerCase()

      // Validate against chiropillar_team whitelist via service-role client
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const sk  = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (url && sk) {
        const admin = createClient(url, sk, { auth: { persistSession: false } })
        const { data: member } = await admin
          .from('chiropillar_team')
          .select('email, active')
          .eq('email', userEmail)
          .eq('active', true)
          .maybeSingle()
        isAuthorized = !!member
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

  const showAsDemo = isDemoSession && !isAuthorized

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--kb-bg)', overflow: 'hidden' }}>
      <Sidebar userEmail={userEmail ?? 'demo@chiropillar.com'} isDemo={showAsDemo} isAdmin={isAuthorized} />
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--kb-bg)' }}>
        {showAsDemo && (
          <div style={{
            position: 'sticky', top: 0, zIndex: 50,
            background: 'linear-gradient(90deg, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0.08) 100%)',
            borderBottom: '1px solid rgba(201,168,76,0.35)',
            padding: '10px 28px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: '#8B6914',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                padding: '3px 9px', borderRadius: 999, background: '#C9A84C', color: '#0B1B3E',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700,
                letterSpacing: '0.16em', textTransform: 'uppercase',
              }}>DEMO</span>
              <span>Read-only · 30 min session · sample data shown for /targets</span>
            </div>
            <a href="/login" style={{ color: '#8B6914', fontWeight: 600, textDecoration: 'underline', fontSize: 12 }}>
              Log in for live access →
            </a>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
