import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Block demo writes
  const email = session.user.email ?? ''
  if (!email || email === 'demo@kingdombroker.com') {
    return NextResponse.json({ error: 'Demo accounts cannot save data.' }, { status: 403 })
  }

  // Check if user was invited as seller by admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const isAdmin = email === 'eric@kingdombroker.com' || profile?.role === 'admin'
  const isSeller = profile?.role === 'seller'
  if (!isAdmin && !isSeller) {
    return NextResponse.json({ error: 'Seller onboarding requires an invitation from the Kingdom Broker team.' }, { status: 403 })
  }

  const body = await req.json()
  const userId = session.user.id

  // Build intake snapshot for ai_summary (used by CIM Builder)
  const intakeSummary = JSON.stringify({
    website: body.website,
    linkedin_url: body.linkedin_url,
    reason_for_selling: body.reason_for_selling,
    top_clients: body.top_clients,
    key_staff: body.key_staff,
    defensibility: body.defensibility,
    owner_role: body.owner_role,
    owner_name: body.owner_name,
    owner_phone: body.owner_phone,
    best_time_to_call: body.best_time_to_call,
    intake_completed_at: new Date().toISOString(),
  })

  // Check for existing deal
  const { data: existing } = await supabase
    .from('deals')
    .select('id')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const dealPayload = {
    seller_id: userId,
    business_name: body.business_name ?? null,
    industry: body.industry ?? null,
    city: body.city ?? null,
    state: body.state ?? null,
    years_in_business: parseInt(body.years_in_business) || null,
    employee_count: parseInt(body.employee_count) || null,
    ttm_revenue: body.revenue_num || null,
    ttm_ebitda: body.ebitda_num || null,
    asking_price: body.asking_price_num || null,
    ai_summary: intakeSummary,
    status: 'onboarding',
    updated_at: new Date().toISOString(),
  }

  let dealId: string

  if (existing?.id) {
    // Update existing deal
    const { error } = await supabase
      .from('deals')
      .update(dealPayload)
      .eq('id', existing.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    dealId = existing.id
  } else {
    // Insert new deal
    const { data: newDeal, error } = await supabase
      .from('deals')
      .insert(dealPayload)
      .select('id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    dealId = newDeal.id
  }

  // Update profile with owner name + phone
  await supabase.from('profiles').upsert({
    id: userId,
    email,
    full_name: body.owner_name ?? null,
    phone: body.owner_phone ?? null,
    role: 'seller',
  })

  // Log activity
  await supabase.from('activity_log').insert({
    deal_id: dealId,
    event_type: 'seller_intake_complete',
    event_description: `Seller intake completed for ${body.business_name ?? 'unnamed business'}`,
    metadata: { industry: body.industry, city: body.city, state: body.state },
  })

  // Auto-create Digital Twin persona for this seller
  try {
    const { getAdminSupabase } = await import('@/lib/supabase')
    const admin = getAdminSupabase()
    const bizName = body.business_name ?? 'My Business'
    const slug = bizName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60)

    // Check if persona already exists for this seller
    const { data: existingPersona } = await admin
      .from('digital_twin_personas')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    let personaId: string

    if (existingPersona) {
      personaId = existingPersona.id
    } else {
      const { data: newPersona, error: pErr } = await admin
        .from('digital_twin_personas')
        .insert({
          name: body.owner_name ?? 'Business Owner',
          slug,
          title: 'CEO',
          company: bizName,
          persona_type: 'seller',
          expertise: `${body.industry ?? 'Business'} operations, customers, team, growth opportunities`,
          greeting: `Hi, I am the Digital Twin for ${bizName}. Ask me anything about the business, our customers, team, operations, or growth opportunities.`,
          is_published: false,
          created_by: userId,
        })
        .select('id')
        .single()

      if (pErr) throw pErr
      personaId = newPersona.id
    }

    // Seed initial knowledge from intake data
    const intakeKnowledge = [
      `BUSINESS OVERVIEW\nBusiness Name: ${bizName}\nIndustry: ${body.industry ?? 'Not specified'}\nLocation: ${body.city ?? ''}, ${body.state ?? ''}\nYears in Business: ${body.years_in_business ?? 'Not specified'}\nEmployees: ${body.employee_count ?? 'Not specified'}\nWebsite: ${body.website ?? 'None provided'}`,
      `FINANCIAL SNAPSHOT\nAnnual Revenue: ${body.revenue_num ? '$' + Number(body.revenue_num).toLocaleString() : 'Not provided'}\nEBITDA: ${body.ebitda_num ? '$' + Number(body.ebitda_num).toLocaleString() : 'Not provided'}\nAsking Price: ${body.asking_price_num ? '$' + Number(body.asking_price_num).toLocaleString() : 'Not provided'}\nReason for Selling: ${body.reason_for_selling ?? 'Not provided'}`,
      body.top_clients ? `KEY CUSTOMERS\n${body.top_clients}` : null,
      body.key_staff ? `KEY EMPLOYEES\n${body.key_staff}` : null,
      body.defensibility ? `COMPETITIVE ADVANTAGE\n${body.defensibility}` : null,
      body.owner_role ? `OWNER ROLE\n${body.owner_role}` : null,
    ].filter(Boolean) as string[]

    // Clear old intake knowledge and insert fresh
    await admin.from('digital_twin_knowledge').delete()
      .eq('persona_id', personaId)
      .eq('source_name', 'Seller Intake')

    const rows = intakeKnowledge.map((content, i) => ({
      persona_id: personaId,
      source_type: 'document' as const,
      source_name: 'Seller Intake',
      content,
      chunk_index: i,
    }))

    await admin.from('digital_twin_knowledge').insert(rows)

    // Update deal with persona reference
    await supabase.from('deals').update({
      ai_buyer_profile: JSON.stringify({ digital_twin_slug: slug, digital_twin_id: personaId }),
    }).eq('id', dealId)

  } catch (twinErr) {
    // Non-fatal: don't block onboarding if twin creation fails
    console.error('[Digital Twin] Auto-create failed:', twinErr)
  }

  return NextResponse.json({ success: true, deal_id: dealId })
}
