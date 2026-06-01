import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Returns the seller's own Digital Twin persona slug (if they have one)
export async function GET(_req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (n: string) => cookieStore.get(n)?.value } }
    )

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ slug: null })
    }

    // Find deals for this user and check for digital twin reference
    const { data: deal } = await supabase
      .from('deals')
      .select('ai_buyer_profile, business_name')
      .eq('seller_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!deal?.ai_buyer_profile) {
      return NextResponse.json({ slug: null })
    }

    try {
      const parsed = JSON.parse(deal.ai_buyer_profile)
      return NextResponse.json({
        slug: parsed.digital_twin_slug ?? null,
        business_name: deal.business_name,
      })
    } catch {
      return NextResponse.json({ slug: null })
    }
  } catch {
    return NextResponse.json({ slug: null })
  }
}
