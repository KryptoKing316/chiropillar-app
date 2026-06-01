'use client'
import { useRef } from 'react'

interface LOIPreviewProps {
  loiHtml: string
  compact?: boolean
}

export default function LOIPreview({ loiHtml, compact = false }: LOIPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null)

  function handlePrint() {
    const content = printRef.current?.innerHTML || loiHtml
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Letter of Intent — Kingdom Broker</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;600&display=swap');
            body { margin: 0; padding: 40px; font-family: 'DM Sans', Georgia, serif; color: #1a1a1a; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print() }, 500)
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Toolbar */}
      {!compact && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          padding: '12px 16px',
          background: '#0F2347',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ fontSize: '14px', color: '#9BA8C0' }}>
            Preview — this is exactly how the document will appear to the buyer and seller
          </div>
          <button
            onClick={handlePrint}
            style={{
              padding: '8px 20px',
              background: 'transparent',
              border: '1px solid rgba(201,168,76,0.4)',
              borderRadius: '7px',
              color: '#C9A84C',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            🖨️ Print / Download
          </button>
        </div>
      )}

      {/* Document — white background, black text */}
      <div
        ref={printRef}
        style={{
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid rgba(0,0,0,0.1)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          maxHeight: compact ? '500px' : 'none',
          overflowY: compact ? 'auto' : 'visible',
        }}
      >
        {loiHtml ? (
          <div
            dangerouslySetInnerHTML={{ __html: loiHtml }}
            style={{
              // Override any dark styles from the iframe context
              color: '#1a1a1a',
              background: '#ffffff',
            }}
          />
        ) : (
          <div style={{
            padding: '80px 40px',
            textAlign: 'center',
            color: '#888',
            fontSize: '15px',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.3 }}>📄</div>
            Fill in the fields on the left to see your LOI preview here.
          </div>
        )}
      </div>
    </div>
  )
}
