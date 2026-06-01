import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')?.toLowerCase().trim()

  if (!code || code.length < 3) {
    return NextResponse.json({ available: false, error: 'Code must be at least 3 characters' })
  }

  const { data } = await supabase
    .from('ambassadors')
    .select('id')
    .eq('referral_code', code)
    .maybeSingle()

  return NextResponse.json({ available: !data })
}
