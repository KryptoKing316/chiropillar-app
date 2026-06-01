import { NextRequest, NextResponse } from "next/server";
import { corsCheck, requireSession, requireDealOwnership } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import {
  validateUpload,
  buildStoragePath,
  kindToExtension,
  kindToContentType,
} from "@/lib/upload-security";
import { sanitizeText, sanitizeUuid, sanitizeInt } from "@/lib/sanitize";
import { blockDemoWrites } from "@/lib/demo-guard";

// POST /api/upload-document
// Body: multipart/form-data { file: File, dealId: string, docType: string, year: number }
export async function POST(req: NextRequest) {
  // 1. CORS
  const corsError = corsCheck(req);
  if (corsError) return corsError;

  // 2. Rate limit
  const rateLimitError = await rateLimit(req);
  if (rateLimitError) return rateLimitError;

  // 3. Auth
  const { error: authError } = await requireSession(req);
  if (authError) return authError;

  // 4. Demo read-only block — demo accounts cannot upload documents
  const demoBlock = await blockDemoWrites(req);
  if (demoBlock) return demoBlock;

  // 5. Parse multipart form
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  const rawDealId = formData.get("dealId");
  const rawDocType = formData.get("docType");
  const rawYear = formData.get("year");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  // 6. Sanitize inputs
  const dealId = sanitizeUuid(rawDealId);
  if (!dealId) return NextResponse.json({ error: "Invalid deal ID." }, { status: 400 });

  const docType = sanitizeText(rawDocType);
  if (!docType) return NextResponse.json({ error: "Invalid document type." }, { status: 400 });

  const year = sanitizeInt(rawYear, 2000, 2099);
  if (!year) return NextResponse.json({ error: "Invalid year." }, { status: 400 });

  // 7. Ownership check — 403 not 404
  const { error: ownershipError } = await requireDealOwnership(req, dealId);
  if (ownershipError) return ownershipError;

  // 8. Validate upload (magic bytes + MIME + size + filename)
  const validation = await validateUpload(file);
  if (!validation.valid || !validation.kind) {
    return NextResponse.json({ error: validation.error }, { status: 422 });
  }

  // 9. Build safe storage path — extension matches the detected kind so the
  //    analyze route can route PDFs vs images to the right Claude call.
  const fileExt = kindToExtension(validation.kind);
  const storagePath = buildStoragePath(dealId, docType, year, fileExt);
  const contentType = kindToContentType(validation.kind);

  // 10. Upload to private Supabase Storage bucket
  try {
    const { getAdminSupabase } = await import("@/lib/supabase");
    const admin = getAdminSupabase();

    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await admin.storage
      .from("documents")
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      // Never log file contents or sensitive data
      console.error("[upload-document] Storage error:", uploadError.message);
      return NextResponse.json({ error: "Upload failed." }, { status: 500 });
    }

    // 11. Generate signed URL — 1 hour expiry
    const { data: signedUrlData, error: signedUrlError } = await admin.storage
      .from("documents")
      .createSignedUrl(storagePath, 3600);

    if (signedUrlError || !signedUrlData) {
      return NextResponse.json({ error: "Could not generate document URL." }, { status: 500 });
    }

    // 12. Record in financial_documents table — return the row so the
    //     caller has the doc_id to hand off to /api/analyze-documents.
    //     upload_status is "pending" (not "complete") because AI extraction
    //     hasn't happened yet — analyze-documents is the one that flips
    //     it to "complete" or "error".
    const { data: docRow, error: insertError } = await admin
      .from("financial_documents")
      .upsert(
        {
          deal_id: dealId,
          doc_type: docType,
          file_name: file.name.slice(0, 255),
          file_path: storagePath,
          file_size: file.size,
          year,
          upload_status: "pending",
          uploaded_at: new Date().toISOString(),
        },
        { onConflict: "deal_id,doc_type,year" }
      )
      .select("id")
      .single();

    if (insertError || !docRow) {
      console.error("[upload-document] Insert error:", insertError?.message);
      return NextResponse.json(
        { error: "Could not record document." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      doc_id: docRow.id,
      storagePath,
      signedUrl: signedUrlData.signedUrl,
      expiresIn: 3600,
    });
  } catch (err) {
    console.error("[upload-document] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function OPTIONS(req: NextRequest) {
  return corsCheck(req) ?? new NextResponse(null, { status: 204 });
}
