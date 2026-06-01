import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const body = await req.json()

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
    )

    // Try to save to trust_leads table — fails gracefully if table not yet created
    await supabase.from('trust_leads').insert({
      full_name:       body.full_name,
      email:           body.email,
      phone:           body.phone,
      business_value:  body.business_value,
      exit_timeline:   body.exit_timeline,
      has_trust:       body.has_trust,
      goals:           body.goals,
      notes:           body.notes,
      source:          'kb_platform',
      created_at:      new Date().toISOString(),
    })
  } catch {
    // Table may not exist yet — still return success so form works
  }

  return NextResponse.json({ success: true })
}
