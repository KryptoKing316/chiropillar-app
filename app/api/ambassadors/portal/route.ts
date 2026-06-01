import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  // Look up ambassador by email only
  const { data: ambassador, error } = await supabase
    .from('ambassadors')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()

  if (error || !ambassador) {
    return NextResponse.json({ error: 'No ambassador account found with that email' }, { status: 401 })
  }

  // Get their referrals
  const { data: referrals } = await supabase
    .from('ambassador_referrals')
    .select('*')
    .eq('ambassador_id', ambassador.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ ambassador, referrals: referrals || [] })
}
