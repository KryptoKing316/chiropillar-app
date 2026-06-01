import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { referral_code, owner_name, owner_email, owner_phone, business_name, industry, estimated_revenue, source, valuation_range } = body

    if (!referral_code) {
      return NextResponse.json({ error: 'Referral code required' }, { status: 400 })
    }

    // Look up the ambassador by referral code
    const { data: ambassador } = await supabase
      .from('ambassadors')
      .select('id, name')
      .eq('referral_code', referral_code)
      .maybeSingle()

    // Insert the referral (even if ambassador not found, we track it)
    const { error } = await supabase
      .from('ambassador_referrals')
      .insert({
        ambassador_id: ambassador?.id || null,
        referral_code,
        owner_name: owner_name || null,
        owner_email: owner_email || null,
        owner_phone: owner_phone || null,
        business_name: business_name || null,
        industry: industry || null,
        estimated_revenue: estimated_revenue || null,
        status: 'referred',
        notes: `Source: ${source || 'unknown'}. ${valuation_range ? 'Valuation: ' + valuation_range : ''}`,
      })

    if (error) {
      console.error('Ambassador track error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update ambassador referral count
    if (ambassador?.id) {
      const { data: allRefs } = await supabase
        .from('ambassador_referrals')
        .select('id')
        .eq('ambassador_id', ambassador.id)

      await supabase
        .from('ambassadors')
        .update({ total_referrals: (allRefs || []).length, updated_at: new Date().toISOString() })
        .eq('id', ambassador.id)
    }

    return NextResponse.json({ ok: true, ambassador_name: ambassador?.name || null })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
