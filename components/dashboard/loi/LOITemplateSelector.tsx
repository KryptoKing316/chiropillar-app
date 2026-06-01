'use client'
import type { TemplateType } from '@/lib/loi-templates'

interface TemplateCard {
  id: TemplateType
  name: string
  tagline: string
  description: string
  features: string[]
  icon: string
  bestFor: string
}

const TEMPLATE_CARDS: TemplateCard[] = [
  {
    id: 'all_cash',
    name: 'All Cash Offer',
    tagline: 'Clean offer. Full amount at closing.',
    description: 'The simplest and most attractive offer you can make. You pay the full purchase price at closing — no installments, no financing complexity. Sellers love the certainty.',
    features: [
      'Full purchase price paid at closing',
      'No bank approval delays',
      'Fastest and cleanest structure',
      'Sellers trust it most',
    ],
    icon: '💵',
    bestFor: 'Best for: buyers with capital ready to deploy',
  },
  {
    id: 'seller_financed',
    name: 'Seller Financed',
    tagline: 'Down payment + monthly payments to you.',
    description: 'You pay a down payment at closing and the rest in monthly installments — paid directly to the seller, not a bank. No lender approval needed. Often the fastest to close.',
    features: [
      'Down payment at closing — seller gets cash immediately',
      'Monthly payments go directly to the seller',
      'No bank or SBA timeline — often closes in weeks',
      'Sellers often receive a higher total price',
    ],
    icon: '🤝',
    bestFor: 'Best for: deals where speed matters and seller is flexible',
  },
  {
    id: 'sba_7a',
    name: 'SBA 7(a) Financing',
    tagline: 'Government-backed loan. 60–90 day close.',
    description: 'SBA 7(a) is the most common way small businesses are purchased in America. The buyer puts 10% down, and an SBA-approved bank finances the rest. The seller receives the full price at closing.',
    features: [
      'Buyer puts 10% down at closing',
      'Government-backed loan covers the rest',
      'Seller receives full price — no installment risk',
      'Typical close in 60–90 days from signed LOI',
    ],
    icon: '🏛️',
    bestFor: 'Best for: deals over $1M where the buyer needs leverage',
  },
]

interface LOITemplateSelectorProps {
  selected: TemplateType | null
  onSelect: (type: TemplateType) => void
}

export default function LOITemplateSelector({ selected, onSelect }: LOITemplateSelectorProps) {
  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '24px',
          color: '#F2EEE7',
          marginBottom: '8px',
        }}>
          Choose an Offer Structure
        </h2>
        <p style={{ fontSize: '15px', color: '#9BA8C0', lineHeight: 1.6 }}>
          Kingdom Broker will pre-fill the offer based on your deal data. You can edit every field before sending.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
      }}>
        {TEMPLATE_CARDS.map((card) => {
          const isSelected = selected === card.id
          return (
            <button
              key={card.id}
              onClick={() => onSelect(card.id)}
              style={{
                textAlign: 'left',
                background: isSelected ? 'rgba(201,168,76,0.08)' : '#0F2347',
                border: isSelected
                  ? '2px solid #C9A84C'
                  : '2px solid rgba(255,255,255,0.08)',
                borderRadius: '14px',
                padding: '28px 24px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                position: 'relative',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#C9A84C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  color: '#0B1B3E',
                  fontWeight: 700,
                }}>
                  ✓
                </div>
              )}

              <div style={{ fontSize: '32px', marginBottom: '14px' }}>{card.icon}</div>

              <div style={{
                fontSize: '18px',
                fontWeight: 700,
                color: isSelected ? '#C9A84C' : '#F2EEE7',
                marginBottom: '4px',
              }}>
                {card.name}
              </div>

              <div style={{
                fontSize: '14px',
                color: isSelected ? '#E8C96A' : '#9BA8C0',
                marginBottom: '16px',
                fontStyle: 'italic',
              }}>
                {card.tagline}
              </div>

              <p style={{
                fontSize: '14px',
                color: '#9BA8C0',
                lineHeight: 1.65,
                marginBottom: '18px',
              }}>
                {card.description}
              </p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px' }}>
                {card.features.map((f, i) => (
                  <li key={i} style={{
                    fontSize: '13px',
                    color: '#9BA8C0',
                    padding: '5px 0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}>
                    <span style={{ color: '#2ECC8B', marginTop: '2px', flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <div style={{
                fontSize: '12px',
                color: isSelected ? '#C9A84C' : '#4A5880',
                fontWeight: 600,
                letterSpacing: '0.04em',
              }}>
                {card.bestFor}
              </div>
            </button>
          )
        })}
      </div>

      {selected && (
        <div style={{
          marginTop: '28px',
          padding: '16px 20px',
          background: 'rgba(201,168,76,0.06)',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: '10px',
          fontSize: '14px',
          color: '#C9A84C',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span style={{ fontSize: '18px' }}>✍️</span>
          <span>
            Great choice. Click <strong>Continue</strong> below and Kingdom Broker will pre-fill the offer using your deal data.
            You can edit every field before sending.
          </span>
        </div>
      )}
    </div>
  )
}
