import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { resolvePersonaId } from '@/lib/digital-twin-persona'

// Chunk text into ~1800 char pieces at paragraph boundaries
function chunkText(text: string, maxChars = 1800): string[] {
  const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
  const chunks: string[] = []
  let current = ''

  for (const para of paragraphs) {
    if (current.length + para.length + 2 > maxChars && current.length > 0) {
      chunks.push(current.trim())
      current = para
    } else {
      current += (current ? '\n\n' : '') + para
    }
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks.filter(c => c.length > 40) // skip tiny chunks
}

export async function POST(req: NextRequest) {
  try {
    const { user, error: authError } = await requireAdmin(req)
    if (authError) return authError
    if (!user) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { persona_id, source_type, source_name, content } = await req.json()
    if (!persona_id || !source_type || !content?.trim()) {
      return NextResponse.json({ error: 'persona_id, source_type, and content are required' }, { status: 400 })
    }

    const { getAdminSupabase } = await import('@/lib/supabase')
    const admin = getAdminSupabase()

    const resolvedPersonaId = await resolvePersonaId(admin, persona_id)
    if (!resolvedPersonaId) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 })
    }

    // Remove old chunks with same source_name (re-upload replaces)
    if (source_name) {
      await admin
        .from('digital_twin_knowledge')
        .delete()
        .eq('persona_id', resolvedPersonaId)
        .eq('source_name', source_name)
    }

    const chunks = chunkText(content)
    const rows = chunks.map((chunk, i) => ({
      persona_id: resolvedPersonaId,
      source_type: source_type as string,
      source_name: source_name ?? `${source_type}_${Date.now()}`,
      content: chunk,
      chunk_index: i,
    }))

    const { error } = await admin.from('digital_twin_knowledge').insert(rows)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, chunks_stored: chunks.length })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, error: authError } = await requireAdmin(req)
    if (authError) return authError
    if (!user) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { persona_id, source_name } = await req.json()
    if (!persona_id || !source_name) return NextResponse.json({ error: 'persona_id and source_name required' }, { status: 400 })

    const { getAdminSupabase } = await import('@/lib/supabase')
    const admin = getAdminSupabase()

    const resolvedPersonaId = await resolvePersonaId(admin, persona_id)
    if (!resolvedPersonaId) return NextResponse.json({ error: 'Persona not found' }, { status: 404 })

    await admin
      .from('digital_twin_knowledge')
      .delete()
      .eq('persona_id', resolvedPersonaId)
      .eq('source_name', source_name)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
