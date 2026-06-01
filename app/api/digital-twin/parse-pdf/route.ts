import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { resolvePersonaId } from '@/lib/digital-twin-persona'

// Chunk text into ~1800 char pieces at paragraph boundaries (same as ingest route)
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
  return chunks.filter(c => c.length > 40)
}

export async function POST(req: NextRequest) {
  try {
    // Admin check
    const { user, error: authError } = await requireAdmin(req)
    if (authError) return authError
    if (!user) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const persona_id = formData.get('persona_id') as string | null
    const source_name = formData.get('source_name') as string | null

    if (!file || !persona_id || !source_name?.trim()) {
      return NextResponse.json({ error: 'file, persona_id, and source_name are required' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 })
    }

    // Cap at 50MB
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 50MB.' }, { status: 400 })
    }

    // Parse PDF
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Dynamic import to avoid SSR issues with pdf-parse
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParseModule = await import('pdf-parse') as any
    const pdfParse = pdfParseModule.default ?? pdfParseModule
    const parsed = await pdfParse(buffer)
    const rawText = parsed.text?.trim()

    if (!rawText || rawText.length < 50) {
      return NextResponse.json({ error: 'Could not extract text from this PDF. It may be image-based or scanned. Please paste the text manually.' }, { status: 422 })
    }

    // Chunk the extracted text
    const chunks = chunkText(rawText)
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'No usable text found in the PDF.' }, { status: 422 })
    }

    const { getAdminSupabase } = await import('@/lib/supabase')
    const admin = getAdminSupabase()

    const resolvedPersonaId = await resolvePersonaId(admin, persona_id)
    if (!resolvedPersonaId) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 })
    }

    // Remove old chunks with same source_name (re-upload replaces)
    await admin
      .from('digital_twin_knowledge')
      .delete()
      .eq('persona_id', resolvedPersonaId)
      .eq('source_name', source_name.trim())

    // Insert new chunks
    const rows = chunks.map((chunk, i) => ({
      persona_id: resolvedPersonaId,
      source_type: 'document',
      source_name: source_name.trim(),
      content: chunk,
      chunk_index: i,
    }))

    const { error } = await admin.from('digital_twin_knowledge').insert(rows)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
      success: true,
      chunks_stored: chunks.length,
      pages: parsed.numpages,
      characters: rawText.length,
    })
  } catch (err) {
    console.error('[parse-pdf] error:', err)
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 })
  }
}
