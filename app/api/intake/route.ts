// PROMEDVA Intake API · POST /api/intake
// Receives chiropractor partner-application submissions from /intake
// and writes to chiropillar_targets in the PROMEDVA Supabase project.
//
// Spec: Dr. Scott Wagner intake form (see app/intake/page.tsx for the 7 metrics)

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Server-side validation: require contact basics + practice name
    const required = ['full_name', 'email', 'practice_name'] as const
    for (const f of required) {
      if (!body[f] || typeof body[f] !== 'string') {
        return NextResponse.json({ error: `Missing required field: ${f}` }, { status: 400 })
      }
    }

    // Strip the marketing-consent field from the DB write (legal trail kept in app log only)
    const payload = {
      full_name:                       String(body.full_name).slice(0, 200),
      email:                           String(body.email).toLowerCase().slice(0, 200),
      phone:                           String(body.phone || '').slice(0, 40),
      practice_name:                   String(body.practice_name).slice(0, 200),
      city:                            String(body.city || '').slice(0, 100),
      state:                           String(body.state || '').slice(0, 10).toUpperCase(),
      gross_revenue_last_year:         String(body.gross_revenue_last_year || ''),
      net_revenue_last_year:           String(body.net_revenue_last_year || ''),
      new_patients_per_month_avg_2yr:  String(body.new_patients_per_month_avg_2yr || ''),
      avg_visits_per_patient:          String(body.avg_visits_per_patient || ''),
      services_provided:               Array.isArray(body.services_provided) ? body.services_provided : [],
      services_provided_other:         String(body.services_provided_other || ''),
      employee_count:                  String(body.employee_count || ''),
      geographic_location_notes:       String(body.geographic_location_notes || ''),
      owner_role:                      String(body.owner_role || ''),
      past_12mo_was_spike:             String(body.past_12mo_was_spike || ''),
      ok_to_contact:                   Boolean(body.ok_to_contact),
      qualification:                   String(body.qualification || 'unknown'),
      qualification_reasons:           Array.isArray(body.qualification_reasons) ? body.qualification_reasons : [],
      valuation_profile:               String(body.valuation_profile || ''),
      valuation_low:                   Number.isFinite(body.valuation_low) ? Number(body.valuation_low) : null,
      valuation_mid:                   Number.isFinite(body.valuation_mid) ? Number(body.valuation_mid) : null,
      valuation_high:                  Number.isFinite(body.valuation_high) ? Number(body.valuation_high) : null,
      outreach_status:                 'new',
      created_at:                      new Date().toISOString(),
    }

    // Write to Supabase if configured; otherwise soft-fail and just log
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) {
      console.log('[intake] Supabase not configured — submission logged only:', payload.email, payload.qualification)
      return NextResponse.json({ ok: true, note: 'logged-only' })
    }

    const supa = createClient(url, serviceKey, { auth: { persistSession: false } })
    const { error } = await supa.from('chiropillar_targets').insert(payload)
    if (error) {
      console.error('[intake] DB insert failed:', error.message)
      // We don't surface the DB error to the user — they still saw their qualification result.
      return NextResponse.json({ ok: false, error: 'storage failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
