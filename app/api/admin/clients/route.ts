import { NextRequest, NextResponse } from 'next/server'
import { corsCheck, requireAdmin } from '@/lib/auth'
import { getAdminSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const cors = corsCheck(req)
  if (cors) return cors

  const { user, error } = await requireAdmin(req)
  if (error) return error
  if (!user) return NextResponse.json({ clients: [], total: 0 })

  const admin = getAdminSupabase()
  const url = new URL(req.url)
  const role = url.searchParams.get('role') // seller | buyer | all
  const page = parseInt(url.searchParams.get('page') ?? '1')
  const limit = 50
  const offset = (page - 1) * limit

  let query = admin
    .from('profiles')
    .select(`
      id, email, full_name, role, company_name, phone, created_at, is_demo,
      deals(id, business_name, status, asking_price, industry),
      buyer_profiles(id, deal_size_min, deal_size_max, onboarding_complete, funding_method)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (role && role !== 'all') {
    query = query.eq('role', role)
  }

  const { data, count, error: dbError } = await query

  if (dbError) {
    console.error('Admin clients fetch error:', dbError)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }

  return NextResponse.json({ clients: data ?? [], total: count ?? 0, page, limit })
}
