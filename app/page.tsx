// ProMed VA root: bounce logged-in team members to the Overview
// dashboard (platform demo entry point). Everyone else lands on /intake
// — the public chiropractor application form is the marketing surface.

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export default async function Root() {
  try {
    const cookieStore = await cookies()

    // Demo session — short-circuit to the platform Overview
    if (cookieStore.get('chiropillar-demo')?.value === '1') {
      redirect('/overview')
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const sk = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (url && anon && sk) {
      const supabase = createServerClient(url, anon, {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() { /* read-only in server component */ },
        },
      })
      const { data: { session } } = await supabase.auth.getSession()
      const email = session?.user?.email?.toLowerCase()
      if (email) {
        const admin = createClient(url, sk, { auth: { persistSession: false } })
        const { data: member } = await admin
          .from('chiropillar_team')
          .select('email')
          .eq('email', email)
          .eq('active', true)
          .maybeSingle()
        if (member) redirect('/overview')
      }
    }
  } catch {
    // Fall through to public intake
  }
  redirect('/intake')
}
