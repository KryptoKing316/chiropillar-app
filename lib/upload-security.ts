// ---------------------------------------------------------------------------
// Upload Security — validates PDF + image files before storing
// ---------------------------------------------------------------------------
// Accepts: PDF (financials, tax returns) and JPEG/PNG/WEBP (iPhone scans —
// common with 55+ trades owners who photograph documents instead of scanning).
// Each file is validated by filename, declared MIME, size, AND magic bytes.

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

type FileKind = "pdf" | "jpeg" | "png" | "webp";

interface FormatSpec {
  magic: number[][]; // can be multiple alternative signatures
  mime: string;
  exts: RegExp;
}

const FORMATS: Record<FileKind, FormatSpec> = {
  pdf: {
    magic: [[0x25, 0x50, 0x44, 0x46]], // %PDF
    mime: "application/pdf",
    exts: /\.pdf$/i,
  },
  jpeg: {
    magic: [[0xff, 0xd8, 0xff]], // SOI marker
    mime: "image/jpeg",
    exts: /\.jpe?g$/i,
  },
  png: {
    magic: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]], // PNG signature
    mime: "image/png",
    exts: /\.png$/i,
  },
  webp: {
    // RIFF....WEBP — magic check is partial (first 4 bytes are RIFF, then 4 bytes size, then WEBP)
    magic: [[0x52, 0x49, 0x46, 0x46]], // RIFF
    mime: "image/webp",
    exts: /\.webp$/i,
  },
};

const ALLOWED_MIME_TYPES = Object.values(FORMATS).map((f) => f.mime);

export interface UploadValidationResult {
  valid: boolean;
  error?: string;
  kind?: FileKind;
}

// Validate filename: no path traversal, no null bytes, must be one of the accepted extensions
export function validateFilename(filename: string): UploadValidationResult {
  if (!filename || typeof filename !== "string") {
    return { valid: false, error: "Filename is required." };
  }
  const name = filename.trim();

  if (name.length > 255) return { valid: false, error: "Filename too long (max 255 characters)." };
  if (name.includes("\0")) return { valid: false, error: "Invalid filename." };

  const dangerous = ["..", "/", "\\", "%2e%2e", "%2f", "%5c", "%00"];
  for (const pattern of dangerous) {
    if (name.toLowerCase().includes(pattern)) {
      return { valid: false, error: "Invalid filename: path traversal detected." };
    }
  }

  // Detect kind by extension
  let kind: FileKind | null = null;
  for (const [k, spec] of Object.entries(FORMATS) as [FileKind, FormatSpec][]) {
    if (spec.exts.test(name)) {
      kind = k;
      break;
    }
  }
  if (!kind) {
    return { valid: false, error: "Only PDF, JPEG, PNG, and WEBP files are accepted." };
  }

  // Safe characters check — alphanumeric, common punctuation, the extension
  if (!/^[\w\s\-_.()[\]]+\.(pdf|jpe?g|png|webp)$/i.test(name)) {
    return { valid: false, error: "Filename contains invalid characters." };
  }

  return { valid: true, kind };
}

export function validateMimeType(mimeType: string): UploadValidationResult {
  const normalized = mimeType.split(";")[0].trim().toLowerCase();
  if (!ALLOWED_MIME_TYPES.includes(normalized)) {
    return {
      valid: false,
      error: `Invalid file type: ${normalized}. Accepted: PDF, JPEG, PNG, WEBP.`,
    };
  }
  return { valid: true };
}

export function validateFileSize(sizeBytes: number): UploadValidationResult {
  if (sizeBytes <= 0) return { valid: false, error: "File is empty." };
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File too large: ${(sizeBytes / 1024 / 1024).toFixed(1)} MB. Maximum is 25 MB.`,
    };
  }
  return { valid: true };
}

// Validate magic bytes for the detected kind
export function validateMagicBytes(
  buffer: ArrayBuffer | Uint8Array,
  kind: FileKind
): UploadValidationResult {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const spec = FORMATS[kind];

  for (const signature of spec.magic) {
    if (bytes.length < signature.length) continue;
    let match = true;
    for (let i = 0; i < signature.length; i++) {
      if (bytes[i] !== signature[i]) {
        match = false;
        break;
      }
    }
    if (match) {
      // WEBP needs an extra check — bytes 8-11 must be "WEBP"
      if (kind === "webp") {
        const webpSig = [0x57, 0x45, 0x42, 0x50];
        if (bytes.length < 12) return { valid: false, error: "Invalid WEBP file." };
        for (let i = 0; i < 4; i++) {
          if (bytes[8 + i] !== webpSig[i]) {
            return { valid: false, error: "Invalid WEBP file (signature mismatch)." };
          }
        }
      }
      return { valid: true, kind };
    }
  }
  return {
    valid: false,
    error: `File does not appear to be a valid ${kind.toUpperCase()} (magic bytes mismatch).`,
  };
}

// Back-compat shim — old code may import validatePdfMagicBytes specifically
export function validatePdfMagicBytes(
  buffer: ArrayBuffer | Uint8Array
): UploadValidationResult {
  return validateMagicBytes(buffer, "pdf");
}

// Run all validations. Returns the detected file kind on success.
export async function validateUpload(file: File): Promise<UploadValidationResult> {
  const filenameCheck = validateFilename(file.name);
  if (!filenameCheck.valid || !filenameCheck.kind) return filenameCheck;
  const kind = filenameCheck.kind;

  const mimeCheck = validateMimeType(file.type);
  if (!mimeCheck.valid) return mimeCheck;

  const sizeCheck = validateFileSize(file.size);
  if (!sizeCheck.valid) return sizeCheck;

  // Read enough bytes for magic-byte check (12 covers all formats including WEBP)
  const headerSlice = file.slice(0, 12);
  const buffer = await headerSlice.arrayBuffer();
  const magicCheck = validateMagicBytes(buffer, kind);
  if (!magicCheck.valid) return magicCheck;

  return { valid: true, kind };
}

// Generate a safe storage path for a deal document.
// Format: deals/{dealId}/{docType}-{year}.{ext}
// Preserves extension so the analyze route can detect PDF vs image.
export function buildStoragePath(
  dealId: string,
  docType: string,
  year: number,
  ext: "pdf" | "jpg" | "png" | "webp" = "pdf"
): string {
  const safeDealId = dealId.replace(/[^a-zA-Z0-9\-]/g, "");
  const safeDocType = docType.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
  const safeYear = Math.max(2000, Math.min(2099, Math.floor(year)));
  const safeExt = (["pdf", "jpg", "png", "webp"] as const).includes(ext) ? ext : "pdf";
  return `deals/${safeDealId}/${safeDocType}-${safeYear}.${safeExt}`;
}

// Map a FileKind to a file extension used in storage paths
export function kindToExtension(kind: FileKind): "pdf" | "jpg" | "png" | "webp" {
  if (kind === "jpeg") return "jpg";
  return kind;
}

// Map a FileKind to a content-type for storage upload
export function kindToContentType(kind: FileKind): string {
  if (kind === "jpeg") return "image/jpeg";
  if (kind === "png") return "image/png";
  if (kind === "webp") return "image/webp";
  return "application/pdf";
}
