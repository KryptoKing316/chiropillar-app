import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const { getAdminSupabase } = await import('@/lib/supabase')
    const admin = getAdminSupabase()

    const { data: persona, error: pErr } = await admin
      .from('digital_twin_personas')
      .select('*')
      .eq('slug', slug)
      .single()

    if (pErr || !persona) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: knowledge } = await admin
      .from('digital_twin_knowledge')
      .select('id, source_type, source_name, content, chunk_index, created_at')
      .eq('persona_id', persona.id)
      .order('created_at', { ascending: true })

    // Group chunks by source for the UI
    const sources: Record<string, { type: string; name: string; count: number; created_at: string }> = {}
    for (const k of knowledge ?? []) {
      if (!sources[k.source_name]) {
        sources[k.source_name] = { type: k.source_type, name: k.source_name, count: 0, created_at: k.created_at }
      }
      sources[k.source_name].count++
    }

    return NextResponse.json({
      persona,
      knowledge: knowledge ?? [],
      sources: Object.values(sources),
      total_chunks: knowledge?.length ?? 0,
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
