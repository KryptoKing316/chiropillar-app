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

  try {
    const cookieStore = await cookies()
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
  // If Supabase IS configured AND user isn't on the whitelist → /login
  // If Supabase isn't configured (local dev) → allow access so we can preview UI
  const supaConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  if (supaConfigured && !isAuthorized) {
    redirect('/login')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--kb-bg)', overflow: 'hidden' }}>
      <Sidebar userEmail={userEmail ?? 'preview@chiropillar.com'} isDemo={!isAuthorized} isAdmin={isAuthorized} />
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--kb-bg)' }}>
        {children}
      </main>
    </div>
  )
}
