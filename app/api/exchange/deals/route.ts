import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!

// POST /api/exchange/deals
// Creates a new Exchange deal. The CIM upload + AI valuation runs async after create.
export async function POST(req: NextRequest) {
  // Auth
  const cookieStore = await cookies()
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: { get: (name: string) => cookieStore.get(name)?.value },
  })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Service-role client for cross-RLS work
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE)

  // Get member record (or fall back to KB admin)
  const isAdmin = session.user.email === 'eric@kingdombroker.com'
  let memberRow: { id: string; firm_id: string } | null = null

  const { data: m } = await admin
    .from('coalition_members')
    .select('id, firm_id')
    .eq('user_id', session.user.id)
    .eq('is_active', true)
    .single()
  memberRow = m as typeof memberRow

  if (!memberRow && isAdmin) {
    // For Eric (admin), use KB firm and create a stub member if needed
    const { data: kbFirm } = await admin
      .from('coalition_firms')
      .select('id')
      .eq('slug', 'kingdom-broker')
      .single()
    if (kbFirm) {
      // upsert eric as a member
      const { data: ericMember } = await admin
        .from('coalition_members')
        .upsert({
          firm_id: kbFirm.id,
          user_id: session.user.id,
          first_name: 'Eric',
          last_name: 'Skeldon',
          email: 'eric@kingdombroker.com',
          title: 'Founder',
          role: 'admin',
          is_active: true,
        }, { onConflict: 'email' })
        .select('id, firm_id')
        .single()
      memberRow = ericMember
    }
  }

  if (!memberRow) {
    return NextResponse.json({ error: 'Not a Exchange member. Contact Eric@KingdomBroker.com to join.' }, { status: 403 })
  }

  // Parse form data
  const fd = await req.formData()
  const publicTitle = String(fd.get('public_title') || '').trim()
  if (!publicTitle) {
    return NextResponse.json({ error: 'Public title is required' }, { status: 400 })
  }

  const dealData = {
    source_firm_id: memberRow.firm_id,
    source_member_id: memberRow.id,
    public_title: publicTitle,
    public_summary: String(fd.get('public_summary') || ''),
    industry: String(fd.get('industry') || ''),
    city_region: String(fd.get('city_region') || ''),
    state: String(fd.get('state') || ''),
    revenue_band: String(fd.get('revenue_band') || ''),
    ebitda_band: String(fd.get('ebitda_band') || ''),
    asking_price_band: String(fd.get('asking_price_band') || ''),
    years_in_business: fd.get('years_in_business') ? parseInt(String(fd.get('years_in_business')), 10) : null,
    team_size_band: String(fd.get('team_size_band') || ''),
    private_business_name: String(fd.get('private_business_name') || ''),
    private_owner_name: String(fd.get('private_owner_name') || ''),
    status: 'draft' as const,
  }

  const { data: deal, error: insertErr } = await admin
    .from('coalition_deals')
    .insert(dealData)
    .select('id')
    .single()

  if (insertErr || !deal) {
    return NextResponse.json({ error: insertErr?.message || 'Failed to create deal' }, { status: 500 })
  }

  // Optional: CIM upload
  const cimFile = fd.get('cim_pdf') as File | null
  if (cimFile && cimFile.size > 0) {
    const path = `coalition-deals/${deal.id}/cim.pdf`
    const buf = Buffer.from(await cimFile.arrayBuffer())
    const { error: uploadErr } = await admin.storage
      .from('coalition-cim')
      .upload(path, buf, { contentType: 'application/pdf', upsert: true })

    if (!uploadErr) {
      await admin.from('coalition_deals').update({ cim_pdf_path: path }).eq('id', deal.id)
      // TODO Week 2: trigger async AI valuation extraction here
      // For Week 1 we just store the file
    }
  }

  return NextResponse.json({ id: deal.id, status: 'draft' }, { status: 201 })
}

// GET /api/exchange/deals
// List deals visible to the requesting member
export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: { get: (name: string) => cookieStore.get(name)?.value },
  })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE)

  const url = new URL(req.url)
  const status = url.searchParams.get('status')?.split(',') ?? ['listed', 'matched']
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10), 100)
  const industry = url.searchParams.get('industry')
  const state = url.searchParams.get('state')

  let query = admin
    .from('coalition_deals')
    .select('id, source_firm_id, public_title, public_summary, industry, city_region, state, revenue_band, ebitda_band, asking_price_band, years_in_business, team_size_band, ai_valuation_low, ai_valuation_mid, ai_valuation_high, status, listed_at, created_at, coalition_firms!source_firm_id(firm_name, logo_url, brand_primary)')
    .in('status', status)
    .order('listed_at', { ascending: false, nullsFirst: false })
    .limit(limit)

  if (industry) query = query.eq('industry', industry)
  if (state) query = query.eq('state', state)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deals: data ?? [] })
}
