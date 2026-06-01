import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const { getAdminSupabase } = await import('@/lib/supabase')
    const admin = getAdminSupabase()
    const { data, error } = await admin
      .from('digital_twin_personas')
      .select('id, slug, name, title, company, avatar_url, persona_type, is_published, created_at')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ personas: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (n: string) => cookieStore.get(n)?.value } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { slug, name, title, company, expertise, avatar_url, greeting, persona_type } = await req.json()
    if (!slug || !name) return NextResponse.json({ error: 'slug and name required' }, { status: 400 })

    const { getAdminSupabase } = await import('@/lib/supabase')
    const admin = getAdminSupabase()
    const { data, error } = await admin
      .from('digital_twin_personas')
      .insert({
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        name,
        title: title ?? '',
        company: company ?? '',
        expertise: expertise ?? '',
        avatar_url: avatar_url ?? '',
        greeting: greeting ?? `I'm ${name}. Ask me anything.`,
        persona_type: persona_type ?? 'advisor',
        is_published: false,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ persona: data })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { slug, ...updates } = await req.json()
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

    const { getAdminSupabase } = await import('@/lib/supabase')
    const admin = getAdminSupabase()
    const { data, error } = await admin
      .from('digital_twin_personas')
      .update(updates)
      .eq('slug', slug)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ persona: data })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
