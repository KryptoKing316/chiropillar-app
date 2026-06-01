import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!

const ALLOWED_FIELDS = new Set([
  'status', 'listed_at', 'public_title', 'public_summary',
  'industry', 'city_region', 'state', 'revenue_band', 'ebitda_band',
  'asking_price_band', 'years_in_business', 'team_size_band',
  'private_business_name', 'private_owner_name'
])

// PATCH /api/exchange/deals/[id] — update a deal (own firm only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: { get: (name: string) => cookieStore.get(name)?.value },
  })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE)
  const isAdmin = session.user.email === 'eric@kingdombroker.com'

  // Verify own firm
  const { data: member } = await admin
    .from('coalition_members')
    .select('id, firm_id')
    .eq('user_id', session.user.id)
    .single()

  const { data: deal } = await admin
    .from('coalition_deals')
    .select('id, source_firm_id')
    .eq('id', id)
    .single()

  if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })

  const isOwnFirm = member?.firm_id === deal.source_firm_id || isAdmin
  if (!isOwnFirm) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Filter allowed fields
  const body = await req.json()
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const [k, v] of Object.entries(body)) {
    if (ALLOWED_FIELDS.has(k)) update[k] = v
  }

  const { error } = await admin
    .from('coalition_deals')
    .update(update)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
