import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (n: string) => cookieStore.get(n)?.value } }
    )

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ email: null, isAdmin: false, isDemo: true })
    }

    const email = session.user.email ?? ''
    const isDemo = !email || email === 'demo@kingdombroker.com'

    const ADMIN_EMAILS = [
      'eric@kingdombroker.com',
      'thiago.souza@nexxess.com',
      'scott.mcgrath@nexxess.com',
    ]
    let isAdmin = ADMIN_EMAILS.includes(email.toLowerCase())
    let role = 'visitor'

    if (!isDemo) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      if (profile?.role) role = profile.role
      if (profile?.role === 'admin') isAdmin = true
    }

    if (isAdmin) role = 'admin'

    return NextResponse.json({ email, isAdmin, isDemo, role })
  } catch {
    return NextResponse.json({ email: null, isAdmin: false, isDemo: true })
  }
}
