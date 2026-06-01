'use server'
// ============================================================
// KINGDOM BROKER — DOCUSIGN INTEGRATION
// Gracefully degrades when env vars are absent.
// Returns null/error objects instead of throwing.
// Uses htmlDocument — no PDF conversion needed.
// ============================================================

// Computed name prevents Next.js static analyzer from tracing/bundling
// this AMD-style package (docusign-esign). It is loaded at runtime only
// when DOCUSIGN_INTEGRATION_KEY is configured.
const _DS_PKG = ['docusign', 'esign'].join('-')

function isDocuSignConfigured(): boolean {
  return !!(
    process.env.DOCUSIGN_INTEGRATION_KEY &&
    process.env.DOCUSIGN_USER_ID &&
    process.env.DOCUSIGN_ACCOUNT_ID &&
    process.env.DOCUSIGN_PRIVATE_KEY &&
    process.env.DOCUSIGN_BASE_PATH
  )
}

// ============================================================
// GET DOCUSIGN CLIENT
// ============================================================

export async function getDocuSignClient(): Promise<{ client: unknown; accountId: string } | null> {
  if (!isDocuSignConfigured()) return null

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const docusign = require(_DS_PKG)
    const apiClient = new docusign.ApiClient()
    apiClient.setBasePath(process.env.DOCUSIGN_BASE_PATH!)

    const privateKey = Buffer.from(process.env.DOCUSIGN_PRIVATE_KEY!, 'base64')

    const results = await apiClient.requestJWTUserToken(
      process.env.DOCUSIGN_INTEGRATION_KEY!,
      process.env.DOCUSIGN_USER_ID!,
      ['signature'],
      privateKey,
      3600
    )

    apiClient.addDefaultHeader('Authorization', `Bearer ${results.body.access_token}`)

    return {
      client: apiClient,
      accountId: process.env.DOCUSIGN_ACCOUNT_ID!,
    }
  } catch (err) {
    console.error('[DocuSign] Auth error:', err instanceof Error ? err.message : String(err))
    return null
  }
}

// ============================================================
// CREATE ENVELOPE
// ============================================================

export interface CreateEnvelopeResult {
  success: boolean
  envelopeId?: string
  error?: string
  notConfigured?: boolean
}

export async function createEnvelope(
  loiHtml: string,
  buyerName: string,
  buyerEmail: string,
  buyerClientUserId: string,
  sellerName: string,
  sellerEmail: string,
  sellerClientUserId: string | null,
  businessName: string
): Promise<CreateEnvelopeResult> {
  if (!isDocuSignConfigured()) {
    return { success: false, notConfigured: true, error: 'DocuSign not configured' }
  }

  const dsClient = await getDocuSignClient()
  if (!dsClient) {
    return { success: false, error: 'Failed to authenticate with DocuSign' }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const docusign = require(_DS_PKG)
    const envelopesApi = new docusign.EnvelopesApi(dsClient.client)

    // Encode HTML as base64
    const htmlBase64 = Buffer.from(loiHtml, 'utf-8').toString('base64')

    const envelopeDefinition = {
      emailSubject: `Letter of Intent — ${businessName} — Kingdom Broker`,
      emailBlurb: `Please review and sign the Letter of Intent for the acquisition of ${businessName}.`,
      documents: [
        {
          htmlDefinition: {
            source: `data:text/html;base64,${htmlBase64}`,
          },
          name: `LOI — ${businessName}.html`,
          documentId: '1',
        },
      ],
      recipients: {
        signers: [
          {
            email: buyerEmail,
            name: buyerName,
            recipientId: '1',
            routingOrder: '1',
            clientUserId: buyerClientUserId,
            tabs: {
              signHereTabs: [
                {
                  anchorString: '[BUYER SIGNATURE LINE]',
                  anchorUnits: 'pixels',
                  anchorXOffset: '0',
                  anchorYOffset: '10',
                },
              ],
              dateSignedTabs: [
                {
                  anchorString: '[BUYER SIGNATURE LINE]',
                  anchorUnits: 'pixels',
                  anchorXOffset: '180',
                  anchorYOffset: '10',
                },
              ],
            },
          },
          {
            email: sellerEmail,
            name: sellerName,
            recipientId: '2',
            routingOrder: '2',
            ...(sellerClientUserId ? { clientUserId: sellerClientUserId } : {}),
            tabs: {
              signHereTabs: [
                {
                  anchorString: '[SELLER ACCEPTANCE]',
                  anchorUnits: 'pixels',
                  anchorXOffset: '0',
                  anchorYOffset: '10',
                },
              ],
              dateSignedTabs: [
                {
                  anchorString: '[SELLER ACCEPTANCE]',
                  anchorUnits: 'pixels',
                  anchorXOffset: '180',
                  anchorYOffset: '10',
                },
              ],
            },
          },
        ],
      },
      status: 'sent',
    }

    const result = await envelopesApi.createEnvelope(dsClient.accountId, {
      envelopeDefinition,
    })

    return { success: true, envelopeId: result.envelopeId }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[DocuSign] Create envelope error:', msg)
    return { success: false, error: msg }
  }
}

// ============================================================
// GET SIGNING URL
// ============================================================

export async function getSigningUrl(
  envelopeId: string,
  signerEmail: string,
  signerName: string,
  clientUserId: string,
  recipientId: string,
  returnUrl: string
): Promise<{ signingUrl: string } | { error: string; notConfigured?: boolean }> {
  if (!isDocuSignConfigured()) {
    return { error: 'DocuSign not configured', notConfigured: true }
  }

  const dsClient = await getDocuSignClient()
  if (!dsClient) return { error: 'Failed to authenticate with DocuSign' }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const docusign = require(_DS_PKG)
    const envelopesApi = new docusign.EnvelopesApi(dsClient.client)

    const viewRequest = {
      authenticationMethod: 'none',
      clientUserId,
      recipientId,
      returnUrl,
      userName: signerName,
      email: signerEmail,
    }

    const result = await envelopesApi.createRecipientView(dsClient.accountId, envelopeId, {
      recipientViewRequest: viewRequest,
    })

    return { signingUrl: result.url }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[DocuSign] Signing URL error:', msg)
    return { error: msg }
  }
}

// ============================================================
// GET ENVELOPE STATUS
// ============================================================

export async function getEnvelopeStatus(
  envelopeId: string
): Promise<{ status: string; completedAt?: string } | { error: string; notConfigured?: boolean }> {
  if (!isDocuSignConfigured()) {
    return { error: 'DocuSign not configured', notConfigured: true }
  }

  const dsClient = await getDocuSignClient()
  if (!dsClient) return { error: 'Auth failed' }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const docusign = require(_DS_PKG)
    const envelopesApi = new docusign.EnvelopesApi(dsClient.client)
    const envelope = await envelopesApi.getEnvelope(dsClient.accountId, envelopeId)
    return { status: envelope.status, completedAt: envelope.completedDateTime }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { error: msg }
  }
}

// ============================================================
// DOWNLOAD SIGNED PDF
// ============================================================

export async function downloadSignedPDF(
  envelopeId: string
): Promise<Buffer | null> {
  if (!isDocuSignConfigured()) return null

  const dsClient = await getDocuSignClient()
  if (!dsClient) return null

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const docusign = require(_DS_PKG)
    const envelopesApi = new docusign.EnvelopesApi(dsClient.client)
    const pdfBuffer = await envelopesApi.getDocument(dsClient.accountId, envelopeId, 'combined')
    return pdfBuffer
  } catch (err) {
    console.error('[DocuSign] Download PDF error:', err instanceof Error ? err.message : String(err))
    return null
  }
}
