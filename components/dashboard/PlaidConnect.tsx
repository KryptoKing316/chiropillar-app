'use client'

// ---------------------------------------------------------------------------
// PlaidConnect — One-click bank connect → 24 months transaction sync
// ---------------------------------------------------------------------------
// Flow:
//   1. Request a link_token from our server
//   2. Open Plaid Link with that token
//   3. On success Plaid returns a public_token in the browser
//   4. We POST public_token → server exchanges for access_token, stores in
//      plaid_connections, returns connection_id
//   5. We POST connection_id → /api/plaid/sync-transactions to pull 24mo
//      of trades-categorized transactions into bank_transactions
//
// Designed for 55+ trades owners who hate web forms — single button, plain
// language, no jargon. "Connect your bank" not "Authenticate via OAuth."
// ---------------------------------------------------------------------------

import { useCallback, useState } from 'react'
import { usePlaidLink, type PlaidLinkOnSuccessMetadata } from 'react-plaid-link'

interface PlaidConnectProps {
  dealId: string
  onConnected?: (result: { connectionId: string; institutionName: string; syncedCount: number }) => void
}

type Status = 'idle' | 'loading_token' | 'ready' | 'connecting' | 'syncing' | 'done' | 'error'

export default function PlaidConnect({ dealId, onConnected }: PlaidConnectProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    institution: string
    syncedCount: number
    addBackCandidates: number
  } | null>(null)

  const startFlow = useCallback(async () => {
    setStatus('loading_token')
    setError(null)
    try {
      const res = await fetch('/api/plaid/link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deal_id: dealId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Could not start Plaid flow')
      }
      const data = await res.json()
      setLinkToken(data.link_token)
      setStatus('ready')
    } catch (e) {
      setStatus('error')
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }, [dealId])

  const onSuccess = useCallback(
    async (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
      setStatus('connecting')
      try {
        const institutionName = metadata.institution?.name || 'Your Bank'
        // Exchange public token for access token
        const exchangeRes = await fetch('/api/plaid/exchange-public-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deal_id: dealId,
            public_token: publicToken,
            institution_name: institutionName,
          }),
        })

        if (!exchangeRes.ok) {
          const data = await exchangeRes.json().catch(() => ({}))
          throw new Error(data.error || 'Connection failed')
        }

        const { connection_id } = await exchangeRes.json()

        // Kick off transaction sync
        setStatus('syncing')
        const syncRes = await fetch('/api/plaid/sync-transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deal_id: dealId, connection_id }),
        })

        if (!syncRes.ok) {
          const data = await syncRes.json().catch(() => ({}))
          throw new Error(data.error || 'Transaction sync failed')
        }

        const syncData = await syncRes.json()
        setResult({
          institution: institutionName,
          syncedCount: syncData.synced,
          addBackCandidates: syncData.add_back_candidates ?? 0,
        })
        setStatus('done')

        if (onConnected) {
          onConnected({
            connectionId: connection_id,
            institutionName,
            syncedCount: syncData.synced,
          })
        }
      } catch (e) {
        setStatus('error')
        setError(e instanceof Error ? e.message : 'Unknown error')
      }
    },
    [dealId, onConnected]
  )

  const onExit = useCallback(() => {
    if (status === 'ready') setStatus('idle')
  }, [status])

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit,
  })

  // Auto-open Plaid Link once token is loaded and SDK is ready
  if (status === 'ready' && ready && linkToken) {
    open()
    // We do not change status here — usePlaidLink callbacks handle it
  }

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
        {/* Plaid wordmark — Plaid's signature lowercase "plaid" in their brand navy */}
        <svg width="110" height="38" viewBox="0 0 110 38" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Plaid">
          <text x="0" y="31" fontFamily="'Helvetica Neue', 'Helvetica', system-ui, sans-serif" fontWeight="700" fontSize="34" fill="#111111" letterSpacing="-0.8">
            plaid
          </text>
        </svg>
        <div
          style={{
            marginLeft: 'auto',
            fontFamily: "'DM Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#2ECC8B',
            background: 'rgba(46,204,139,0.10)',
            border: '1px solid rgba(46,204,139,0.25)',
            padding: '5px 12px',
            borderRadius: '999px',
            fontWeight: 600,
          }}
        >
          12,000+ Banks
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
              color: '#C9A84C',
              marginBottom: '4px',
            }}
          >
            Bank Connection
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
            Connect your bank — 24 months of transactions, instantly
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--kb-text-secondary)', margin: '4px 0 0', maxWidth: '520px' }}>
            Bank-level security. We never see your password — Plaid handles the
            login directly with your bank. Read-only access used to verify
            revenue, catch add-backs, and cross-check tax returns.
          </p>
        </div>
        {status !== 'done' && (
          <button
            type="button"
            onClick={startFlow}
            disabled={status === 'loading_token' || status === 'connecting' || status === 'syncing'}
            style={{
              background: '#C9A84C',
              color: '#0B1B3E',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {status === 'idle' && 'Connect Bank'}
            {status === 'loading_token' && 'Preparing…'}
            {status === 'ready' && 'Opening…'}
            {status === 'connecting' && 'Connecting…'}
            {status === 'syncing' && 'Syncing 24 months…'}
            {status === 'error' && 'Try Again'}
          </button>
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
          <strong>✓ Connected to {result.institution}.</strong> Synced{' '}
          {result.syncedCount} transactions.{' '}
          {result.addBackCandidates > 0 && (
            <>
              Flagged <strong style={{ color: '#C9A84C' }}>
                {result.addBackCandidates} add-back candidates
              </strong> for your review on the Financials tab.
            </>
          )}
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
