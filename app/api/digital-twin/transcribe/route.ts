import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { resolvePersonaId } from '@/lib/digital-twin-persona'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Max file size: 25MB (Anthropic limit for audio)
const MAX_SIZE = 25 * 1024 * 1024

export async function POST(req: NextRequest) {
  try {
    // Admin check
    const { user, error: authError } = await requireAdmin(req)
    if (authError) return authError
    if (!user) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const personaId = formData.get('persona_id') as string
    const sourceName = formData.get('source_name') as string

    if (!file || !personaId) {
      return NextResponse.json({ error: 'File and persona_id required' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum 25MB. For longer videos, split into segments.' }, { status: 400 })
    }

    // Convert file to base64 for Claude
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    // Determine media type
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const mediaTypes: Record<string, string> = {
      'mp3': 'audio/mpeg', 'mp4': 'audio/mp4', 'wav': 'audio/wav',
      'webm': 'audio/webm', 'm4a': 'audio/mp4', 'ogg': 'audio/ogg',
      'mov': 'video/quicktime',
    }
    const mediaType = mediaTypes[ext] || 'audio/mpeg'

    // Send to Claude for transcription
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          {
            type: 'text',
            text: 'Transcribe this audio/video recording completely and accurately. Include speaker labels if multiple speakers are present. Format as clean paragraphs. Do not summarize or skip any content. Transcribe every word spoken.',
          },
        ],
      }],
    })

    const transcript = msg.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('\n\n')

    if (!transcript || transcript.length < 20) {
      return NextResponse.json({ error: 'Could not transcribe audio. Please check file format.' }, { status: 422 })
    }

    // Auto-ingest into knowledge base
    const { getAdminSupabase } = await import('@/lib/supabase')
    const admin = getAdminSupabase()

    const resolvedPersonaId = await resolvePersonaId(admin, personaId)
    if (!resolvedPersonaId) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 })
    }

    // Chunk transcript
    const chunks = chunkText(transcript)
    const name = sourceName || file.name.replace(/\.[^.]+$/, '')
    const rows = chunks.map((chunk, i) => ({
      persona_id: resolvedPersonaId,
      source_type: 'video_transcript',
      source_name: name,
      content: chunk,
      chunk_index: i,
    }))

    // Remove old chunks with same name (re-upload replaces)
    await admin.from('digital_twin_knowledge').delete().eq('persona_id', resolvedPersonaId).eq('source_name', name)
    await admin.from('digital_twin_knowledge').insert(rows)

    return NextResponse.json({
      success: true,
      transcript_length: transcript.length,
      chunks_stored: chunks.length,
      source_name: name,
      preview: transcript.slice(0, 500),
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Transcription failed'
    console.error('Transcription error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

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
