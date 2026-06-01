import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { ambassador_id, referral_code, owner_name, owner_email, owner_phone, business_name, industry, city, state, estimated_revenue } = body

    if (!ambassador_id || !owner_name) {
      return NextResponse.json({ error: 'Ambassador ID and owner name required' }, { status: 400 })
    }

    // Insert referral
    const { data, error } = await supabase
      .from('ambassador_referrals')
      .insert({
        ambassador_id,
        referral_code,
        owner_name,
        owner_email: owner_email || null,
        owner_phone: owner_phone || null,
        business_name: business_name || null,
        industry: industry || null,
        city: city || null,
        state: state || null,
        estimated_revenue: estimated_revenue || null,
        status: 'referred',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update ambassador total_referrals count
    await supabase.rpc('increment_ambassador_referrals', { amb_id: ambassador_id }).catch(() => {
      // If RPC doesn't exist, do manual update
      supabase.from('ambassadors')
        .update({ total_referrals: supabase.rpc ? undefined : 1 })
        .eq('id', ambassador_id)
    })

    return NextResponse.json({ ok: true, referral: data })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
