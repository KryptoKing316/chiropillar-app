import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { CIM_SYSTEM_PROMPT, buildEnhancedPrompt } from '@/lib/cim-prompt'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Fetch example CIM texts from Supabase (uploaded via extract_cim_text.py)
async function getExampleCIMs(): Promise<string[]> {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data } = await supabase
      .from('cim_examples')
      .select('extracted_text')
      .order('uploaded_at', { ascending: false })
      .limit(5)
    // Truncate each example to ~2000 words to stay within token limits
    return (data || [])
      .map((r: { extracted_text: string }) => r.extracted_text)
      .filter(Boolean)
      .map((text: string) => text.split(/\s+/).slice(0, 2000).join(' '))
  } catch {
    return [] // Fallback to base prompt if table doesn't exist yet
  }
}

export async function POST(req: Request) {
  try {
    const { cim_id, message, conversation } = await req.json()

    const messages = [
      ...conversation,
      { role: 'user' as const, content: message }
    ]

    // Load example CIMs only on the first message to avoid repeated DB hits
    const isFirstMessage = conversation.length === 0
    let systemPrompt = CIM_SYSTEM_PROMPT
    if (isFirstMessage) {
      const examples = await getExampleCIMs()
      if (examples.length > 0) {
        systemPrompt = await buildEnhancedPrompt(examples)
      }
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: systemPrompt,
      messages,
    })

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text : ''

    // Check if Claude output a completed CIM (valid JSON with expected shape)
    let isComplete = false
    let cimData = null
    try {
      // Strip markdown code fences if present
      const cleaned = assistantMessage.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
      const parsed = JSON.parse(cleaned)
      if (parsed.executive_summary && parsed.financial_summary) {
        isComplete = true
        cimData = parsed
      }
    } catch (_) {}

    const updatedConversation = [
      ...messages,
      { role: 'assistant', content: assistantMessage }
    ]

    // Persist to Supabase if cim_id provided
    if (cim_id && cim_id !== 'demo') {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      await supabase.from('cims').update({
        conversation: updatedConversation,
        ...(isComplete ? { status: 'complete', generated_cim: cimData } : {}),
        updated_at: new Date().toISOString()
      }).eq('id', cim_id)
    }

    return NextResponse.json({
      message: assistantMessage,
      is_complete: isComplete,
      cim_data: cimData,
      conversation: updatedConversation,
    })
  } catch (err) {
    console.error('CIM chat error:', err)
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 })
  }
}
