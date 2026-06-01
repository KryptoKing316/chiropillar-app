'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Deal stage progression ───────────────────────────────────────────────────
const STAGES = ['NDA', 'LOI', 'Due Diligence', 'Purchase Agreement', 'Closed']

// Current demo status, in production these come from Supabase
const STAGE_STATUS: Record<string, 'pending' | 'active' | 'complete'> = {
  'NDA':                'active',
  'LOI':                'pending',
  'Due Diligence':      'pending',
  'Purchase Agreement': 'pending',
  'Closed':             'pending',
}

// ── NDA Template content ─────────────────────────────────────────────────────
// Rebuilt from 5 real M&A NDAs: Direction.com/KB Mutual, Hummingbird TX Sale,
// Acquivest Accounting Firm, Aegis FinTech, Sertainty/Eric Skeldon, Brazen Animation
const NDA_STANDARD = `CONFIDENTIAL NON-DISCLOSURE AGREEMENT
Standard (One-Way), Seller Protects Business Information
Facilitated by Kingdom Broker

Effective Date: {{date}}

PARTIES

  Seller / Disclosing Party:  {{seller_name}}, on behalf of {{business_name}}
  Buyer / Receiving Party:    {{buyer_name}}, on behalf of {{buyer_entity}}
  Intermediary / Facilitator: Kingdom Broker, Inc. · KingdomBroker.com

─────────────────────────────────────────────────────────────────
RECITALS
─────────────────────────────────────────────────────────────────
The Buyer is evaluating a potential acquisition of all or substantially all of the assets or equity of {{business_name}} (the "Transaction"), facilitated by Kingdom Broker as intermediary. To evaluate the Transaction, the Seller will provide the Buyer with certain non-public Evaluation Material (defined below). This Agreement governs the Buyer's use and protection of that material.

─────────────────────────────────────────────────────────────────
1. EVALUATION MATERIAL
─────────────────────────────────────────────────────────────────
"Evaluation Material" means all information, in any form, oral or written, furnished by or on behalf of {{business_name}} to the Buyer or its Representatives in connection with the Transaction, together with any analyses, notes, summaries, or documents prepared by the Buyer that contain or reflect such information. Evaluation Material includes, without limitation:

  • Financial statements, tax returns, and revenue data (all years)
  • Customer names, contracts, pricing, and account history
  • Employee records, compensation, titles, and tenure
  • Supplier, vendor, and subcontractor relationships
  • Trade secrets, proprietary processes, and operational know-how
  • Business plans, projections, and strategic information
  • The fact that the business is for sale and that discussions are taking place

"Evaluation Material" does not include information that: (a) is or becomes publicly available other than through breach of this Agreement; (b) was already in the Buyer's possession prior to disclosure, with documented proof; (c) is independently developed by the Buyer without use of Evaluation Material; or (d) is received from a third party not under any confidentiality obligation to the Seller.

─────────────────────────────────────────────────────────────────
2. REPRESENTATIVES
─────────────────────────────────────────────────────────────────
"Representatives" means the Buyer's directors, officers, employees, attorneys, accountants, financial advisors, lenders, and potential equity partners who need to know the Evaluation Material to evaluate the Transaction. The Buyer is responsible for ensuring that all Representatives comply with the terms of this Agreement.

─────────────────────────────────────────────────────────────────
3. BUYER'S OBLIGATIONS
─────────────────────────────────────────────────────────────────
The Buyer agrees to:
  (a) Keep all Evaluation Material strictly confidential.
  (b) Not disclose Evaluation Material to any person other than Representatives without prior written consent from the Seller or Kingdom Broker.
  (c) Use Evaluation Material solely for evaluating the Transaction, for no other purpose.
  (d) Protect Evaluation Material with at least the same degree of care it uses for its own confidential information, and in no event less than reasonable care.
  (e) Not disclose to any person that the business is for sale, that discussions are taking place, or that Evaluation Material has been provided, without prior written consent.

─────────────────────────────────────────────────────────────────
4. NO CONTACT WITH SELLER'S BUSINESS
─────────────────────────────────────────────────────────────────
The Buyer agrees that all communications and negotiations concerning {{business_name}} will be conducted exclusively through Kingdom Broker. The Buyer will NOT contact, directly or indirectly, any of the following without the prior written authorization of Kingdom Broker:

  • The Seller or any owner, partner, or principal of {{business_name}}
  • Any employee, manager, or staff member of {{business_name}}
  • Any customer, client, or account of {{business_name}}
  • Any supplier, vendor, landlord, or lender of {{business_name}}

Unauthorized contact may jeopardize the Transaction and shall constitute a material breach of this Agreement.

─────────────────────────────────────────────────────────────────
5. KINGDOM BROKER COMMISSION PROTECTION
─────────────────────────────────────────────────────────────────
If the Buyer directly or indirectly contacts the Seller or any Related Party (employees, customers, suppliers, or affiliates of {{business_name}}) and such contact results in a transaction, with or without Kingdom Broker's further involvement, the Buyer agrees to pay Kingdom Broker its full advisory fee as outlined in the listing agreement for {{business_name}}. This obligation survives the termination or expiration of this Agreement for a period of twenty-four (24) months.

─────────────────────────────────────────────────────────────────
6. NO SOLICITATION OF EMPLOYEES
─────────────────────────────────────────────────────────────────
For the duration of this Agreement and for eighteen (18) months following its expiration or termination, the Buyer will not directly or indirectly solicit, recruit, or hire any current or former employee of {{business_name}} without prior written consent from the Seller.

─────────────────────────────────────────────────────────────────
7. LEGAL DISCLOSURE, NOTICE REQUIRED
─────────────────────────────────────────────────────────────────
If the Buyer is required by law, regulation, subpoena, or court order to disclose any Evaluation Material, the Buyer shall, to the extent permitted by law: (i) provide the Seller and Kingdom Broker with prompt written notice before any disclosure; (ii) cooperate in seeking a protective order or other limitation on disclosure; and (iii) disclose only the minimum Evaluation Material necessary to comply with the legal requirement.

─────────────────────────────────────────────────────────────────
8. RETURN OR DESTRUCTION OF EVALUATION MATERIAL
─────────────────────────────────────────────────────────────────
If the Seller or Kingdom Broker requests it, or if the Transaction does not proceed, the Buyer will promptly (within five business days) return or destroy all Evaluation Material and any copies or derivatives, and provide written certification of such destruction.

─────────────────────────────────────────────────────────────────
9. INFORMATION PROVIDED BY SELLER, NOT VERIFIED
─────────────────────────────────────────────────────────────────
All Evaluation Material is provided by the Seller and has not been independently verified by Kingdom Broker. Kingdom Broker makes no representations or warranties, express or implied, as to the accuracy or completeness of any Evaluation Material. The Buyer is responsible for conducting its own due diligence.

─────────────────────────────────────────────────────────────────
10. TERM
─────────────────────────────────────────────────────────────────
This Agreement is effective as of the Effective Date above and remains in effect for two (2) years. All confidentiality obligations survive expiration or termination of this Agreement for the same two-year period, or until a definitive Purchase Agreement is fully executed, whichever occurs first.

─────────────────────────────────────────────────────────────────
11. NO LICENSE, NO COMMITMENT
─────────────────────────────────────────────────────────────────
Nothing in this Agreement grants the Buyer any right, title, or license in or to the Evaluation Material or the business. Neither party is obligated to proceed with the Transaction.

─────────────────────────────────────────────────────────────────
12. REMEDIES
─────────────────────────────────────────────────────────────────
The Buyer acknowledges that breach of this Agreement would cause irreparable harm for which monetary damages would be inadequate. The Seller and Kingdom Broker are entitled to seek equitable relief, including injunction, without the requirement to post a bond, in addition to all other remedies at law or equity.

─────────────────────────────────────────────────────────────────
13. AUTHORITY TO SIGN
─────────────────────────────────────────────────────────────────
The Buyer represents that the person signing this Agreement has full authority to bind the Buyer and its entity (if applicable) to the terms of this Agreement.

─────────────────────────────────────────────────────────────────
14. GOVERNING LAW
─────────────────────────────────────────────────────────────────
This Agreement is governed by the laws of the State of {{state}}, without regard to conflict of laws principles. Any disputes shall be resolved in the courts of {{county}} County, {{state}}.

─────────────────────────────────────────────────────────────────

IMPORTANT NOTICE, FOR EDUCATIONAL PURPOSES ONLY
Kingdom Broker provides this NDA template as a reference and starting point for M&A transactions. This document does not constitute legal advice and does not create an attorney-client relationship. Kingdom Broker is not a law firm. Every transaction involves unique circumstances. Both parties are strongly encouraged to consult with a licensed attorney before signing any agreement.

─────────────────────────────────────────────────────────────────

AGREED AND ACCEPTED:

BUYER / RECEIVING PARTY (Signs Only)
___________________________________
Signature

Printed Name:  {{buyer_name}}
Entity:        {{buyer_entity}}
Date:          _______________

─────────────────────────────────────────────────────────────────
Note: This is a one-way (unilateral) Non-Disclosure Agreement.
Only the Buyer signs. The Seller is the Disclosing Party and is
protected by the terms of this Agreement without a countersignature.
─────────────────────────────────────────────────────────────────
Facilitated by Kingdom Broker, Inc.
Eric Skeldon · Eric@KingdomBroker.com · 469-494-9890
KingdomBroker.com · Plano, Texas`

