// Public valuation-lead capture · POST-value email collection from /value-my-clinic
// Fires AFTER the chiro has seen their valuation. Never gates the experience.
// Lands the lead in Supabase (chiropillar_valuation_leads) for Wagner / Eric.

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

type Payload = {
  email: string
  full_name?: string
  practice_name?: string
  val_mid?: number
  revenue?: number
  owner_role?: string
  new_patients_mo?: number
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload
    const email = (body.email || '').trim().toLowerCase()
    if (!email.includes('@') || email.length > 200) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const sk  = process.env.SUPABASE_SERVICE_ROLE_KEY

    // If Supabase isn't configured (preview / local), still return 200 so the
    // public UI doesn't show an error at the moment of value.
    if (!url || !sk) {
      return NextResponse.json({ ok: true, stored: false, reason: 'supabase_unconfigured' })
    }

    const supa = createClient(url, sk, { auth: { persistSession: false } })

    // Try the dedicated valuation-leads table first. If it doesn't exist,
    // fall back to chiropillar_targets (the existing intake table).
    const row = {
      email,
      full_name: body.full_name?.slice(0, 200) || null,
      practice_name: body.practice_name?.slice(0, 200) || null,
      estimated_value_mid: typeof body.val_mid === 'number' ? Math.round(body.val_mid) : null,
      revenue: typeof body.revenue === 'number' ? Math.round(body.revenue) : null,
      owner_role: body.owner_role?.slice(0, 80) || null,
      new_patients_mo: typeof body.new_patients_mo === 'number' ? Math.round(body.new_patients_mo) : null,
      source: '/value-my-clinic',
      created_at: new Date().toISOString(),
    }

    const tryDedicated = await supa.from('chiropillar_valuation_leads').insert(row)
    if (!tryDedicated.error) {
      return NextResponse.json({ ok: true, stored: true, table: 'chiropillar_valuation_leads' })
    }

    // Fallback — log to chiropillar_targets so the lead isn't lost
    const fallbackRow = {
      email,
      full_name: row.full_name,
      practice_name: row.practice_name,
      gross_revenue_last_year: row.revenue,
      owner_role: row.owner_role,
      new_patients_per_month_avg_2yr: row.new_patients_mo,
      valuation_mid: row.estimated_value_mid,
      source: '/value-my-clinic',
      qualification: 'maybe',
      created_at: row.created_at,
    }
    const fallback = await supa.from('chiropillar_targets').insert(fallbackRow)
    if (!fallback.error) {
      return NextResponse.json({ ok: true, stored: true, table: 'chiropillar_targets' })
    }

    // Final fallback — return 200 so UI shows success, but flag it so we can
    // backfill from server logs.
    console.error('[valuation-lead] both inserts failed:', { dedicated: tryDedicated.error?.message, fallback: fallback.error?.message })
    return NextResponse.json({ ok: true, stored: false, reason: 'tables_missing' })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[valuation-lead] error:', msg)
    return NextResponse.json({ ok: true, stored: false, reason: 'caught_error' })
  }
}
