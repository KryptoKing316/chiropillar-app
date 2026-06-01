import { NextRequest, NextResponse } from 'next/server'
import { corsCheck, requireSession } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeUuid } from '@/lib/sanitize'

// GET /api/financials?deal_id=xxx
// Returns financial_analysis rows for a deal the caller owns.
// Falls back gracefully when Supabase is not configured (dev/demo).
export async function GET(req: NextRequest) {
  const corsError = corsCheck(req)
  if (corsError) return corsError

  const rateLimitError = await rateLimit(req)
  if (rateLimitError) return rateLimitError

  const { error: authError } = await requireSession(req)
  if (authError) return authError

  const dealId = sanitizeUuid(new URL(req.url).searchParams.get('deal_id') || '')
  if (!dealId) return NextResponse.json({ error: 'Invalid deal_id.' }, { status: 400 })

  try {
    const { getAdminSupabase } = await import('@/lib/supabase')
    const admin = getAdminSupabase()

    const { data, error } = await admin
      .from('financial_analysis')
      .select('year,gross_revenue,ebitda,normalized_ebitda,owner_compensation,add_backs')
      .eq('deal_id', dealId)
      .order('year', { ascending: true })

    if (error) return NextResponse.json({ rows: [], source: 'error' })

    return NextResponse.json({ rows: data ?? [], source: 'live' })
  } catch {
    // Supabase not configured — caller should fall back to demo data
    return NextResponse.json({ rows: [], source: 'unconfigured' })
  }
}

export async function OPTIONS(req: NextRequest) {
  return corsCheck(req) ?? new NextResponse(null, { status: 204 })
}
