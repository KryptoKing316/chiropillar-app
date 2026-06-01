'use client'
import { useEffect, useRef } from 'react'
import type { LOITemplate, LOIField } from '@/lib/loi-templates'

interface LOIEditorProps {
  template: LOITemplate
  fields: Record<string, string>
  onChange: (key: string, value: string) => void
}

const SECTION_LABELS: Record<string, string> = {
  basics: 'Business & Seller Information',
  terms: 'Offer Terms',
  buyer: 'Buyer Information',
}

function CurrencyInput({ value, onChange, placeholder }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    if (raw === '') { onChange(''); return }
    const num = parseFloat(raw)
    if (!isNaN(num)) {
      onChange('$' + Math.round(num).toLocaleString('en-US'))
    } else {
      onChange(raw)
    }
  }

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder || '$0'}
      style={inputStyle}
    />
  )
}

function AutoExpandTextarea({ value, onChange, placeholder }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = ref.current.scrollHeight + 'px'
    }
  }, [value])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      style={{
        ...inputStyle,
        resize: 'none',
        overflow: 'hidden',
        minHeight: '80px',
      }}
    />
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#F2EEE7',
  fontSize: '15px',
  fontFamily: "'DM Sans', sans-serif",
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.15s',
}

function renderField(field: LOIField, value: string, onChange: (v: string) => void) {
  switch (field.type) {
    case 'currency':
      return <CurrencyInput value={value} onChange={onChange} placeholder={field.placeholder} />

    case 'textarea':
      return (
        <AutoExpandTextarea
          value={value}
          onChange={onChange}
          placeholder={field.placeholder}
        />
      )

    case 'select':
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="">Select...</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )

    case 'date':
      return (
        <input
          type="date"
          value={value && !value.includes(' ')
            ? value
            : (value ? new Date(value).toISOString().split('T')[0] : '')}
          onChange={(e) => {
            const d = new Date(e.target.value + 'T12:00:00')
            onChange(d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
          }}
          style={{ ...inputStyle, colorScheme: 'dark' }}
        />
      )

    case 'number':
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || '0'}
          style={inputStyle}
        />
      )

    case 'email':
      return (
        <input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'email@example.com'}
          style={inputStyle}
        />
      )

    case 'tel':
      return (
        <input
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || '555-000-0000'}
          style={inputStyle}
        />
      )

    default:
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || ''}
          style={inputStyle}
        />
      )
  }
}

export default function LOIEditor({ template, fields, onChange }: LOIEditorProps) {
  // Group fields by section
  const sections: Record<string, LOIField[]> = {}
  for (const field of template.fields) {
    const section = field.section || 'terms'
    if (!sections[section]) sections[section] = []
    sections[section].push(field)
  }

  const sectionOrder = ['basics', 'terms', 'buyer']

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: 'rgba(201,168,76,0.08)',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#C9A84C',
        }}>
          <span>✨</span>
          Pre-filled by AI — review and edit anything
        </div>
      </div>

      {sectionOrder.map((sectionKey) => {
        const sectionFields = sections[sectionKey]
        if (!sectionFields || sectionFields.length === 0) return null

        return (
          <div key={sectionKey} style={{ marginBottom: '36px' }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              borderBottom: '1px solid rgba(201,168,76,0.2)',
              paddingBottom: '8px',
              marginBottom: '20px',
            }}>
              {SECTION_LABELS[sectionKey] || sectionKey}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '18px',
            }}>
              {sectionFields.map((field) => {
                const isFullWidth = field.type === 'textarea'
                return (
                  <div
                    key={field.key}
                    style={{
                      gridColumn: isFullWidth ? '1 / -1' : 'auto',
                    }}
                  >
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      color: '#9BA8C0',
                      marginBottom: '7px',
                      fontWeight: 500,
                    }}>
                      {field.label}
                    </label>
                    {renderField(
                      field,
                      fields[field.key] || '',
                      (v) => onChange(field.key, v)
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
