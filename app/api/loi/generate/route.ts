import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { getAdminSupabase } from '@/lib/supabase'
import { autoFillLOI } from '@/lib/loi-ai'
import type { TemplateType } from '@/lib/loi-templates'

export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireSession(req)
  if (authError) return authError

  try {
    const body = await req.json() as { deal_id?: string; template_type?: string; buyer_id?: string }
    const { deal_id, template_type, buyer_id } = body

    if (!template_type || !['all_cash', 'seller_financed', 'sba_7a'].includes(template_type)) {
      return NextResponse.json({ error: 'Invalid template_type. Must be: all_cash, seller_financed, or sba_7a' }, { status: 400 })
    }

    const admin = getAdminSupabase()

    // Get the deal — use provided deal_id OR find from user's profile
    let dealData = null

    if (deal_id) {
      const { data } = await admin
        .from('deals')
        .select('*')
        .eq('id', deal_id)
        .single()
      dealData = data
    } else if (user) {
      // Find the user's active deal
      const { data } = await admin
        .from('deals')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      dealData = data
    }

    // Demo mode: use placeholder deal data
    if (!dealData) {
      dealData = {
        id: 'demo',
        business_name: 'Legacy HVAC Services',
        industry: 'HVAC',
        city: 'Dallas',
        state: 'TX',
        years_in_business: 22,
        employee_count: 14,
        asking_price: 4800000,
        ttm_revenue: 4200000,
        ttm_ebitda: 910000,
        seller_name: 'Business Owner',
        seller_email: '',
        seller_phone: '',
      }
    }

    // Get buyer profile
    let buyerData = null
    const buyerUserId = buyer_id || user?.id

    if (buyerUserId) {
      const { data } = await admin
        .from('profiles')
        .select('*')
        .eq('id', buyerUserId)
        .single()
      buyerData = data
    }

    if (!buyerData) {
      buyerData = {
        id: buyerUserId || 'demo',
        full_name: 'Kingdom Broker',
        email: 'Eric@KingdomBroker.com',
        phone: '469-494-9890',
        company_name: 'Kingdom Broker',
      }
    }

    // Auto-fill via Claude
    const fields = await autoFillLOI(dealData, buyerData, template_type as TemplateType)

    return NextResponse.json({ fields, deal_id: dealData.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[LOI Generate] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
