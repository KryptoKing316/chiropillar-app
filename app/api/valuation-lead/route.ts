// Public valuation-lead capture · POST-value email collection from /value-my-clinic
// Fires AFTER the chiro has seen their valuation. Never gates the experience.
// Lands the lead in Supabase (chiropillar_valuation_leads) for Wagner / Eric.

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

type Payload = {
  email: string
  phone?: string
  full_name?: string
  practice_name?: string
  val_mid?: number
  revenue?: number
  owner_role?: string
  new_patients_mo?: number
}

// ── GoHighLevel inbound webhook · fires for every valid lead ──
// Set GHL_VALUATION_WEBHOOK_URL in the env to the webhook URL from a
// GoHighLevel "Inbound Webhook" trigger. We POST a flat JSON payload that
// GHL maps to the lead's contact fields. If the env var isn't set, we just
// skip the GHL push silently (Supabase still captures the lead).
async function forwardToGHL(payload: Record<string, unknown>) {
  const url = process.env.GHL_VALUATION_WEBHOOK_URL
  if (!url) return
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    console.error('[valuation-lead] GHL forward failed:', e instanceof Error ? e.message : String(e))
  }
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
      phone: (body.phone || '').replace(/\D/g, '').slice(0, 20) || null,
      full_name: body.full_name?.slice(0, 200) || null,
      practice_name: body.practice_name?.slice(0, 200) || null,
      estimated_value_mid: typeof body.val_mid === 'number' ? Math.round(body.val_mid) : null,
      revenue: typeof body.revenue === 'number' ? Math.round(body.revenue) : null,
      owner_role: body.owner_role?.slice(0, 80) || null,
      new_patients_mo: typeof body.new_patients_mo === 'number' ? Math.round(body.new_patients_mo) : null,
      source: '/value-my-clinic',
      created_at: new Date().toISOString(),
    }

    // Fire GHL webhook in parallel with Supabase insert. Don't await — we
    // shouldn't slow the response just because GHL is slow.
    forwardToGHL({
      ...row,
      tag: 'chiropillar-valuation-lead',
      utm_source: 'value-my-clinic',
    })

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
