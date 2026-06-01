'use client'
import { useState } from 'react'
import Link from 'next/link'

const C = {
  navy: 'var(--kb-bg)', navy2: 'var(--kb-bg-panel)', navy3: 'var(--kb-bg-surface)',
  gold: 'var(--kb-accent)', goldDim: 'var(--kb-accent-dim)', goldBorder: 'var(--kb-accent-border)',
  green: 'var(--kb-green)', text: 'var(--kb-text)', muted: 'var(--kb-text-secondary)', faint: 'var(--kb-text-muted)',
  border: 'var(--kb-border)',
}
const F = { display: "'Playfair Display', serif", body: "'Inter', system-ui, sans-serif", mono: "'DM Mono', monospace" }

// Reordered 2026-04-20 into logical seller journey flow:
// Start → Upload → Analyze → Value → Prep → Build CIM → Find Buyers →
// Sign Docs → Track → Tax Plan → Refer → (Power tools: Agents, Investor Room)
const STEPS = [
  {
    num: '01',
    label: 'Overview',
    href: '/overview',
    icon: '◼',
    color: C.gold,
    tagline: 'Your deal at a glance',
    what: 'The command center for your entire deal. Everything in one screen.',
    features: [
      { title: 'Deal Status Bar', desc: 'Tracks your deal from Onboarding → Active → Matched → LOI → Due Diligence → Closed. You always know exactly where you stand.' },
      { title: 'Key Metrics', desc: 'Asking price, TTM revenue, EBITDA, and normalized valuation range pinned at the top. Live numbers, not estimates.' },
      { title: 'Activity Feed', desc: 'A real-time log of every action, documents processed, buyers matched, outreach sent, calls scheduled.' },
      { title: 'Next Steps Panel', desc: 'The KB Deal Engine tells you exactly what to do next to move your deal forward. No guessing.' },
      { title: 'Advisor Contact', desc: "One-click access to Eric Skeldon's calendar. Your advisor is never more than one click away." },
    ],
    callout: 'Think of this as your deal\'s homepage. Every other page feeds data into this summary.',
    visual: [
      { label: 'Deal Stage', val: 'Matched', color: C.gold },
      { label: 'Asking Price', val: '$4.8M', color: C.text },
      { label: 'TTM Revenue', val: '$4.2M', color: C.green },
      { label: 'EBITDA', val: '$910K', color: C.green },
      { label: 'Valuation Range', val: '$3.6M – $5.5M', color: C.gold },
      { label: 'Buyer Matches', val: '5 Found', color: C.green },
    ],
  },
  {
    num: '02',
    label: 'Documents',
    href: '/documents',
    icon: '',
    color: C.gold,
    tagline: 'Upload once. The KB Deal Engine reads every page.',
    what: 'Up to 5 years of tax returns, P&Ls, and bank statements. Upload each as a PDF and the KB Deal Intelligence Engine extracts every number, revenue, EBITDA, expenses, add-backs, automatically.',
    features: [
      { title: 'Per-Document Upload Slots', desc: 'Each of the 9 required documents has its own upload slot. Click the arrow on any slot, pick your PDF, and the upload begins immediately.' },
      { title: 'Live Status Per Document', desc: 'Uploading → Engine Processing (pulsing dot) → ✓ Complete. You watch the KB Deal Engine work through your documents in real time.' },
      { title: 'Progress Bar', desc: 'Track overall completion across all uploaded documents. The Financial Analysis page populates automatically as documents complete.' },
      { title: 'PDF Validation', desc: 'The engine verifies every file is a genuine PDF (not a renamed .doc or image). Max 25MB per file. Every document goes into a private, encrypted storage vault.' },
      { title: 'What Happens Next Diagram', desc: 'Shows the full pipeline: Upload → KB Engine Reads It → Add-Backs Found → Dashboard Updates. Transparent process, no black box.' },
    ],
    callout: 'Once your documents are uploaded, your Financial Analysis, KB Valuation, and Buyer Match pages populate automatically. The entire platform activates from your uploaded financials.',
    visual: [
      { label: 'Tax Return 2021', val: '✓ Complete', color: C.green },
      { label: 'Tax Return 2022', val: '✓ Complete', color: C.green },
      { label: 'Tax Return 2023', val: '✓ Complete', color: C.green },
      { label: 'P&L Statement 2021–23', val: '✓ Complete', color: C.green },
      { label: 'Bank Statements 2021–23', val: '✓ Complete', color: C.green },
      { label: 'AI Confidence', val: 'High', color: C.green },
    ],
  },
  {
    num: '03',
    label: 'Financial Analysis',
    href: '/financials',
    icon: '',
    color: C.gold,
    tagline: 'Kingdom Broker reads every number from your documents',
    what: 'Upload your tax returns, P&Ls, and bank statements. The KB Deal Intelligence Engine extracts every figure automatically and builds your 3-year financial picture.',
    features: [
      { title: 'Annual Revenue Chart', desc: '3-year bar chart showing gross revenue growth. Buyers want to see the trend, this makes it undeniable.' },
      { title: 'EBITDA vs Normalized EBITDA', desc: 'Side-by-side chart showing reported EBITDA and what it becomes after add-backs. This is the number that drives your valuation.' },
      { title: 'KB-Identified Add-Backs', desc: 'The Deal Intelligence Engine scans your documents and flags owner compensation excess, one-time expenses, personal vehicle costs, and other legitimate add-backs, things traditional brokers miss.' },
      { title: 'Year-over-Year Table', desc: 'Every key metric across up to 5 years with trend indicators. Growing revenue + growing EBITDA = premium multiple.' },
      { title: 'Live vs Demo Badge', desc: 'Shows "◎ Demo Data" until you upload documents, then switches to "● Live Data" automatically. No setup required.' },
    ],
    callout: 'Add-backs are where deals are won. A business with $910K EBITDA and $140K in legitimate add-backs has a $1.05M normalized EBITDA, that\'s the difference between a $3.9M and $5.5M valuation.',
    visual: [
      { label: '2021 Revenue', val: '$3.1M', color: C.muted },
      { label: '2022 Revenue', val: '$3.7M', color: C.muted },
      { label: '2023 Revenue', val: '$4.2M', color: C.gold },
      { label: 'Reported EBITDA', val: '$910K', color: C.muted },
      { label: 'Add-Backs Found', val: '+$140K', color: C.green },
      { label: 'Normalized EBITDA', val: '$1.05M', color: C.green },
    ],
  },
  {
    num: '04',
    label: 'KB Valuation',
    href: '/valuation',
    icon: '',
    color: C.gold,
    tagline: 'What your business is actually worth',
    what: 'A full institutional-grade valuation powered by the KB Deal Intelligence Engine, normalized EBITDA, and real transaction multiples from 25 industries.',
    features: [
      { title: 'Valuation Range Gauge', desc: 'Conservative ($3.6M) → Fair Market Value ($4.4M) → Premium ($5.5M). The range reflects how deal structure, buyer type, and market conditions affect price.' },
      { title: 'EBITDA Multiple Breakdown', desc: 'Your specific industry multiple range (3.9x–5.9x for HVAC home services) based on real closed transactions. Not guesses, comps.' },
      { title: 'KB Business Narrative', desc: "The Deal Intelligence Engine writes a buyer-facing summary of your business, the story that gets buyers excited. Covers recurring revenue, team strength, market position, and what makes this a durable platform." },
      { title: 'Risk & Value Drivers', desc: 'The KB Deal Intelligence Engine flags what could hurt your valuation (owner dependency, concentration risk) and what drives it higher (recurring contracts, strong team, brand reviews).' },
      { title: 'Deal Structure Recommendation', desc: 'SBA 7(a), seller note, equity rollover, the KB engine recommends the optimal structure based on your financials and buyer universe.' },
      { title: 'Comparable Transactions', desc: 'Real closed deals in your industry and geography. Sunbelt buyers need to see comps, this page gives them everything.' },
    ],
    callout: 'This is the page that justifies your asking price. Every number here is defensible to a buyer\'s financial advisor because it\'s built on real transaction data.',
    visual: [
      { label: 'Conservative', val: '$3.6M', color: C.muted },
      { label: 'Fair Market Value', val: '$4.4M', color: C.gold },
      { label: 'Premium', val: '$5.5M', color: C.green },
      { label: 'EBITDA Multiple', val: '3.9× – 5.9×', color: C.gold },
      { label: 'Industry', val: 'Home Services', color: C.muted },
      { label: 'Recommended Structure', val: 'SBA 7(a)', color: C.green },
    ],
  },
  {
    num: '05',
    label: 'Marketing Intelligence',
    href: '/marketing',
    icon: '',
    color: '#5BB8F5',
    tagline: 'What buyers Google before they call you',
    what: 'Buyers research every business online before signing an NDA. Kingdom Broker partners with Dennis Yu of BlitzMetrics, the team behind over $1 billion in digital ad spend, to audit your online presence, reputation, and brand visibility. This page shows your marketing reports and the roadmap to making your business more attractive before it goes to market.',
    features: [
      { title: '6 Marketing Reports', desc: 'Google Business Profile health, SEO ranking, social media presence, online review velocity, competitor positioning, and overall digital reputation score, all in one dashboard.' },
      { title: 'Dennis Yu + BlitzMetrics Partnership', desc: "Kingdom Broker's exclusive marketing partner. Dennis Yu has worked with McDonald's, Nike, and thousands of small businesses. His team audits your online presence the same way a buyer's research team will." },
      { title: 'What Buyers Find When They Google You', desc: 'Before any buyer signs an NDA, they search your business name, your name, and your reviews. This page shows you exactly what they find, and flags anything that could hurt your valuation.' },
      { title: 'Online Reputation Score', desc: 'A single score (1–100) that reflects your Google reviews, social following, website quality, and press mentions. Buyers pay more for businesses with strong reputations.' },
      { title: 'Marketing Roadmap', desc: 'A phased plan (Phase 1 through Phase 4) for improving your business\'s online presence before the deal goes to market. 90 days of marketing investment before listing can add 15–20% to your valuation.' },
      { title: 'Input Your Domain', desc: 'Enter your business website and the KB Marketing Intelligence engine runs a complete scan, SEO, reviews, social, and competitor analysis, delivered as a report to your dashboard.' },
    ],
    callout: 'Sellers who spend 90 days improving their online presence before going to market get 15–20% higher valuations on average. Buyers pay a premium for businesses with strong brands, high Google ratings, and clear digital authority. This page tells you exactly where to focus.',
    visual: [
      { label: 'Marketing Partner', val: 'Dennis Yu', color: '#5BB8F5' },
      { label: 'Reports Included', val: '6', color: C.gold },
      { label: 'Ad Spend Managed', val: '$1B+', color: '#5BB8F5' },
      { label: 'Valuation Premium', val: '15–20%', color: C.green },
      { label: 'Scan Time', val: '~48 Hours', color: C.muted },
      { label: 'Status', val: 'Coming Soon', color: C.gold },
    ],
  },  {
    num: '06',
    label: 'CIM Builder',
    href: '/cim',
    icon: '',
    color: C.gold,
    tagline: 'Your deal book, built by CLAY in 5 conversations',
    what: 'The Confidential Information Memorandum (CIM) is the document serious buyers receive under NDA. It tells your business\'s story, financials, operations, team, growth opportunity, in the professional format institutional buyers expect. CLAY, Kingdom Broker\'s AI, builds it with you in 5 conversational rounds. About 20 minutes total.',
    features: [
      { title: 'What Is a CIM?', desc: 'A CIM (sometimes called a "deal book" or "offering memorandum") is the full written picture of your business. Every serious buyer asks for one. Without it, you\'re not a credible seller.' },
      { title: '5 Conversational Rounds', desc: 'CLAY asks focused questions in 5 rounds: Business Overview → Financial Story → Operations & Team → Growth Opportunity → Why Now. You answer in plain English. CLAY writes it professionally.' },
      { title: 'Business Story Section', desc: 'Your origin, what you do, who your customers are, why your business is dominant in its market, and what makes it worth buying. Written to excite a buyer, not just inform them.' },
      { title: 'Operations & Team Write-Up', desc: 'Documents your team structure, key employees, your personal role as owner, and what day one looks like for a new owner. Buyers need to know the business can run without you.' },
      { title: 'Growth Opportunities', desc: 'What a smart buyer could do to grow the business, expansion markets, services to add, contracts to pursue, operational improvements. This is what gets buyers excited about the future.' },
      { title: 'Export to PDF', desc: 'Download a finished CIM ready to send to buyers. Professional layout, Kingdom Broker branding, and your business numbers presented exactly how institutional buyers expect.' },
    ],
    callout: 'A professionally written CIM is the difference between a buyer taking your deal seriously and passing on it. Boutique M&A brokers charge $5,000–$15,000 to write one. CLAY builds it with you in about 20 minutes, included in your Kingdom Broker engagement.',
    visual: [
      { label: 'Rounds to Complete', val: '5', color: C.gold },
      { label: 'Estimated Time', val: '~20 Minutes', color: C.muted },
      { label: 'Pages Generated', val: '15–25', color: C.text },
      { label: 'AI Writer', val: 'CLAY', color: C.gold },
      { label: 'Broker Cost (Traditional)', val: '$5K–$15K', color: '#E87373' },
      { label: 'Kingdom Broker Cost', val: 'Included', color: C.green },
    ],
  },
  {
    num: '07',
    label: 'Buyer Matches',
    href: '/buyers',
    icon: '',
    color: C.green,
    tagline: '12 KB acquisition agents found your ideal buyers',
    what: 'The buyer pipeline runs automatically. KB acquisition agents scan family offices, PE funds, search funds, and independent sponsors, then score each one against your deal.',
    features: [
      { title: 'Fit Score (1–100)', desc: 'Each buyer is scored by the KB Deal Intelligence Engine on geography overlap, check size alignment, industry thesis, and financing likelihood. 90+ = ideal match. 78+ = worth pursuing.' },
      { title: 'Match Reasons', desc: 'The engine explains exactly why each buyer fits, not just a score, but the reasoning a deal broker would use to justify the introduction.' },
      { title: 'Personalized Pitch Email', desc: "Every buyer gets a custom outreach email written by Kingdom Broker's Deal Intelligence Engine, their fund name, investment thesis, and why your deal fits their exact buy box." },
      { title: 'Status Tracker', desc: 'Identified → Contacted → Scheduled Call → Interested → LOI → Passed. You see exactly where every buyer conversation stands.' },
      { title: 'Request Introduction Button', desc: "Flag any buyer and Eric handles the introduction personally. You never have to cold-call a family office, that's what Kingdom Broker does." },
    ],
    callout: 'Traditional brokers send your CIM to a generic email list. Kingdom Broker builds a custom buyer universe for your specific deal and writes a personalized pitch to each one.',
    visual: [
      { label: 'Sunbelt Family Capital', val: '94 / 100', color: C.green },
      { label: 'Mesa Verde Acquisitions', val: '91 / 100', color: C.green },
      { label: 'TX Home Services Home Services', val: '88 / 100', color: C.gold },
      { label: 'Cypress PE Partners', val: '82 / 100', color: C.gold },
      { label: 'Lone Star Ind. Sponsor', val: '78 / 100', color: C.muted },
      { label: 'Outreach Sent', val: '2 of 5', color: C.gold },
    ],
  },
  {
    num: '08',
    label: 'NDA & LOI',
    href: '/deal-stage',
    icon: '',
    color: C.gold,
    tagline: 'Two documents every deal requires, generated in minutes',
    what: 'Every business sale follows the same legal sequence: NDA first (protects both parties before financials are shared), then LOI (buyer\'s written offer with price and structure). This page generates both, auto-fills the names, and walks you through sending them, no attorney required for the initial draft.',
    features: [
      { title: 'NDA Generator (Two Types)', desc: 'Standard NDA, the seller protects business info, buyer agrees to keep it confidential. Mutual NDA, both parties protect each other\'s information equally. Built from 5 real M&A NDAs. Choose the right one for your deal.' },
      { title: 'Auto-Fill Form', desc: 'Enter buyer name, company, email, state, and county. The NDA populates instantly with professional legal language, no manual editing required.' },
      { title: 'Download & Email Flow', desc: '① Download PDF (one click, saves to your computer). ② Click "Email to Buyer", your email app opens with a professional cover letter already written. ③ Attach the PDF and send. Buyer signs free in DocuSign or Adobe and returns it.' },
      { title: 'Kingdom Broker Commission Protection', desc: 'Every NDA Kingdom Broker generates includes a clause: if a buyer goes around Kingdom Broker and does the deal directly, they owe Kingdom Broker its full advisory fee. Your deal is protected.' },
      { title: 'LOI Templates (3 Structures)', desc: 'All Cash (fastest close), Seller Financed (seller carries a note, higher price), and SBA 7(a) (most common, 10% buyer down, bank finances the rest). Click a structure, review the terms, send to your buyer.' },
      { title: 'Deal Progress Tracker', desc: 'NDA → LOI → Due Diligence → Purchase Agreement → Closed. A visual bar at the top shows exactly where your deal stands. Mark each stage complete as you move through it.' },
    ],
    callout: 'NDA first. Always. No buyer should ever see your tax returns, customer list, or employee salaries without a signed NDA. This is not optional, it is the first document in every deal Kingdom Broker runs.',
    visual: [
      { label: 'NDA Templates', val: '2 Types', color: C.gold },
      { label: 'LOI Structures', val: '3 Options', color: C.gold },
      { label: 'Commission Protection', val: '24 Months', color: C.green },
      { label: 'Email to Buyer', val: '1-Click', color: C.green },
      { label: 'Buyer Signs Using', val: 'DocuSign / Adobe', color: C.muted },
      { label: 'Attorney Required', val: 'For Final Docs Only', color: C.muted },
    ],
  },
  {
    num: '09',
    label: 'Deal Pipeline',
    href: '/pipeline',
    icon: '',
    color: C.gold,
    tagline: 'Every moving piece of your deal, tracked',
    what: 'A full deal management layer, document checklists, NDA tracker, LOI status, and due diligence progress. Nothing falls through the cracks.',
    features: [
      { title: 'Stage Tracker', desc: 'Onboarding → Active → Matched → LOI → Due Diligence → Closed. Click any stage to see what\'s done and what\'s pending.' },
      { title: 'Document Checklist', desc: 'Every document required to close, CIM, NDA, LOI, financials, legal entity docs, licenses. Green = submitted. Red = pending.' },
      { title: 'CIM Status', desc: 'Confidential Information Memorandum, the deal book buyers receive under NDA. Track whether it\'s drafted, reviewed, or distributed.' },
      { title: 'NDA Tracker', desc: 'Every buyer who signed an NDA appears here with the date and a link to the agreement. Full chain of custody.' },
      { title: 'LOI Tracker', desc: "When a buyer submits a Letter of Intent, track the terms, counters, and status. You'll see it here before you even get the email." },
      { title: 'Due Diligence Checklist', desc: 'Once under LOI, buyers get a due diligence list. Track every item, financial, legal, operational, in one place.' },
    ],
    callout: 'Most deals fall apart in due diligence because no one is managing the process. This page is why Kingdom Broker\'s deals close.',
    visual: [
      { label: 'Current Stage', val: 'Matched', color: C.gold },
      { label: 'Documents Submitted', val: '9 / 9', color: C.green },
      { label: 'CIM Status', val: 'Complete', color: C.green },
      { label: 'NDAs Signed', val: '3', color: C.gold },
      { label: 'Active LOIs', val: '1', color: C.green },
      { label: 'Due Diligence', val: 'In Progress', color: C.gold },
    ],
  },
  {
    num: '10',
    label: 'Trust Planning',
    href: '/trust',
    icon: '',
    color: C.green,
    tagline: 'Keep more of what you earned, legally',
    what: 'Before you close, Kingdom Broker connects you with licensed trust planning specialists who can legally reduce your capital gains tax from 15–30% using IRS-approved structures. This is the page that can add hundreds of thousands of dollars to your net proceeds, but only if you plan before you sign.',
    features: [
      { title: 'Why Timing Is Everything', desc: 'Trust structures must be set up before your deal closes. Once you sign a purchase agreement, it is too late. This page exists so you have time to act.' },
      { title: 'Three Trust Strategies', desc: 'IDGT (Intentionally Defective Grantor Trust), Charitable Remainder Trust, and Family LLC structures, each explained in plain English with real dollar savings examples.' },
      { title: 'Tax Rate Comparison', desc: 'Standard capital gains on a $3M profit: $450K–$900K in taxes. With a proper trust in place before closing: potentially $150K–$400K. The difference is real.' },
      { title: 'Generational Wealth Formula', desc: 'Place $2M in a 10% APY trust. The principal never gets touched. Your kids and grandkids live off the interest, $200K per year, forever. This section shows you how.' },
      { title: 'Nexxess Partnership', desc: "Kingdom Broker's trust planning partner. Licensed, documented advisors who work specifically with business sale proceeds. Not a generic financial planner, a deal-specific specialist." },
      { title: 'Get Started Form', desc: 'One form connects you directly with a trust advisor. Name, email, estimated sale value, timeline. The consultation is free. The savings are not.' },
    ],
    callout: 'Most sellers find out about trust planning after they close, and by then it\'s too late. On a $3M business sale, a proper trust structure before closing can save $150K–$500K in taxes. That money belongs to your family, not the IRS.',
    visual: [
      { label: 'Capital Gains Tax (Standard)', val: '15–30%', color: '#E87373' },
      { label: 'With Trust Structure', val: '~12–15%', color: C.green },
      { label: 'Potential Savings (on $3M)', val: '$150K–$500K', color: C.green },
      { label: 'Trust APY (Nexxess)', val: '10%', color: C.gold },
      { label: 'Annual Interest on $2M', val: '$200K/yr', color: C.green },
      { label: 'Principal Touched', val: 'Never', color: C.green },
    ],
  },
  {
    num: '11',
    label: 'Refer & Earn Ambassador',
    href: '/ambassadors/portal',
    icon: '',
    color: C.green,
    tagline: 'Earn 10% of every referral you close with Kingdom Broker',
    what: 'The Kingdom Ambassador program. Refer business owners ready to sell, or qualified buyers looking to acquire, and earn 10% of the KB advisory fee on every deal that closes. Your personal referral link tracks every lead, and your dashboard shows you pipeline value, closed deals, and payouts in real time.',
    features: [
      { title: 'Your Personal Referral Code', desc: 'Every ambassador gets a unique tracking code (e.g., KB-ERIC-42). Share it via email, SMS, LinkedIn, or a custom landing page. Every click, signup, and close is attributed to you.' },
      { title: 'Live Referral Dashboard', desc: 'See every lead you sent — their name, stage (Lead / NDA / LOI / Closed), estimated deal value, and projected payout to you. Refresh every visit to track your pipeline.' },
      { title: '10% of Advisory Fee', desc: 'On a $3M deal with a 10% KB fee ($300K), you earn $30K. On a $10M deal, you earn $100K. Payouts wired within 7 days of closing.' },
      { title: 'Seller + Buyer Referrals Both Count', desc: 'Refer a business owner ready to sell OR a buyer looking to acquire — both earn you the same 10%. Kingdom Warriors, pastors, advisors, CPAs, and past clients all win with this model.' },
      { title: 'Marketing Kit Included', desc: 'Pre-written emails, LinkedIn posts, and a personalized landing page (kingdombroker.com/r/YOUR-CODE) so you never have to write outreach from scratch.' },
      { title: 'Apply or Check Code', desc: 'First-time ambassadors apply through /ambassadors. Existing ambassadors enter their code to access the portal. Admin approves within 24 hours.' },
    ],
    callout: 'The Kingdom Warriors community is 11,000+ strong across 81 nations. Ambassadors who refer one seller per quarter typically clear $30K–$100K per year on commissions alone, while helping business owners they already know get the exit they deserve.',
    visual: [
      { label: 'Commission Per Deal', val: '10% of KB fee', color: C.gold },
      { label: 'Avg Ambassador Earnings', val: '$30K–$100K/yr', color: C.green },
      { label: 'Payout Speed', val: '7 days post-close', color: C.green },
      { label: 'Referral Types', val: 'Sellers + Buyers', color: C.gold },
      { label: 'Marketing Kit', val: 'Included', color: C.green },
      { label: 'Status', val: 'Open Enrollment', color: C.gold },
    ],
  },
  {
    num: '12',
    label: 'Agent Center',
    href: '/agents',
    icon: '',
    color: '#5BB8F5',
    tagline: '12 KB acquisition agents running your deal pipeline 24/7',
    what: 'The internal command center for running Kingdom Broker\'s proprietary agent pipelines. 6 seller discovery agents + 6 buyer discovery agents operate in parallel.',
    features: [
      { title: 'Run Pipeline Button', desc: 'One click triggers the full orchestration, Seller Only, Buyer Only, or Both simultaneously. The Python agents fire and report back in real time.' },
      { title: 'Agent Status Panel', desc: 'Live view of each agent: Search (queries fired) → Scraper (businesses found) → Qualifier (scores assigned) → Enrichment (data added) → Outreach (emails written) → Export.' },
      { title: 'Seller Leads Table', desc: 'Every business the agents found ranked by sell-readiness score (1–10). Filter by state, industry, score range. View the personalized outreach email the KB engine wrote for each one.' },
      { title: 'Buyer Leads Table', desc: 'Every investor and buyer found ranked by fit score. Family offices, PE funds, search funds, independent sponsors. Each gets a custom pitch email.' },
      { title: 'Run History', desc: 'Full log of every pipeline run, when it ran, how many leads found, cost per run, status. Full audit trail.' },
      { title: 'Export to Excel', desc: 'One-click export of seller leads or buyer leads to Excel for CRM import or external review.' },
    ],
    callout: 'Admin-only. This page is Kingdom Broker\'s engine room, not visible to seller clients. The agents run continuously, feeding the buyer and seller pipelines with fresh leads.',
    visual: [
      { label: 'Seller Agents', val: '6 Active', color: '#5BB8F5' },
      { label: 'Buyer Agents', val: '6 Active', color: '#5BB8F5' },
      { label: 'Leads Found (Last Run)', val: '143', color: C.gold },
      { label: 'Emails Written', val: '50', color: C.gold },
      { label: 'Cost Per Run', val: '~$4.20', color: C.green },
      { label: 'Avg Seller Score', val: '7.4 / 10', color: C.green },
    ],
  },
  {
    num: '13',
    label: 'Investor Data Room',
    href: '/investor',
    icon: '',
    color: C.gold,
    tagline: 'For family offices evaluating a $1M+ check',
    what: 'A full institutional investor data room for Kingdom Broker Inc. the company, not a seller client deal. This is the materials PE firms and family offices see when evaluating writing a check into KB.',
    features: [
      { title: 'CONFIDENTIAL Banner', desc: 'Marks the session as private. Every page view and document download is tracked and reported to Eric in real time via IntersectionObserver.' },
      { title: '10 Investor Sections', desc: 'Company Overview → Ecosystem → KB PE Fund → Traction → Financial Model → Cap Table → Technology → Team → Documents → The Ask. A complete picture of the company.' },
      { title: 'Revenue Projections Chart', desc: 'Interactive Recharts area chart with Conservative / Base / Optimistic scenarios across 12 months. Numbers are real model outputs, not hockey sticks.' },
      { title: 'Cap Table', desc: "Full capitalization table, Eric's Class B shares, co-founders, partners, and new investor pool. Complete pre/post-money percentages." },
      { title: 'Return Scenarios', desc: 'Conservative 1.9× / Base 4.4× / Optimistic 8.8×, with explicit assumptions for each. Investors can stress-test the model themselves.' },
      { title: 'Document Vault', desc: 'Links to Executive Summary, Cap Table, Pitch Deck, partnership overviews. All downloads tracked. Eric sees who downloaded what and when.' },
    ],
    callout: 'Every section view is tracked by IntersectionObserver and posted to /api/investor-session. Eric gets a real-time engagement map, he knows which sections each investor spent time on before they email him.',
    visual: [
      { label: 'Pre-Money Valuation', val: '$15,000,000', color: C.gold },
      { label: 'Raising', val: '$2,000,000', color: C.gold },
      { label: 'Ownership at Entry', val: '11.76%', color: C.text },
      { label: 'Min Check', val: '$250,000', color: C.text },
      { label: 'Return (Base)', val: '4.4×', color: C.green },
      { label: 'Return (Optimistic)', val: '8.8×', color: C.green },
    ],
  },

]

