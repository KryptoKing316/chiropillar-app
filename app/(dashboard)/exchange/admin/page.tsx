import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import AdminClient from './client'

export const metadata = { title: 'Exchange Admin · Kingdom Broker' }

export default async function ExchangeAdminPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login?next=/exchange/admin')

  const isAdmin = session.user.email === 'eric@kingdombroker.com'
  if (!isAdmin) redirect('/exchange')

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: firms } = await admin
    .from('coalition_firms')
    .select('id, slug, firm_name, hq_city, hq_state, tier, equity_pct, status, primary_contact_name, primary_contact_email')
    .order('created_at')

  const { data: members } = await admin
    .from('coalition_members')
    .select('id, first_name, last_name, email, title, role, is_active, user_id, created_at, coalition_firms!firm_id(slug, firm_name)')
    .order('created_at', { ascending: false })

  return <AdminClient firms={firms ?? []} members={members ?? []} />
}
