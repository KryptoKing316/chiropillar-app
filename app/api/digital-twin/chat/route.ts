import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MODULES = [
  { id: 'business-overview', title: 'The Business in Plain English', questions: ['Describe your business to someone who knows nothing about your industry.', 'What do you actually sell, and why do customers choose you over competitors?', 'Walk me through a typical Monday morning at your company.', 'What is the one thing that, if it stopped working, your business would be in serious trouble within 30 days?', 'What do you personally do every week that nobody else at the company does?'] },
  { id: 'customers', title: 'Customer Relationships', questions: ['Who are your top 5 customers by revenue? Tell me about each one personally.', 'How did you originally win each of those relationships?', 'Which customers might leave if YOU personally left, and what keeps them loyal?', 'Are there any customer quirks, preferences, or history a new owner must know?', 'Who at each key account should the new owner call first?'] },
  { id: 'employees', title: 'Your Team', questions: ['Who are your key people, and what would break if each one left?', 'Who might be underpaid and knows it?', 'Who has leadership potential a new owner should develop?', 'Are there any interpersonal dynamics a new owner needs to understand?', 'What motivates each key person beyond their paycheck?'] },
  { id: 'operations', title: 'Operations & Vendors', questions: ['Walk me through how a job or order gets processed start to finish.', 'Which vendors are critical and what are your actual terms?', 'Are there any handshake deals or verbal agreements a new owner needs to know?', 'What processes break down under pressure and what is the workaround?', 'What does your best employee do differently that has never been written down?'] },
  { id: 'growth', title: 'Growth Opportunities', questions: ['What growth opportunities have you not pursued that a new owner could capture?', 'Which service line has the most untapped margin?', 'Are there geographic markets you could expand to but haven\'t?', 'Who has asked to buy from you that you couldn\'t service?', 'If you were starting fresh today, what would you do differently in year one?'] },
  { id: 'risks', title: 'Risks & Honest Challenges', questions: ['What keeps you up at night about this business?', 'Is there a customer or contract that could change after you leave?', 'Are there regulatory or compliance items the new owner must understand?', 'What has gone seriously wrong in the past that could happen again?', 'Is there anything a new owner might discover that would surprise them?'] },
  { id: 'transition', title: 'The Transition Playbook', questions: ['If you had 90 days to transfer everything you know, what would you teach first?', 'Who inside the company can help the new owner learn quickly?', 'Which outside relationships are critical to maintain?', 'What should the new owner NOT change in the first 6 months?', 'What is your most honest advice to the buyer for year one?'] },
  { id: 'story', title: 'Your Story', questions: ['Why did you originally start or buy this business?', 'What are you most proud of building?', 'What do you want your legacy to be?', 'Why are you selling now?', 'What would the ideal new owner look like?'] },
]

function buildContext(answers: Record<string, Record<number, string>>): string {
  const sections: string[] = []
  for (const mod of MODULES) {
    const modAnswers = answers[mod.id]
    if (!modAnswers || Object.keys(modAnswers).length === 0) continue
    const lines = [`## ${mod.title}`]
    for (const [qi, answer] of Object.entries(modAnswers)) {
      const q = mod.questions[parseInt(qi)]
      if (q && answer) { lines.push(`Q: ${q}`, `A: ${answer}`, '') }
    }
    sections.push(lines.join('\n'))
  }
  return sections.join('\n\n')
}

export async function POST(req: Request) {
  try {
    const { question, answers, deal_name, persona_slug } = await req.json()
    if (!question?.trim()) return NextResponse.json({ error: 'No question provided' }, { status: 400 })

    let systemPrompt: string

    if (persona_slug) {
      // ── Persona mode: pull knowledge from Supabase ─────────────────────────
      const { getAdminSupabase } = await import('@/lib/supabase')
      const admin = getAdminSupabase()

      const { data: persona, error: pErr } = await admin
        .from('digital_twin_personas')
        .select('*')
        .eq('slug', persona_slug)
        .single()

      if (pErr || !persona) return NextResponse.json({ error: 'Persona not found' }, { status: 404 })

      const { data: chunks } = await admin
        .from('digital_twin_knowledge')
        .select('content, source_type, source_name')
        .eq('persona_id', persona.id)
        .order('created_at', { ascending: true })

      const knowledgeText = (chunks ?? []).map(c => c.content).join('\n\n---\n\n')

      if (!knowledgeText.trim()) {
        return NextResponse.json({
          answer: `I'm ${persona.name}. My knowledge base is still being built — check back once the interview and documents have been uploaded.`
        })
      }

      systemPrompt = `You are the AI Digital Twin of ${persona.name}${persona.title ? `, ${persona.title}` : ''}${persona.company ? ` at ${persona.company}` : ''}.

You speak in first person as ${persona.name}. Your expertise: ${persona.expertise || 'business advisory, exit planning, and deal structuring'}.

RULES:
- Use the knowledge base as your primary source. When the knowledge base doesn't cover a topic, you may use your general business advisory expertise, but always prioritize Kingdom Broker's specific frameworks and approach. Never contradict the knowledge base.
- Speak in first person — "I", "my", "in my experience" — as ${persona.name} would.
- Be specific: reference actual frameworks, numbers, and examples from the knowledge base.
- If a question isn't covered, say "I haven't addressed that directly, but what I can tell you is..."
- Be direct, warm, and authoritative. ${persona.name} speaks with 20+ years of earned confidence.
- Keep formatting simple. Use plain text. NO bold (**), NO headers (#), NO excessive markdown. Just clean paragraphs and occasional bullet points for lists. Write like you are texting a friend, not writing a blog post.

KNOWLEDGE BASE:
${knowledgeText.slice(0, 14000)}`

    } else {
      // ── Legacy mode: interview answers ─────────────────────────────────────
      const context = buildContext(answers || {})
      if (!context.trim()) {
        return NextResponse.json({
          answer: "I don't have enough information yet. Please complete more of the CEO interview first."
        })
      }
      systemPrompt = `You are the Digital Twin of the owner of ${deal_name || 'this business'}. Speak in first person as the owner.

RULES:
- Answer ONLY from the knowledge base. Do not invent facts.
- Use first person — "I", "my", "we".
- Be specific with names, numbers, and details.
- If a topic isn't covered, say so honestly.

KNOWLEDGE BASE:
${context}`
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: question }],
    })

    const answer = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ answer })
  } catch (err) {
    console.error('[Digital Twin] Chat error:', err)
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 })
  }
}