// NDA_MUTUAL removed — Kingdom Broker uses one-way NDAs only (buyer signs, seller is protected)

// Placeholder to keep linter happy — not used
const _NDA_MUTUAL_REMOVED = `MUTUAL NON-DISCLOSURE AGREEMENT
Two-Way, Both Parties Protect Each Other's Information
Facilitated by Kingdom Broker

Effective Date: {{date}}

PARTIES

  Party A / Seller:           {{seller_name}}, on behalf of {{business_name}}
  Party B / Buyer:            {{buyer_name}}, on behalf of {{buyer_entity}}
  Intermediary / Facilitator: Kingdom Broker, Inc. · KingdomBroker.com

Each party may act as a "Disclosing Party" when sharing information and as a "Receiving Party" when receiving information.

─────────────────────────────────────────────────────────────────
RECITALS
─────────────────────────────────────────────────────────────────
Both parties are evaluating a potential acquisition of {{business_name}} (the "Transaction"), facilitated by Kingdom Broker as intermediary. In connection with evaluating the Transaction, both parties may share non-public information with each other. This Agreement protects both parties' Evaluation Material equally and governs its use.

─────────────────────────────────────────────────────────────────
1. EVALUATION MATERIAL
─────────────────────────────────────────────────────────────────
"Evaluation Material" means all information, in any form, that either party (the "Disclosing Party") furnishes to the other party (the "Receiving Party") or its Representatives in connection with the Transaction, including but not limited to:

  Seller's Evaluation Material:
  • Financial statements, tax returns, and revenue data (all years)
  • Customer names, contracts, pricing, and account history
  • Employee records, compensation, and operational details
  • Supplier, vendor, and subcontractor relationships
  • Trade secrets, processes, and proprietary know-how
  • Business plans, projections, and strategic information

  Buyer's Evaluation Material:
  • Investment thesis, acquisition strategy, and criteria
  • Fund structure, capital sources, and financing relationships
  • Portfolio company information and operational strategies
  • Deal structure preferences and return expectations

  For both parties: any analyses, notes, or documents prepared that contain or reflect the other party's information.

"Evaluation Material" does not include information that: (a) is or becomes publicly available other than through breach of this Agreement; (b) was in the Receiving Party's possession prior to disclosure, with documented proof; (c) is independently developed without use of Evaluation Material; or (d) is received from a third party not under confidentiality obligation to the Disclosing Party.

─────────────────────────────────────────────────────────────────
2. REPRESENTATIVES
─────────────────────────────────────────────────────────────────
"Representatives" means a party's directors, officers, employees, attorneys, accountants, financial advisors, lenders, potential equity partners, and other advisors who need to know the Evaluation Material to evaluate the Transaction. Each party is responsible for its Representatives' compliance with this Agreement.

─────────────────────────────────────────────────────────────────
3. MUTUAL OBLIGATIONS
─────────────────────────────────────────────────────────────────
Each Receiving Party agrees to:
  (a) Keep all Evaluation Material of the Disclosing Party strictly confidential.
  (b) Not disclose Evaluation Material to any person other than Representatives without prior written consent from the Disclosing Party or Kingdom Broker.
  (c) Use Evaluation Material solely to evaluate the Transaction, for no other purpose.
  (d) Protect Evaluation Material with at least the same care it uses for its own confidential information, and in no event less than reasonable care.
  (e) Not disclose that the business is for sale, that discussions are occurring, or that Evaluation Material has been exchanged, without prior written consent.

─────────────────────────────────────────────────────────────────
4. NO CONTACT, ALL COMMUNICATIONS THROUGH KINGDOM BROKER
─────────────────────────────────────────────────────────────────
All communications and negotiations shall be conducted exclusively through Kingdom Broker. Neither party will contact the other's employees, customers, suppliers, lenders, or advisors directly without Kingdom Broker's prior written authorization. Unauthorized contact constitutes a material breach of this Agreement.

─────────────────────────────────────────────────────────────────
5. KINGDOM BROKER COMMISSION PROTECTION
─────────────────────────────────────────────────────────────────
If the Buyer directly or indirectly contacts the Seller or any affiliate of {{business_name}} and such contact results in a transaction without Kingdom Broker's involvement, the Buyer agrees to pay Kingdom Broker its full advisory fee as outlined in the applicable listing agreement. This obligation survives termination for twenty-four (24) months.

─────────────────────────────────────────────────────────────────
6. NO SOLICITATION OF EMPLOYEES
─────────────────────────────────────────────────────────────────
For the duration of this Agreement and for twelve (12) months following its expiration or termination, neither party will directly or indirectly solicit or hire the other party's employees without prior written consent.

─────────────────────────────────────────────────────────────────
7. LEGAL DISCLOSURE, NOTICE REQUIRED
─────────────────────────────────────────────────────────────────
If either party is required by law, subpoena, or court order to disclose the other's Evaluation Material, the disclosing party shall: (i) provide prompt written notice before any disclosure; (ii) cooperate in seeking a protective order; and (iii) disclose only the minimum necessary to comply. The party receiving the order shall cooperate in any effort to limit disclosure.

─────────────────────────────────────────────────────────────────
8. RETURN OR DESTRUCTION
─────────────────────────────────────────────────────────────────
Upon request by either Disclosing Party, or if the Transaction does not proceed, each Receiving Party will promptly return or destroy the other's Evaluation Material and certify such action in writing within five (5) business days.

─────────────────────────────────────────────────────────────────
9. INFORMATION NOT VERIFIED BY KINGDOM BROKER
─────────────────────────────────────────────────────────────────
All Evaluation Material is provided by the respective Disclosing Party. Kingdom Broker has not independently verified any Evaluation Material and makes no representations as to its accuracy or completeness. Each party is responsible for its own due diligence.

─────────────────────────────────────────────────────────────────
10. TERM
─────────────────────────────────────────────────────────────────
This Agreement is effective as of the Effective Date above and remains in effect for two (2) years. Confidentiality obligations extend for three (3) years following termination or expiration, or until a definitive Purchase Agreement is fully executed, whichever comes first.

─────────────────────────────────────────────────────────────────
11. NO LICENSE, NO COMMITMENT
─────────────────────────────────────────────────────────────────
Nothing in this Agreement grants either party any right or license to the other's Evaluation Material. Neither party is obligated to proceed with the Transaction.

─────────────────────────────────────────────────────────────────
12. REMEDIES AND EQUITABLE RELIEF
─────────────────────────────────────────────────────────────────
Each party acknowledges that breach of this Agreement may cause irreparable harm for which monetary damages would be inadequate. The non-breaching party is entitled to seek equitable relief, including injunction, without posting a bond, in addition to all other available remedies.

─────────────────────────────────────────────────────────────────
13. AUTHORITY TO SIGN
─────────────────────────────────────────────────────────────────
Each signatory represents that they have full authority to bind their respective party and entity to the terms of this Agreement.

─────────────────────────────────────────────────────────────────
14. GOVERNING LAW
─────────────────────────────────────────────────────────────────
This Agreement is governed by the laws of the State of {{state}}, without regard to conflict of laws principles. Disputes shall be resolved in {{county}} County, {{state}}.

─────────────────────────────────────────────────────────────────

IMPORTANT NOTICE, FOR EDUCATIONAL PURPOSES ONLY
Kingdom Broker provides this NDA template as a reference and starting point. This is not legal advice and does not create an attorney-client relationship. Kingdom Broker is not a law firm. Both parties are strongly encouraged to consult with a licensed attorney before signing any agreement.

─────────────────────────────────────────────────────────────────

AGREED AND ACCEPTED:

PARTY A, SELLER
___________________________________
Signature

Printed Name:  {{seller_name}}
Business:      {{business_name}}
Date:          _______________

─────────────────────────────────────────────────────────────────

PARTY B, BUYER
___________________________________
Signature

Printed Name:  {{buyer_name}}
Entity:        {{buyer_entity}}
Date:          _______________

─────────────────────────────────────────────────────────────────
Facilitated by Kingdom Broker, Inc.
Eric Skeldon · Eric@KingdomBroker.com · 469-494-9890
KingdomBroker.com · Plano, Texas`