export default function WalkthroughPage() {
  const [step, setStep] = useState(0)
  const current = STEPS[step]

  return (
    <div style={{ padding: '28px 32px', fontFamily: F.body, color: C.text, maxWidth: '960px' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontFamily: F.mono, fontSize: '10px', color: 'var(--kb-text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>Your Guide</div>
        <h1 style={{ fontFamily: F.display, fontSize: '28px', fontWeight: 590, margin: '0 0 6px', letterSpacing: '-0.3px' }}>How Kingdom Broker Works</h1>
        <p style={{ fontSize: '14px', color: C.muted, margin: 0 }}>A plain-English guide to every page, what it does, how to use it, and why it matters for closing your deal at the right price.</p>
      </div>

      {/* Step nav pills */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '28px' }}>
        {STEPS.map((s, i) => (
          <button
            key={s.num}
            onClick={() => setStep(i)}
            style={{
              padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              fontFamily: F.body, fontSize: '12px', fontWeight: step === i ? 600 : 400,
              background: step === i ? C.gold : 'var(--kb-bg-raised)',
              color: step === i ? 'var(--kb-bg)' : C.muted,
              transition: 'all 0.15s',
            }}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Prev / Next Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{ padding: '10px 22px', background: 'var(--kb-bg-card)', border: `1px solid ${step === 0 ? 'var(--kb-bg-raised)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '6px', color: step === 0 ? C.faint : C.muted, fontSize: '14px', fontWeight: 510, cursor: step === 0 ? 'default' : 'pointer', fontFamily: F.body }}
        >
          Previous
        </button>

        <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              onClick={() => setStep(i)}
              style={{ width: i === step ? '22px' : '7px', height: '7px', borderRadius: '4px', background: i === step ? C.gold : C.faint, cursor: 'pointer', transition: 'all 0.2s' }}
            />
          ))}
        </div>

        <button
          onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
          disabled={step === STEPS.length - 1}
          style={{ padding: '10px 22px', background: step === STEPS.length - 1 ? 'rgba(255,255,255,0.02)' : C.gold, border: `1px solid ${step === STEPS.length - 1 ? 'var(--kb-bg-raised)' : C.gold}`, borderRadius: '6px', color: step === STEPS.length - 1 ? C.faint : 'var(--kb-bg)', fontSize: '14px', fontWeight: step === STEPS.length - 1 ? 510 : 590, cursor: step === STEPS.length - 1 ? 'default' : 'pointer', fontFamily: F.body }}
        >
          Next
        </button>
      </div>

      {/* Main card */}
      <div style={{ background: C.navy2, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>

        {/* Top stripe */}
        <div style={{ background: `linear-gradient(135deg, rgba(201,168,76,0.08), ${C.navy3})`, borderBottom: `1px solid ${C.border}`, padding: '28px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
            <div style={{ fontFamily: F.mono, fontSize: '11px', color: current.color, letterSpacing: '0.2em', background: `${current.color}18`, border: `1px solid ${current.color}40`, padding: '3px 10px', borderRadius: '4px' }}>
              PAGE {current.num}
            </div>
            <div style={{ flex: 1, height: '1px', background: `${current.color}30` }} />
            <Link
              href={current.href}
              style={{ padding: '7px 18px', background: current.color, color: 'var(--kb-bg)', borderRadius: '7px', fontSize: '12px', fontWeight: 590, textDecoration: 'none', fontFamily: F.body }}
            >
              Open Page →
            </Link>
          </div>
          <h2 style={{ fontFamily: F.display, fontSize: '28px', fontWeight: 510, margin: '0 0 6px', color: C.text }}>{current.label}</h2>
          <div style={{ fontSize: '16px', color: current.color, fontWeight: 510, margin: '0 0 12px' }}>{current.tagline}</div>
          <p style={{ fontSize: '14px', color: C.muted, margin: 0, lineHeight: 1.75, maxWidth: '680px' }}>{current.what}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '0' }}>

          {/* Features list */}
          <div style={{ padding: '28px 32px', borderRight: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.faint, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '18px' }}>What's on this page</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {current.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: '14px', paddingBottom: '18px', marginBottom: '18px', borderBottom: i < current.features.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: `${current.color}15`, border: `1px solid ${current.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: current.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 590, color: C.text, marginBottom: '4px' }}>{f.title}</div>
                    <div style={{ fontSize: '13px', color: C.muted, lineHeight: 1.65 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Callout */}
            <div style={{ background: `${current.color}0d`, border: `1px solid ${current.color}30`, borderRadius: '10px', padding: '16px 18px', marginTop: '4px' }}>
              <div style={{ fontFamily: F.mono, fontSize: '10px', color: current.color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '7px' }}>Why this matters</div>
              <p style={{ fontSize: '13px', color: C.text, margin: 0, lineHeight: 1.7 }}>{current.callout}</p>
            </div>
          </div>

          {/* Right panel, key numbers */}
          <div style={{ padding: '28px 24px', background: C.navy3 }}>
            <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.faint, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px' }}>Key Numbers</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {current.visual.map((v, i) => (
                <div key={i} style={{ background: C.navy2, border: `1px solid ${C.border}`, borderRadius: '9px', padding: '11px 14px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ fontSize: '10px', color: C.faint, fontFamily: F.mono, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{v.label}</div>
                  <div style={{ fontSize: '16px', fontWeight: 590, color: v.color, fontFamily: F.display }}>{v.val}</div>
                </div>
              ))}
            </div>

            {/* Open page CTA */}
            <Link
              href={current.href}
              style={{ display: 'block', textAlign: 'center', padding: '12px', background: `${current.color}15`, border: `1px solid ${current.color}35`, borderRadius: '9px', color: current.color, fontSize: '13px', fontWeight: 590, textDecoration: 'none', fontFamily: F.body }}
            >
              Open {current.label} →
            </Link>
          </div>
        </div>
      </div>

      {/* Prev / Next (also rendered at top) */}

      {/* All pages summary at bottom */}
      <div style={{ marginTop: '32px', background: C.navy2, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '24px' }}>
        <div style={{ fontFamily: F.mono, fontSize: '10px', color: 'var(--kb-text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '18px' }}>All Pages, Quick Reference</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
          {STEPS.map((s, i) => (
            <Link key={s.num} href={s.href} style={{ textDecoration: 'none' }}>
              <div
                onClick={() => setStep(i)}
                style={{ padding: '12px 14px', background: step === i ? `${s.color}10` : C.navy3, border: `1px solid ${step === i ? s.color + '35' : C.border}`, borderRadius: '9px', cursor: 'pointer', transition: 'all 0.15s' }}
              >
                <div style={{ fontSize: '15px', marginBottom: '4px' }}>{s.icon}</div>
                <div style={{ fontSize: '12px', fontWeight: 510, color: step === i ? s.color : C.text, marginBottom: '2px' }}>{s.label}</div>
                <div style={{ fontSize: '11px', color: C.faint, lineHeight: 1.4 }}>{s.tagline}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
