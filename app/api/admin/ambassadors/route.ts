import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data: ambassadors } = await supabase
    .from('ambassadors')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: referrals } = await supabase
    .from('ambassador_referrals')
    .select('*')
    .order('created_at', { ascending: false })

  return NextResponse.json({ ambassadors: ambassadors || [], referrals: referrals || [] })
}

export async function PATCH(req: Request) {
  try {
    const { table, id, patch } = await req.json()

    if (!table || !id || !patch) {
      return NextResponse.json({ error: 'table, id, and patch required' }, { status: 400 })
    }

    if (!['ambassadors', 'ambassador_referrals'].includes(table)) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
    }

    // Add updated_at
    patch.updated_at = new Date().toISOString()

    const { error } = await supabase
      .from(table)
      .update(patch)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If updating referral commission, also update ambassador total_earned
    if (table === 'ambassador_referrals' && (patch.commission_paid !== undefined || patch.signing_bonus_paid !== undefined)) {
      const { data: ref } = await supabase.from('ambassador_referrals').select('ambassador_id').eq('id', id).single()
      if (ref) {
        // Recalculate total earned for this ambassador
        const { data: allRefs } = await supabase.from('ambassador_referrals').select('commission_amount, commission_paid, signing_bonus_paid').eq('ambassador_id', ref.ambassador_id)
        let totalEarned = 0
        for (const r of (allRefs || [])) {
          if (r.commission_paid && r.commission_amount) totalEarned += r.commission_amount
          if (r.signing_bonus_paid) totalEarned += 1000
        }
        const totalSigned = (allRefs || []).filter(r => ['signed', 'active', 'closed'].includes(r.status)).length
        const totalClosed = (allRefs || []).filter(r => r.status === 'closed').length
        await supabase.from('ambassadors').update({
          total_earned: totalEarned,
          total_signed: totalSigned,
          total_closed: totalClosed,
          total_referrals: (allRefs || []).length,
          updated_at: new Date().toISOString(),
        }).eq('id', ref.ambassador_id)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