// ── LOI template summaries ────────────────────────────────────────────────────
const LOI_TEMPLATES = [
  {
    key: 'all_cash',
    name: 'All Cash Offer',
    badge: 'FASTEST CLOSE',
    badgeColor: '#2ECC8B',
    desc: 'Clean, full-price offer paid at closing. No installments. No bank financing. Sellers love the certainty.',
    features: ['Full amount at closing', 'Typically 30-day due diligence', 'Strongest negotiating position'],
    icon: (
      <svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="16" r="13"/>
        <path d="M16 8v2M16 22v2M11 12.5c0-1.38 2.24-2.5 5-2.5s5 1.12 5 2.5-2.24 2.5-5 2.5-5 1.12-5 2.5 2.24 2.5 5 2.5 5-1.12 5-2.5"/>
      </svg>
    ),
  },
  {
    key: 'seller_financed',
    name: 'Seller Financed',
    badge: 'MOST FLEXIBLE',
    badgeColor: '#C9A84C',
    desc: 'Down payment at closing + monthly installments paid directly to you. Like a mortgage, but you\'re the bank.',
    features: ['Down payment at closing', 'Monthly payments to seller', 'Can close in weeks, not months'],
    icon: (
      <svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="8" width="24" height="16" rx="2"/>
        <path d="M4 13h24"/>
        <path d="M9 18h4M19 18h4"/>
      </svg>
    ),
  },
  {
    key: 'sba_7a',
    name: 'SBA 7(a) Loan',
    badge: 'MOST COMMON',
    badgeColor: '#8B9AC0',
    desc: 'Government-backed SBA loan covers most of the purchase. The most common way $1M–$5M businesses are bought in America.',
    features: ['10% buyer down payment', 'SBA loan covers the rest', '60–90 day close timeline'],
    icon: (
      <svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 26l12-18 12 18"/>
        <line x1="8" y1="20" x2="24" y2="20"/>
        <line x1="16" y1="8" x2="16" y2="4"/>
        <circle cx="16" cy="3" r="1.5"/>
      </svg>
    ),
  },
]

