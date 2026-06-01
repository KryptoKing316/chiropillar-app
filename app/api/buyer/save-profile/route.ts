import { NextRequest, NextResponse } from 'next/server'
import { corsCheck, requireSession } from '@/lib/auth'
import { getAdminSupabase } from '@/lib/supabase'
import { blockDemoWrites } from '@/lib/demo-guard'

export async function POST(req: NextRequest) {
  const cors = corsCheck(req)
  if (cors) return cors

  const demoBlock = await blockDemoWrites(req)
  if (demoBlock) return demoBlock

  const { user, error } = await requireSession(req)
  if (error) return error
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const profile = {
    user_id: user.id,
    email: user.email,
    deal_size_min: Number(body.deal_size_min) || null,
    deal_size_max: Number(body.deal_size_max) || null,
    target_industries: Array.isArray(body.target_industries) ? body.target_industries.slice(0, 25) : [],
    target_geography: Array.isArray(body.target_geography) ? body.target_geography.slice(0, 60) : [],
    funding_method: body.funding_method ?? null,
    previous_acquisitions: Number(body.previous_acquisitions) || 0,
    timeline: body.timeline ?? null,
    why_buying: body.why_buying?.slice(0, 2000) ?? null,
    thesis_pdf_path: body.thesis_pdf_path ?? null,
    onboarding_complete: true,
    submitted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const admin = getAdminSupabase()

  const { error: upsertError } = await admin
    .from('buyer_profiles')
    .upsert(profile, { onConflict: 'user_id' })

  if (upsertError) {
    console.error('Buyer profile save error:', upsertError)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }

  // Mark onboarding complete in profiles table
  await admin
    .from('profiles')
    .update({ onboarding_complete: true })
    .eq('id', user.id)

  // Log activity
  await admin.from('activity_log').insert({
    event_type: 'buyer_onboarding_complete',
    event_description: `Buyer ${user.email} completed buy box onboarding`,
    metadata: { user_id: user.id, funding_method: profile.funding_method },
    created_at: new Date().toISOString(),
  })

  return NextResponse.json({ success: true })
}
