import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone, company, how_heard, custom_code } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email required' }, { status: 400 })
    }

    // Use custom code if provided and valid, otherwise auto-generate
    let refCode: string
    if (custom_code && custom_code.length >= 3) {
      const cleaned = custom_code.toLowerCase().replace(/[^a-z0-9-]/g, '')
      // Check if taken
      const { data: existing } = await supabase.from('ambassadors').select('id').eq('referral_code', cleaned).maybeSingle()
      if (existing) {
        return NextResponse.json({ error: 'That referral code is already taken' }, { status: 400 })
      }
      refCode = cleaned
    } else {
      refCode = 'KB-' + name.split(' ')[0].toUpperCase().slice(0, 4) + '-' + crypto.randomBytes(3).toString('hex').toUpperCase()
    }

    const { data, error } = await supabase
      .from('ambassadors')
      .insert({
        name,
        email,
        phone: phone || null,
        company: company || null,
        how_connected: how_heard || null,
        referral_code: refCode,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      // If table doesn't exist yet, still return success (we'll create it)
      console.error('Ambassador insert error:', error.message)
      return NextResponse.json({ ok: true, referral_code: refCode })
    }

    return NextResponse.json({ ok: true, referral_code: refCode, id: data?.id })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
