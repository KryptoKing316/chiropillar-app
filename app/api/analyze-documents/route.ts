import { NextRequest, NextResponse } from "next/server";
import { corsCheck, requireSession, requireDealOwnership } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText, sanitizeUuid, sanitizeInt } from "@/lib/sanitize";
import {
  extractFromPdfText,
  extractFromImage,
  type ExtractedFinancials,
} from "@/lib/extract-financials";

// POST /api/analyze-documents
// Body: { deal_id, doc_id, doc_type, year }
// Triggers Claude AI analysis on an already-uploaded financial document.
// Requires the requesting user to own the deal.
export async function POST(req: NextRequest) {
  const corsError = corsCheck(req);
  if (corsError) return corsError;

  const rateLimitError = await rateLimit(req);
  if (rateLimitError) return rateLimitError;

  const { error: authError } = await requireSession(req);
  if (authError) return authError;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const dealId = sanitizeUuid(body.deal_id);
  const docId = sanitizeUuid(body.doc_id);
  const docType = sanitizeText(body.doc_type as string);
  const year = sanitizeInt(body.year, 2000, 2099);

  if (!dealId) return NextResponse.json({ error: "Invalid deal_id." }, { status: 400 });
  if (!docId) return NextResponse.json({ error: "Invalid doc_id." }, { status: 400 });
  if (!docType) return NextResponse.json({ error: "Invalid doc_type." }, { status: 400 });
  if (!year) return NextResponse.json({ error: "Invalid year." }, { status: 400 });

  // Ownership check — 403 not 404 if not owner
  const { error: ownershipError } = await requireDealOwnership(req, dealId);
  if (ownershipError) return ownershipError;

  try {
    const { getAdminSupabase } = await import("@/lib/supabase");
    const admin = getAdminSupabase();

    // Fetch the document record — verify it belongs to this deal
    const { data: doc } = await admin
      .from("financial_documents")
      .select("*")
      .eq("id", docId)
      .eq("deal_id", dealId)
      .single();

    if (!doc) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    // Mark as processing
    await admin
      .from("financial_documents")
      .update({ upload_status: "processing" })
      .eq("id", docId);

    // Download file bytes from private Supabase Storage
    const { data: fileBlob, error: dlError } = await admin.storage
      .from("documents")
      .download(doc.file_path);

    if (dlError || !fileBlob) {
      await admin
        .from("financial_documents")
        .update({ upload_status: "error" })
        .eq("id", docId);
      return NextResponse.json({ error: "Could not access document." }, { status: 500 });
    }

    // Route to PDF or image extraction based on stored content type
    const filePath = String(doc.file_path);
    const isImage = /\.(jpe?g|png|webp)$/i.test(filePath);

    let extracted: ExtractedFinancials | null = null;

    if (isImage) {
      // Claude Vision path
      const arrayBuffer = await fileBlob.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const mediaType: "image/jpeg" | "image/png" | "image/webp" =
        /\.png$/i.test(filePath)
          ? "image/png"
          : /\.webp$/i.test(filePath)
          ? "image/webp"
          : "image/jpeg";

      extracted = await extractFromImage(base64, mediaType, docType, year);
    } else {
      // PDF path — parse text first, then send to Claude
      try {
        const pdfParseMod = await import("pdf-parse");
        const pdfParse = (pdfParseMod as { default: (buf: Buffer) => Promise<{ text: string }> }).default;
        const arrayBuffer = await fileBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const parsed = await pdfParse(buffer);
        extracted = await extractFromPdfText(parsed.text || "", docType, year);
      } catch {
        // PDF parse failed — leave extracted null, will mark error below
        extracted = null;
      }
    }

    // Persist extraction (may be null if Claude call failed — that's surfaced as error status)
    if (extracted) {
      await admin
        .from("financial_documents")
        .update({
          upload_status: "complete",
          extracted_data: extracted,
        })
        .eq("id", docId);

      // Best-effort: also write a normalized row to financial_analysis for the
      // valuation builder to consume. Silently ignore if the table doesn't
      // exist yet or RLS blocks the write.
      try {
        await admin.from("financial_analysis").insert({
          deal_id: dealId,
          year,
          gross_revenue: extracted.gross_revenue,
          gross_profit: extracted.gross_profit,
          operating_expenses: extracted.total_operating_expenses,
          ebitda: extracted.ebitda,
          owner_compensation: extracted.owner_compensation_total,
          add_backs: extracted.suggested_add_backs,
          normalized_ebitda:
            (extracted.ebitda ?? 0) +
            extracted.suggested_add_backs
              .filter((a) => a.confidence >= 7)
              .reduce((sum, a) => sum + (a.amount || 0), 0),
          source_doc: docId,
        });
      } catch {
        // non-blocking
      }

      return NextResponse.json({
        success: true,
        doc_id: docId,
        status: "complete",
        confidence: extracted.confidence_score,
        add_backs_found: extracted.suggested_add_backs.length,
      });
    } else {
      await admin
        .from("financial_documents")
        .update({ upload_status: "error" })
        .eq("id", docId);

      return NextResponse.json(
        { success: false, doc_id: docId, status: "error", reason: "extraction_failed" },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function OPTIONS(req: NextRequest) {
  return corsCheck(req) ?? new NextResponse(null, { status: 204 });
}
