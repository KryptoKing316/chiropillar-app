'use client'

// ---------------------------------------------------------------------------
// QboConnect — One-click QuickBooks Online connect → 3-year P&L + BS + CoA
// ---------------------------------------------------------------------------
// Unlike Plaid (which uses a JS SDK that opens in-page), QBO uses a server
// redirect to Intuit's OAuth consent screen. Flow:
//   1. User clicks "Connect QuickBooks" → window.location to /api/qbo/authorize
//   2. Server creates Intuit OAuth URL + CSRF nonce cookie, redirects user
//   3. User grants access on intuit.com
//   4. Intuit redirects back to /api/qbo/callback?code=...&realmId=...
//   5. Server exchanges code, stores tokens, redirects to /financials?qbo_connected=1
//   6. This component reads the qbo_connected query param and triggers /api/qbo/sync
// ---------------------------------------------------------------------------

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

interface QboConnectProps {
  dealId: string
  /** if a qbo_connections row already exists, pass it here so the UI shows "Re-sync" instead of "Connect" */
  existingConnectionId?: string | null
  existingCompanyName?: string | null
  onSynced?: (result: { plRows: number; bsRows: number; accountCount: number }) => void
}

type Status = 'idle' | 'syncing' | 'done' | 'error'

export default function QboConnect({
  dealId,
  existingConnectionId,
  existingCompanyName,
  onSynced,
}: QboConnectProps) {
  const params = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    plRows: number
    bsRows: number
    accountCount: number
  } | null>(null)

  const runSync = useCallback(
    async (connectionId: string) => {
      setStatus('syncing')
      try {
        const res = await fetch('/api/qbo/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deal_id: dealId, connection_id: connectionId }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'QBO sync failed')
        }
        const data = await res.json()
        const r = {
          plRows: data.pl_rows ?? 0,
          bsRows: data.bs_rows ?? 0,
          accountCount: data.account_count ?? 0,
        }
        setResult(r)
        setStatus('done')
        if (onSynced) onSynced(r)
      } catch (e) {
        setStatus('error')
        setError(e instanceof Error ? e.message : 'Unknown error')
      }
    },
    [dealId, onSynced]
  )

  // Detect post-OAuth redirect — if ?qbo_connected=1 is on the URL, fetch the
  // newly-created connection and kick off the sync. Strip the param afterward
  // so a refresh doesn't re-trigger.
  useEffect(() => {
    const connected = params.get('qbo_connected')
    if (!connected) return

    // Find the most recent connection for this deal — easiest path: ask the
    // server (we don't have one yet, so this UX assumes existingConnectionId
    // is passed in by the parent <FinancialsPage> after refetch). For now,
    // we just clear the query string and let the parent component refetch.
    router.replace('/financials')
    // If parent passed an existingConnectionId via props on refetch, the
    // effect below will pick it up and trigger sync.
  }, [params, router])

  // Auto-sync when an existing connection appears (e.g. parent refetched after
  // OAuth redirect)
  useEffect(() => {
    if (existingConnectionId && status === 'idle') {
      // Only auto-sync if we don't already have a result rendered
      if (!result) runSync(existingConnectionId)
    }
  }, [existingConnectionId, status, result, runSync])

  const handleConnect = useCallback(() => {
    window.location.href = `/api/qbo/authorize?deal_id=${encodeURIComponent(dealId)}`
  }, [dealId])

  const handleReSync = useCallback(() => {
    if (existingConnectionId) runSync(existingConnectionId)
  }, [existingConnectionId, runSync])

  return (
    <div
      style={{
        background: 'var(--kb-bg-panel)',
        border: '1px solid var(--kb-border)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px',
      }}
    >
      {/* ── Partner badge ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', paddingBottom: '18px', borderBottom: '1px solid var(--kb-border-subtle)' }}>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '13px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--kb-text-muted)',
            fontWeight: 600,
          }}
        >
          Powered by
        </div>
        {/* QuickBooks wordmark — official QB icon (rounded green square w/ "qb") + "quickbooks" wordmark */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
          {/* QB icon: rounded green square with white "qb" in custom font */}
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="QuickBooks">
            <rect width="38" height="38" rx="10" fill="#2CA01C" />
            <text x="19" y="27" fontFamily="'Helvetica Neue', 'Helvetica', system-ui, sans-serif" fontWeight="700" fontSize="20" fill="#FFFFFF" textAnchor="middle" letterSpacing="-0.5">
              qb
            </text>
          </svg>
          {/* "quickbooks" wordmark */}
          <svg width="150" height="36" viewBox="0 0 150 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="quickbooks">
            <text x="0" y="29" fontFamily="'Helvetica Neue', 'Helvetica', system-ui, sans-serif" fontWeight="700" fontSize="28" fill="#2CA01C" letterSpacing="-0.6">
              quickbooks
            </text>
          </svg>
        </div>
        <div
          style={{
            marginLeft: 'auto',
            fontFamily: "'DM Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#2CA01C',
            background: 'rgba(44,160,28,0.10)',
            border: '1px solid rgba(44,160,28,0.25)',
            padding: '5px 12px',
            borderRadius: '999px',
            fontWeight: 600,
          }}
        >
          Official Integration
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#2CA01C', // Intuit green
              marginBottom: '4px',
            }}
          >
            Accounting Connection
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '20px',
              fontWeight: 600,
              margin: 0,
              color: 'var(--kb-text)',
            }}
          >
            {existingCompanyName
              ? `Connected: ${existingCompanyName}`
              : 'Already on QuickBooks? Connect in 60 seconds.'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--kb-text-secondary)', margin: '4px 0 0', maxWidth: '520px' }}>
            Read-only access. We pull your last 3 fiscal years of P&amp;L,
            Balance Sheet, and full Chart of Accounts — then cross-check
            against your tax returns and bank data automatically.
          </p>
        </div>
        {!existingConnectionId && (
          <button
            type="button"
            onClick={handleConnect}
            style={{
              background: '#2CA01C',
              color: '#FFFFFF',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Connect QuickBooks
          </button>
        )}
        {existingConnectionId && status !== 'syncing' && (
          <button
            type="button"
            onClick={handleReSync}
            style={{
              background: 'transparent',
              color: 'var(--kb-text)',
              padding: '10px 20px',
              border: '1px solid var(--kb-border)',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Re-sync
          </button>
        )}
        {status === 'syncing' && (
          <div style={{ fontSize: '13px', color: '#C9A84C', whiteSpace: 'nowrap', padding: '10px 0' }}>
            Pulling 3 years of reports…
          </div>
        )}
      </div>

      {status === 'done' && result && (
        <div
          style={{
            marginTop: '16px',
            padding: '14px 18px',
            background: 'rgba(46,204,139,0.08)',
            border: '1px solid rgba(46,204,139,0.25)',
            borderRadius: '8px',
            fontSize: '13px',
            color: 'var(--kb-text)',
          }}
        >
          <strong>✓ Synced.</strong> {result.plRows} P&amp;L year(s) ·{' '}
          {result.bsRows} Balance Sheet year(s) ·{' '}
          {result.accountCount} accounts in Chart of Accounts.
        </div>
      )}

      {status === 'error' && error && (
        <div
          style={{
            marginTop: '16px',
            padding: '14px 18px',
            background: 'rgba(232,73,73,0.08)',
            border: '1px solid rgba(232,73,73,0.25)',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#E84949',
          }}
        >
          {error}
        </div>
      )}
    </div>
  )
}
