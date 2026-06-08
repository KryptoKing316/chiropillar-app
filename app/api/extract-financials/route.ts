// ProMed VA · AI Financial Extraction
// POST /api/extract-financials
//   Form data: file (PDF of tax return / P&L / bank statement)
//   Returns:   structured financial summary + add-back detection
//
// Pipeline:
//   1. Accept multipart PDF upload
//   2. Extract text with pdf-parse
//   3. Send to Claude (claude-opus-4-7) with chiropractic-specific prompt
//   4. Return structured JSON the /valuation wizard can consume directly

import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 60

type ExtractedYear = {
  year: number | null
  revenue: number | null
  ebitda: number | null
  owner_compensation: number | null
  net_income: number | null
}

type ExtractedAddBack = {
  label: string
  amount: number
  reason: string
  confidence: 'high' | 'medium' | 'low'
}

type ExtractionResult = {
  doc_type: 'tax_return' | 'profit_loss' | 'bank_statement' | 'unknown'
  practice_name: string | null
  years: ExtractedYear[]
  suggested_add_backs: ExtractedAddBack[]
  notes: string[]
  confidence_score: number  // 1-10
}

const EXTRACTION_PROMPT = `You are a financial analyst specializing in small chiropractic practice acquisitions. You extract structured data from PDF financial documents.

Return ONLY a valid JSON object in this exact shape — no markdown, no commentary:

{
  "doc_type": "tax_return" | "profit_loss" | "bank_statement" | "unknown",
  "practice_name": string | null,
  "years": [
    {
      "year": 2025,
      "revenue": 1300000,
      "ebitda": 485000,
      "owner_compensation": 245000,
      "net_income": 310000
    }
  ],
  "suggested_add_backs": [
    {
      "label": "Owner compensation above market",
      "amount": 65000,
      "reason": "Owner draws $245K; market rate ~$180K for 1-DC chiropractic practice of this size",
      "confidence": "high"
    }
  ],
  "notes": ["Any data quality notes, gaps, or anomalies worth flagging"],
  "confidence_score": 8
}

Rules:
- All dollar amounts as integers (no commas, no dollar signs).
- If a field can't be determined, use null.
- Look for these standard chiropractic add-backs: (a) owner compensation above market (market = $180K for solo-DC, $220K for multi-DC clinic), (b) personal vehicle written through business, (c) personal travel disguised as CME, (d) family members on payroll above market rate, (e) one-time legal/professional fees, (f) personal cell phone/internet, (g) excess depreciation, (h) one-time equipment purchases.
- Be conservative on add-back confidence. "High" only if the line item is clearly personal in nature.
- If the document is a 1040/1120-S/1065 schedule, treat as tax_return. If income statement, treat as profit_loss.
- Practice name: usually in header. If multiple names, prefer the chiropractic practice / DC's S-Corp name.
- confidence_score: 1-10 reflects how clean the document is and how confident the extraction is.

Document text:
`

async function extractPdfText(buffer: Buffer): Promise<string> {
  // Use pdf-parse v1 via deep import to skip the index.js debug block
  // (the v1 entry point tries to read a test PDF at startup which errors in
  // a Next.js bundle). Deep import goes straight to the parser module.
  // v2 was tried but ships a pdfjs-dist worker setup that doesn't bundle
  // cleanly under Next.js — "Setting up fake worker failed" at runtime.
  // @ts-expect-error · pdf-parse v1 has no types
  const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default
  const data = await pdfParse(buffer)
  return (data.text as string) ?? ''
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        error: 'AI extraction is not configured. ANTHROPIC_API_KEY missing in deployment.',
        coming_soon: true,
      }, { status: 503 })
    }

    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 })
    }
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are supported right now.' }, { status: 400 })
    }
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds 25 MB limit.' }, { status: 400 })
    }

    // 1. Read PDF text
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    let pdfText: string
    try {
      pdfText = await extractPdfText(buffer)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('[extract-financials] pdf-parse failed:', msg, e instanceof Error ? e.stack : '')
      return NextResponse.json({ error: 'Could not read PDF. File may be scanned/image-only.', debug: msg }, { status: 400 })
    }
    if (pdfText.length < 200) {
      return NextResponse.json({ error: 'PDF appears to be image-only (no extractable text). OCR support ships in Phase 3.' }, { status: 400 })
    }

    // 2. Truncate for token budget (Claude's input is generous but we cap at ~80K chars)
    const truncated = pdfText.slice(0, 80_000)

    // 3. Send to Claude
    const client = new Anthropic({ apiKey })
    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: EXTRACTION_PROMPT + '\n\n' + truncated,
        },
      ],
    })

    // 4. Parse Claude's JSON response
    const textBlock = response.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'AI returned no text.' }, { status: 500 })
    }
    const raw = textBlock.text.trim()
    // Strip markdown fencing if Claude wrapped it anyway
    const jsonText = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
    let parsed: ExtractionResult
    try {
      parsed = JSON.parse(jsonText)
    } catch (e) {
      return NextResponse.json({ error: 'AI response was not valid JSON.', raw_response: raw }, { status: 500 })
    }

    return NextResponse.json({ ok: true, extracted: parsed })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[extract-financials] error:', msg)
    return NextResponse.json({ error: 'Extraction failed: ' + msg }, { status: 500 })
  }
}
