'use client'

export type LOIStatus =
  | 'draft'
  | 'sent'
  | 'sent_manual'
  | 'delivered'
  | 'viewed'
  | 'signed'
  | 'completed'
  | 'declined'
  | 'voided'

const STATUS_MAP: Record<LOIStatus, { label: string; color: string; bg: string; border: string }> = {
  draft: {
    label: 'Draft',
    color: '#9BA8C0',
    bg: 'rgba(155,168,192,0.1)',
    border: 'rgba(155,168,192,0.25)',
  },
  sent: {
    label: 'Sent for Signature',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.1)',
    border: 'rgba(96,165,250,0.3)',
  },
  sent_manual: {
    label: 'Sent (Manual)',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.1)',
    border: 'rgba(96,165,250,0.3)',
  },
  delivered: {
    label: 'Delivered',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.1)',
    border: 'rgba(96,165,250,0.3)',
  },
  viewed: {
    label: 'Viewed',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.3)',
  },
  signed: {
    label: '✓ Signed',
    color: '#2ECC8B',
    bg: 'rgba(46,204,139,0.1)',
    border: 'rgba(46,204,139,0.3)',
  },
  completed: {
    label: '✓✓ Fully Executed',
    color: '#2ECC8B',
    bg: 'rgba(46,204,139,0.15)',
    border: 'rgba(46,204,139,0.4)',
  },
  declined: {
    label: '✗ Declined',
    color: '#f87171',
    bg: 'rgba(248,113,113,0.1)',
    border: 'rgba(248,113,113,0.3)',
  },
  voided: {
    label: 'Voided',
    color: '#9BA8C0',
    bg: 'rgba(155,168,192,0.1)',
    border: 'rgba(155,168,192,0.2)',
  },
}

interface LOIStatusBadgeProps {
  status: string
  size?: 'sm' | 'md' | 'lg'
}

export default function LOIStatusBadge({ status, size = 'md' }: LOIStatusBadgeProps) {
  const config = STATUS_MAP[status as LOIStatus] || STATUS_MAP.draft

  const fontSize = size === 'sm' ? '11px' : size === 'lg' ? '14px' : '12px'
  const padding = size === 'sm' ? '3px 10px' : size === 'lg' ? '7px 18px' : '5px 14px'

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding,
      borderRadius: '999px',
      background: config.bg,
      border: `1px solid ${config.border}`,
      color: config.color,
      fontSize,
      fontWeight: 600,
      letterSpacing: '0.02em',
      fontFamily: "'DM Sans', sans-serif",
      whiteSpace: 'nowrap',
    }}>
      {config.label}
    </span>
  )
}