// ── Field editor for NDA ─────────────────────────────────────────────────────
const DEFAULT_FIELDS = {
  date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  business_name: '',
  seller_name: '',
  buyer_name: '',
  buyer_entity: '',
  buyer_email: '',
  state: 'Texas',
  county: 'Collin',
}

// ── Utility ───────────────────────────────────────────────────────────────────
function fillTemplate(template: string, fields: Record<string, string>) {
  return Object.entries(fields).reduce(
    (t, [k, v]) => t.replaceAll(`{{${k}}}`, v || `[${k.replace(/_/g, ' ')}]`),
    template
  )
}

// ── Style constants ───────────────────────────────────────────────────────────
const card = {
  background: 'var(--kb-bg-panel)',
  border: '1px solid var(--kb-border)',
  borderRadius: '12px',
  padding: '28px 32px',
} as const

const btn = (variant: 'gold' | 'outline' | 'ghost') => ({
  gold: { background: 'var(--kb-accent)', color: '#FFFFFF', fontWeight: 590, border: 'none', borderRadius: '8px', padding: '11px 24px', cursor: 'pointer', fontSize: '14px', fontFamily: "'Inter', system-ui, sans-serif" },
  outline: { background: 'transparent', color: 'var(--kb-accent)', fontWeight: 590, border: '1px solid rgba(201,168,76,0.35)', borderRadius: '8px', padding: '11px 24px', cursor: 'pointer', fontSize: '14px', fontFamily: "'Inter', system-ui, sans-serif" },
  ghost: { background: 'var(--kb-bg-raised)', color: 'var(--kb-text-secondary)', fontWeight: 510, border: '1px solid var(--kb-border)', borderRadius: '8px', padding: '11px 24px', cursor: 'pointer', fontSize: '14px', fontFamily: "'Inter', system-ui, sans-serif" },
}[variant])

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DealStagePage() {
  const [fields, setFields] = useState(DEFAULT_FIELDS)
  const [showNdaPreview, setShowNdaPreview] = useState(false)
  const [showLOIModal, setShowLOIModal] = useState(false)
  const [selectedLOI, setSelectedLOI] = useState<string | null>(null)
  const [ndaStatus, setNdaStatus] = useState<'pending' | 'sent' | 'signed'>('pending')

  const ndaText = fillTemplate(NDA_STANDARD, fields)

  const handlePrint = () => {
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`
      <html><head><title>NDA, ${fields.business_name}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 13px; line-height: 1.7;
               max-width: 720px; margin: 40px auto; color: #000; white-space: pre-wrap; }
        h1 { font-size: 15px; text-align: center; text-transform: uppercase; letter-spacing: 0.08em; }
        @media print { body { margin: 20px; } }
      </style></head>
      <body><pre style="font-family: inherit; white-space: pre-wrap;">${ndaText}</pre></body></html>
    `)
    w.document.close()
    w.print()
  }

  const handleEmailBuyer = () => {
    if (!fields.buyer_email) {
      alert('Please enter the buyer\'s email address in the form above first.')
      return
    }
    const subject = encodeURIComponent(
      `NDA, ${fields.business_name}, Please Sign and Return`
    )
    const body = encodeURIComponent(
`Hi ${fields.buyer_name || 'there'},

Thank you for your interest in ${fields.business_name}.

Attached is the Non-Disclosure Agreement for your review and signature. Please sign and return at your earliest convenience so we can share the Confidential Information Memorandum (CIM) and detailed financials.

HOW TO SIGN:
  1. Open the attached NDA PDF
  2. Sign electronically using any of the following:
       • DocuSign (docusign.com), free for recipients
       • Adobe Sign (acrobat.adobe.com), free for recipients
       • Or print, sign, and scan/photo back to us
  3. Return the signed copy to: Eric@KingdomBroker.com

Please keep the contents of this NDA and the opportunity confidential, do not forward or share with third parties without written authorization from Kingdom Broker.

Once we receive the signed NDA, we will promptly send over the full CIM and next steps.

Looking forward to working with you.

Best regards,
Eric Skeldon
Kingdom Broker | KingdomBroker.com
Eric@KingdomBroker.com | 469-494-9890
Plano, Texas

──────────────────────────────────────────
Please download the NDA PDF first (click "Download / Print PDF"), then attach it to this email before sending.
──────────────────────────────────────────`
    )
    window.open(`mailto:${fields.buyer_email}?subject=${subject}&body=${body}`)
    setNdaStatus('sent')
  }

  const setField = (key: string, value: string) =>
    setFields(f => ({ ...f, [key]: value }))

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", padding: '40px 32px 80px' }}>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '6px' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 600, color: 'var(--kb-text)', margin: 0 }}>
            NDA &amp; LOI
          </h1>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: 'var(--kb-accent)', letterSpacing: '0.16em', background: 'var(--kb-accent-dim)', border: '1px solid var(--kb-accent-border)', borderRadius: '4px', padding: '3px 10px' }}>
            DEAL DOCUMENTS
          </span>
        </div>
        <p style={{ fontSize: '15px', color: 'var(--kb-text-secondary)', margin: '0 0 36px', lineHeight: 1.6 }}>
          Non-Disclosure Agreement first, then Letter of Intent. Every deal follows this sequence.
        </p>
      </motion.div>

      {/* ── Deal Progress Bar ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <div style={{ ...card, marginBottom: '32px', padding: '22px 28px' }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: 'var(--kb-text-muted)', letterSpacing: '0.14em', marginBottom: '18px' }}>
            DEAL PROGRESSION
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', overflowX: 'auto', paddingBottom: '4px' }}>
            {STAGES.map((stage, i) => {
              const status = STAGE_STATUS[stage]
              const isComplete = status === 'complete'
              const isActive = status === 'active'
              return (
                <div key={stage} style={{ display: 'flex', alignItems: 'center', flex: i < STAGES.length - 1 ? 1 : 'none', minWidth: i < STAGES.length - 1 ? '80px' : 'auto' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isComplete ? '#2ECC8B' : isActive ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `2px solid ${isComplete ? '#2ECC8B' : isActive ? '#C9A84C' : 'rgba(255,255,255,0.1)'}`,
                      fontSize: '13px',
                    }}>
                      {isComplete ? (
                        <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                          <polyline points="2,7 5.5,10.5 12,4"/>
                        </svg>
                      ) : (
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', fontWeight: 590, color: isActive ? '#C9A84C' : 'var(--kb-text-muted)' }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: isActive ? 600 : 400, color: isComplete ? '#2ECC8B' : isActive ? '#C9A84C' : 'var(--kb-text-muted)', whiteSpace: 'nowrap' }}>
                      {stage}
                    </span>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div style={{ flex: 1, height: '2px', margin: '0 8px', marginBottom: '22px', background: isComplete ? '#2ECC8B' : 'var(--kb-bg-raised)', minWidth: '20px' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* ── Section 1: NDA ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
        <div style={{ marginBottom: '32px' }}>

          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: ndaStatus === 'signed' ? 'rgba(46,204,139,0.12)' : 'rgba(201,168,76,0.12)',
              border: `1px solid ${ndaStatus === 'signed' ? 'rgba(46,204,139,0.3)' : 'rgba(201,168,76,0.3)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'DM Mono', monospace", fontSize: '12px', fontWeight: 590,
              color: ndaStatus === 'signed' ? '#2ECC8B' : '#C9A84C',
            }}>01</div>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 600, color: 'var(--kb-text)', margin: 0 }}>
                Non-Disclosure Agreement
              </h2>
              <div style={{ fontSize: '13px', color: '#6A7A9A', marginTop: '2px' }}>
                Buyer signs before any financials are shared. Seller is protected.
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              {ndaStatus === 'signed' ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(46,204,139,0.12)', border: '1px solid rgba(46,204,139,0.3)', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', fontWeight: 590, color: 'var(--kb-green)', fontFamily: "'DM Mono', monospace" }}>
                  <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="1.5,6 4.5,9 10.5,3"/></svg>
                  SIGNED
                </span>
              ) : ndaStatus === 'sent' ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(139,154,192,0.1)', border: '1px solid rgba(139,154,192,0.25)', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', fontWeight: 590, color: '#8B9AC0', fontFamily: "'DM Mono', monospace" }}>
                  SENT · AWAITING SIGNATURE
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', color: 'var(--kb-text-muted)', fontFamily: "'DM Mono', monospace" }}>
                  NOT STARTED
                </span>
              )}
            </div>
          </div>

          <div style={{ ...card }}>
            {/* Template description */}
            <div style={{ background: 'var(--kb-bg-card)', border: '1px solid var(--kb-border-subtle)', borderRadius: '8px', padding: '14px 18px', marginBottom: '24px', fontSize: '13px', color: '#8A97B4', lineHeight: 1.7 }}>
              Standard one-way NDA — the seller shares business financials and information with the buyer. The buyer signs and agrees to keep everything confidential. Only the buyer signs. Industry standard for business sales.
            </div>

            {/* Quick field fill */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: 'var(--kb-text-muted)', letterSpacing: '0.12em', marginBottom: '14px' }}>CUSTOMIZE YOUR NDA</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                {[
                  { key: 'seller_name', label: 'Seller Name' },
                  { key: 'buyer_name', label: 'Buyer Name' },
                  { key: 'buyer_email', label: 'Buyer Email' },
                  { key: 'buyer_entity', label: 'Buyer Entity / LLC' },
                  { key: 'state', label: 'State' },
                  { key: 'county', label: 'County' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#6A7A9A', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', marginBottom: '5px' }}>
                      {label.toUpperCase()}
                    </label>
                    <input
                      value={fields[key as keyof typeof fields]}
                      onChange={e => setField(key, e.target.value)}
                      placeholder={label}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)',
                        borderRadius: '7px', padding: '9px 12px',
                        color: 'var(--kb-text)', fontSize: '13px', fontFamily: "'Inter', system-ui, sans-serif",
                        outline: 'none',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <button style={btn('gold')} onClick={() => setShowNdaPreview(true)}>
                Preview NDA
              </button>
              <button style={btn('outline')} onClick={handlePrint}>
                Download / Print PDF
              </button>
              <button style={btn('outline')} onClick={handleEmailBuyer}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <svg viewBox="0 0 18 18" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="14" height="10" rx="2"/>
                    <polyline points="2,4 9,10 16,4"/>
                  </svg>
                  Email to Buyer
                </span>
              </button>
              {ndaStatus !== 'signed' && (
                <button
                  style={{ ...btn('ghost'), color: 'var(--kb-green)', borderColor: 'rgba(46,204,139,0.25)' }}
                  onClick={() => setNdaStatus('signed')}
                >
                  Mark as Signed
                </button>
              )}
            </div>

            {/* Email flow instructions */}
            <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(46,204,139,0.04)', border: '1px solid rgba(46,204,139,0.15)', borderRadius: '8px', fontSize: '12px', color: 'var(--kb-text-secondary)', lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--kb-green)' }}>How to send:</strong> ① Fill in buyer details above &nbsp;→&nbsp; ② Click <strong style={{ color: 'var(--kb-text)' }}>Download / Print PDF</strong> and save as PDF &nbsp;→&nbsp; ③ Click <strong style={{ color: 'var(--kb-text)' }}>Email to Buyer</strong>, your email app opens pre-filled &nbsp;→&nbsp; ④ Attach the PDF and hit send. Buyer signs free in DocuSign or Adobe and returns it.
              <span style={{ display: 'block', marginTop: '6px', color: 'var(--kb-text-muted)' }}>
                Upgrading to DocuSign Business Pro ($65/mo) at 100+ deals/month will automate this entire flow with embedded signing.
              </span>
            </div>

            {/* Disclaimer */}
            <div style={{ marginTop: '20px', padding: '12px 16px', background: 'rgba(255,200,0,0.04)', border: '1px solid rgba(255,200,0,0.12)', borderRadius: '7px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <svg viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                <path d="M9 2L1.5 15h15z"/>
                <line x1="9" y1="7" x2="9" y2="10.5"/>
                <circle cx="9" cy="13" r="0.5" fill="#C9A84C"/>
              </svg>
              <p style={{ fontSize: '12px', color: 'var(--kb-text-secondary)', margin: 0, lineHeight: 1.65 }}>
                <strong style={{ color: 'var(--kb-accent)' }}>Educational purposes only.</strong> Kingdom Broker provides these NDA templates as a reference and starting point. This is not legal advice and does not create an attorney-client relationship. Kingdom Broker is not a law firm. Every transaction is different. <strong style={{ color: 'var(--kb-text)' }}>Consult a licensed attorney before signing any agreement.</strong>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Section 2: LOI ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'var(--kb-accent-dim)', border: '1px solid var(--kb-accent-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'DM Mono', monospace", fontSize: '12px', fontWeight: 590, color: 'var(--kb-accent)',
            }}>02</div>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 600, color: 'var(--kb-text)', margin: 0 }}>
                Letter of Intent
              </h2>
              <div style={{ fontSize: '13px', color: '#6A7A9A', marginTop: '2px' }}>
                Written offer from buyer to seller, outlines price and deal structure
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', color: 'var(--kb-text-muted)', fontFamily: "'DM Mono', monospace" }}>
                NO LOI YET
              </span>
            </div>
          </div>

          <div style={{ ...card }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: 'var(--kb-text-muted)', letterSpacing: '0.12em', marginBottom: '18px' }}>
              CHOOSE A STRUCTURE
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              {LOI_TEMPLATES.map(t => (
                <div
                  key={t.key}
                  onClick={() => setSelectedLOI(t.key)}
                  style={{
                    padding: '20px', borderRadius: '10px', cursor: 'pointer',
                    background: selectedLOI === t.key ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${selectedLOI === t.key ? 'rgba(201,168,76,0.4)' : 'var(--kb-border)'}`,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    {t.icon}
                    <span style={{
                      fontFamily: "'DM Mono', monospace", fontSize: '9px', fontWeight: 590, letterSpacing: '0.12em',
                      color: t.badgeColor, background: `${t.badgeColor}18`, border: `1px solid ${t.badgeColor}40`,
                      borderRadius: '4px', padding: '3px 8px',
                    }}>{t.badge}</span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 590, color: 'var(--kb-text)', marginBottom: '6px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: '#8A97B4', lineHeight: 1.6, marginBottom: '12px' }}>{t.desc}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {t.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6A7A9A' }}>
                        <svg viewBox="0 0 10 10" width="10" height="10" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round">
                          <polyline points="1.5,5 3.5,7 8.5,2.5"/>
                        </svg>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                style={selectedLOI ? btn('gold') : { ...btn('ghost'), opacity: 0.5, cursor: 'not-allowed' }}
                onClick={() => selectedLOI && setShowLOIModal(true)}
              >
                {selectedLOI ? `Create ${LOI_TEMPLATES.find(t => t.key === selectedLOI)?.name} LOI →` : 'Select a structure above'}
              </button>
            </div>

            {/* Boomer context note */}
            <div style={{ marginTop: '20px', padding: '14px 18px', background: 'var(--kb-accent-dim)', border: '1px solid rgba(201,168,76,0.1)', borderLeft: '3px solid rgba(201,168,76,0.4)', borderRadius: '0 8px 8px 0' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: 'var(--kb-accent)', letterSpacing: '0.12em', marginBottom: '6px' }}>KB APPROACH</div>
              <p style={{ fontSize: '13px', color: 'var(--kb-text-secondary)', lineHeight: 1.7, margin: 0 }}>
                Every LOI Kingdom Broker generates is written in plain English, not legal jargon. We acknowledge what the seller built, reference their team and customers by name, and explain every term clearly. The goal: a business owner reads this and feels respected.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Section 3: Purchase Agreement (Coming Soon) ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'DM Mono', monospace", fontSize: '12px', fontWeight: 590, color: 'var(--kb-text-muted)',
            }}>03</div>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 600, color: '#6A7A9A', margin: 0 }}>
                Purchase Agreement
              </h2>
              <div style={{ fontSize: '13px', color: 'var(--kb-text-muted)', marginTop: '2px' }}>
                Legally binding purchase and sale agreement, drafted by attorneys after LOI is signed
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--kb-bg-raised)', border: '1px solid var(--kb-border-subtle)', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', color: '#3A4A6A', fontFamily: "'DM Mono', monospace" }}>
                COMING SOON
              </span>
            </div>
          </div>

          <div style={{ ...card, opacity: 0.6, borderStyle: 'dashed' }}>
            <p style={{ fontSize: '14px', color: '#6A7A9A', lineHeight: 1.7, margin: 0 }}>
              The Purchase Agreement is the final, legally binding document drafted after both parties sign the LOI. It is always prepared by attorneys, Kingdom Broker coordinates the process and connects you with qualified M&amp;A attorneys. This section will track the PA draft, redline, and execution status.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── NDA Preview Modal ── */}
      <AnimatePresence>
        {showNdaPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={() => setShowNdaPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '780px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              {/* Modal header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
                <div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#888', letterSpacing: '0.12em', marginBottom: '3px' }}>
                    STANDARD ONE-WAY NDA
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 590, color: '#111', fontFamily: "'Inter', system-ui, sans-serif" }}>
                    {fields.business_name}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handlePrint} style={{ padding: '8px 18px', background: 'var(--kb-bg)', color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: 590, fontFamily: "'Inter', system-ui, sans-serif" }}>
                    Print / Save PDF
                  </button>
                  <button onClick={() => setShowNdaPreview(false)} style={{ padding: '8px 14px', background: 'transparent', color: '#666', border: '1px solid #ddd', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontFamily: "'Inter', system-ui, sans-serif" }}>
                    Close
                  </button>
                </div>
              </div>

              {/* NDA content */}
              <div style={{ overflowY: 'auto', padding: '32px 40px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/kb-logo.png" alt="Kingdom Broker" style={{ height: '36px', opacity: 0.8 }} />
                </div>
                <pre style={{
                  fontFamily: "'Times New Roman', Georgia, serif",
                  fontSize: '13px', lineHeight: '1.85', color: '#1a1a1a',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0,
                }}>
                  {ndaText}
                </pre>
                <div style={{ marginTop: '32px', padding: '12px 16px', background: '#FFF8E6', border: '1px solid #F5D782', borderRadius: '6px', fontSize: '12px', color: '#8B6914', lineHeight: 1.6 }}>
                  NOTICE: Kingdom Broker provides this NDA template for educational purposes only. This is not legal advice. Consult a licensed attorney before signing.
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LOI Coming Soon Modal ── */}
      <AnimatePresence>
        {showLOIModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={() => setShowLOIModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'var(--kb-bg-panel)', border: '1px solid var(--kb-accent-border)', borderRadius: '8px', width: '100%', maxWidth: '520px', padding: '40px' }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '16px', color: 'var(--kb-accent)' }}><svg viewBox='0 0 24 24' width='40' height='40' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'><path d='M12 20h9'/><path d='M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z'/></svg></div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '24px', fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'var(--kb-text)', marginBottom: '12px' }}>
                  LOI Generator Coming Soon
                </div>
                <p style={{ fontSize: '15px', color: 'var(--kb-text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
                  The full LOI generator with AI auto-fill and DocuSign e-signing is in development. It will pre-fill all fields from your deal data and generate a complete, Boomer-friendly offer letter in minutes.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                  {['KB engine pre-fills from deal data', 'Plain-English language', 'DocuSign e-signature', 'Signed PDF saved'].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--kb-text-secondary)' }}>
                      <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round"><polyline points="1.5,6 4.5,9 10.5,3"/></svg>
                      {f}
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowLOIModal(false)} style={btn('gold')}>
                  Got It
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
