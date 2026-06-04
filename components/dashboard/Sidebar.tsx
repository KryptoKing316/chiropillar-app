'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import ThemeToggle from './ThemeToggle'

function useTheme() {
  const [theme, setTheme] = useState('dark')
  useEffect(() => {
    const obs = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute('data-theme') || 'dark')
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    setTheme(document.documentElement.getAttribute('data-theme') || 'dark')
    return () => obs.disconnect()
  }, [])
  return theme
}

// ── Custom SVG Icons ─────────────────────────────────────────────────────────
// 18×18 stroke-based, designed for KB's data-intelligence aesthetic

const IC = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 18 18" width="18" height="18"
    fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    {...props}
  />
)

const ICONS: Record<string, React.ReactNode> = {
  '/overview': (
    <IC>
      <rect x="2" y="2" width="5.5" height="5.5" rx="1"/>
      <rect x="10.5" y="2" width="5.5" height="5.5" rx="1"/>
      <rect x="2" y="10.5" width="5.5" height="5.5" rx="1"/>
      <rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1"/>
    </IC>
  ),
  '/walkthrough': (
    <IC>
      <circle cx="9" cy="9" r="7"/>
      <circle cx="9" cy="9" r="2"/>
      <line x1="9" y1="2" x2="9" y2="4"/>
      <line x1="9" y1="14" x2="9" y2="16"/>
      <line x1="2" y1="9" x2="4" y2="9"/>
      <line x1="14" y1="9" x2="16" y2="9"/>
    </IC>
  ),
  '/documents': (
    <IC>
      <path d="M10 2H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z"/>
      <polyline points="10,2 10,7 15,7"/>
      <line x1="6" y1="10" x2="12" y2="10"/>
      <line x1="6" y1="13" x2="10" y2="13"/>
    </IC>
  ),
  '/financials': (
    <IC>
      <rect x="2" y="9.5" width="3.5" height="6.5" rx="0.5"/>
      <rect x="7.25" y="6" width="3.5" height="10" rx="0.5"/>
      <rect x="12.5" y="2.5" width="3.5" height="13.5" rx="0.5"/>
      <line x1="1.5" y1="16.5" x2="16.5" y2="16.5"/>
    </IC>
  ),
  '/valuation': (
    <IC>
      <polyline points="2,13 5.5,8.5 9,10.5 16,3"/>
      <polyline points="13,3 16,3 16,6"/>
      <circle cx="9" cy="15" r="1.5" fill="currentColor" stroke="none"/>
      <line x1="7" y1="13.5" x2="11" y2="16.5" strokeWidth="1"/>
    </IC>
  ),
  '/trust': (
    <IC>
      <path d="M9 1.5L2.5 4.5v5c0 4 3.5 6.5 6.5 7.5 3-1 6.5-3.5 6.5-7.5v-5L9 1.5z"/>
      <polyline points="6.5,9 8,10.5 11.5,7"/>
    </IC>
  ),
  '/trades': (
    <IC>
      <circle cx="5" cy="6" r="2.5"/>
      <circle cx="13" cy="6" r="2.5"/>
      <path d="M1 16c0-2.2 1.8-4 4-4s4 1.8 4 4"/>
      <path d="M9 16c0-2.2 1.8-4 4-4s4 1.8 4 4"/>
    </IC>
  ),
  '/cim': (
    <IC>
      <path d="M10.5 2H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6.5z"/>
      <polyline points="10.5,2 10.5,6.5 15,6.5"/>
      <line x1="6" y1="9.5" x2="12" y2="9.5"/>
      <line x1="6" y1="12" x2="9" y2="12"/>
      <path d="M11.5 12.5l2.5-2.5 1.5 1.5-2.5 2.5z"/>
    </IC>
  ),
  '/buyers': (
    <IC>
      <circle cx="6.5" cy="6" r="2.5"/>
      <path d="M1.5 16c0-2.76 2.24-5 5-5s5 2.24 5 5"/>
      <circle cx="13" cy="6" r="2"/>
      <path d="M13 11.5c1.93 0 3.5 1.57 3.5 3.5v1"/>
    </IC>
  ),
  '/pipeline': (
    <IC>
      <circle cx="3" cy="9" r="2"/>
      <line x1="5" y1="9" x2="7" y2="9"/>
      <circle cx="9" cy="9" r="2"/>
      <line x1="11" y1="9" x2="13" y2="9"/>
      <circle cx="15" cy="9" r="2"/>
      <line x1="9" y1="2" x2="9" y2="7"/>
      <line x1="3" y1="11" x2="3" y2="16"/>
      <line x1="15" y1="11" x2="15" y2="16"/>
    </IC>
  ),
  '/deal-stage': (
    <IC>
      <path d="M2.5 11.5c1-1.5 2.5-2.5 4.5-2.5 1.5 0 2.5.5 3.5 1.5s2 1.5 3.5 1.5c1.5 0 2.5-.5 3.5-1.5"/>
      <path d="M2.5 8c1-1.5 2.5-2.5 4.5-2.5 1.5 0 2.5.5 3.5 1.5s2 1.5 3.5 1.5c1.5 0 2.5-.5 3.5-1.5"/>
      <line x1="2" y1="15" x2="16" y2="15"/>
      <line x1="9" y1="2" x2="9" y2="5"/>
      <polyline points="7,3.5 9,2 11,3.5"/>
    </IC>
  ),
  '/marketing': (
    <IC>
      <path d="M1.5 9a7.5 7.5 0 0 1 15 0"/>
      <path d="M4.5 9a4.5 4.5 0 0 1 9 0"/>
      <path d="M7.5 9a1.5 1.5 0 0 1 3 0"/>
      <line x1="9" y1="9" x2="9" y2="16"/>
      <line x1="6" y1="16" x2="12" y2="16"/>
    </IC>
  ),
  '/flywheel': (
    <IC>
      <path d="M15 9A6 6 0 1 1 9 3"/>
      <polyline points="9,1 9,4 12,4"/>
      <circle cx="9" cy="9" r="2"/>
      <circle cx="9" cy="9" r="0.5" fill="currentColor" stroke="none"/>
    </IC>
  ),
  '/investor': (
    <IC>
      <line x1="1.5" y1="16" x2="16.5" y2="16"/>
      <line x1="9" y1="2" x2="9" y2="5"/>
      <path d="M2 8l7-5.5L16 8"/>
      <rect x="3.5" y="8" width="3" height="8"/>
      <rect x="7.5" y="10.5" width="3" height="5.5"/>
      <rect x="11.5" y="12" width="3" height="4"/>
    </IC>
  ),
  '/agents': (
    <IC>
      <rect x="4" y="5" width="10" height="9" rx="2"/>
      <line x1="7" y1="5" x2="7" y2="3"/>
      <line x1="11" y1="5" x2="11" y2="3"/>
      <circle cx="7" cy="9.5" r="1" fill="currentColor" stroke="none"/>
      <circle cx="11" cy="9.5" r="1" fill="currentColor" stroke="none"/>
      <line x1="7" y1="12" x2="11" y2="12"/>
      <line x1="2" y1="9.5" x2="4" y2="9.5"/>
      <line x1="14" y1="9.5" x2="16" y2="9.5"/>
    </IC>
  ),
  '/digital-twin': (
    <IC>
      <circle cx="9" cy="5.5" r="2.5"/>
      <path d="M4.5 16c0-2.49 2.02-4.5 4.5-4.5s4.5 2.01 4.5 4.5"/>
      <line x1="13.5" y1="3" x2="16" y2="3"/>
      <line x1="13" y1="5.5" x2="16" y2="5.5"/>
      <line x1="13.5" y1="8" x2="16" y2="8"/>
      <line x1="4.5" y1="3" x2="2" y2="3"/>
      <line x1="5" y1="5.5" x2="2" y2="5.5"/>
      <line x1="4.5" y1="8" x2="2" y2="8"/>
    </IC>
  ),
  '/admin': (
    <IC>
      <circle cx="9" cy="9" r="2.5"/>
      <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.42 1.42M12.88 12.88l1.42 1.42M14.3 3.7l-1.42 1.42M5.12 12.88l-1.42 1.42"/>
    </IC>
  ),
  '/founder-comp': (
    <IC>
      {/* Two people split · founder comp */}
      <circle cx="6" cy="6" r="2.5"/>
      <circle cx="12" cy="6" r="2.5"/>
      <path d="M2 16c0-2 1.79-3.5 4-3.5s4 1.5 4 3.5"/>
      <path d="M8 16c0-2 1.79-3.5 4-3.5s4 1.5 4 3.5"/>
    </IC>
  ),
  '/ambassadors': (
    <IC>
      <path d="M16 16v-1.5c0-2-1.5-3.5-3.5-3.5h-1"/>
      <circle cx="9" cy="6" r="3"/>
      <path d="M2 16v-1.5c0-2 1.5-3.5 3.5-3.5h1"/>
      <path d="M13 6.5l1.5 1.5 3-3"/>
    </IC>
  ),
  '/demo': (
    <IC>
      <circle cx="9" cy="9" r="7"/>
      <polygon points="7,6 13,9 7,12" fill="currentColor" stroke="none"/>
    </IC>
  ),
  '/exchange': (
    <IC>
      {/* Network/coalition icon — 3 nodes connected */}
      <circle cx="9" cy="3.5" r="2"/>
      <circle cx="3.5" cy="13" r="2"/>
      <circle cx="14.5" cy="13" r="2"/>
      <line x1="9" y1="5.5" x2="4.5" y2="11"/>
      <line x1="9" y1="5.5" x2="13.5" y2="11"/>
      <line x1="5.5" y1="13" x2="12.5" y2="13"/>
    </IC>
  ),
  '/services': (
    <IC>
      {/* Upward growth arrow w/ branches — scaling */}
      <path d="M2 14L9 7l3.5 3.5L16 4"/>
      <polyline points="12,4 16,4 16,8"/>
      <line x1="9" y1="14" x2="9" y2="16"/>
      <line x1="5" y1="14" x2="5" y2="16"/>
      <line x1="13" y1="11" x2="13" y2="16"/>
    </IC>
  ),
  '/services/gmb': (
    <IC>
      {/* Map pin */}
      <path d="M9 1.5C5.5 1.5 3 4 3 7c0 4 6 9.5 6 9.5s6-5.5 6-9.5c0-3-2.5-5.5-6-5.5z"/>
      <circle cx="9" cy="7" r="2"/>
    </IC>
  ),
  '/services/seo': (
    <IC>
      {/* Magnifier over bar chart */}
      <circle cx="7.5" cy="7.5" r="4.5"/>
      <line x1="10.8" y1="10.8" x2="15.5" y2="15.5"/>
      <line x1="5.5" y1="9" x2="5.5" y2="7"/>
      <line x1="7.5" y1="9" x2="7.5" y2="5.5"/>
      <line x1="9.5" y1="9" x2="9.5" y2="7"/>
    </IC>
  ),
  '/services/marketing': (
    <IC>
      {/* Megaphone */}
      <path d="M2.5 7v4l8 3V4l-8 3z"/>
      <path d="M10.5 6c1.5 0.5 2.5 1.5 2.5 3s-1 2.5-2.5 3"/>
      <line x1="4.5" y1="11" x2="6" y2="15"/>
    </IC>
  ),
  '/leads': (
    <IC>
      {/* Stack of contact cards · CRM */}
      <rect x="2" y="3" width="14" height="3" rx="1"/>
      <rect x="2" y="7.5" width="14" height="3" rx="1"/>
      <rect x="2" y="12" width="14" height="3" rx="1"/>
      <circle cx="5" cy="4.5" r="0.7" fill="currentColor"/>
      <line x1="7.5" y1="4.5" x2="14" y2="4.5"/>
      <circle cx="5" cy="9" r="0.7" fill="currentColor"/>
      <line x1="7.5" y1="9" x2="14" y2="9"/>
      <circle cx="5" cy="13.5" r="0.7" fill="currentColor"/>
      <line x1="7.5" y1="13.5" x2="14" y2="13.5"/>
    </IC>
  ),
  '/leaderboard': (
    <IC>
      {/* Trophy */}
      <path d="M5 3h8v3a4 4 0 0 1-4 4 4 4 0 0 1-4-4V3z"/>
      <path d="M5 4.5H2.5v1.5a2.5 2.5 0 0 0 2.5 2.5"/>
      <path d="M13 4.5h2.5v1.5a2.5 2.5 0 0 1-2.5 2.5"/>
      <line x1="9" y1="10" x2="9" y2="13"/>
      <line x1="6" y1="15.5" x2="12" y2="15.5"/>
      <line x1="7" y1="13" x2="11" y2="13"/>
    </IC>
  ),
  '/targets': (
    <IC>
      {/* Person + plus — incoming application */}
      <circle cx="7" cy="6.5" r="2.5"/>
      <path d="M2 16c0-2.76 2.24-5 5-5s5 2.24 5 5"/>
      <line x1="13" y1="4" x2="13" y2="9"/>
      <line x1="10.5" y1="6.5" x2="15.5" y2="6.5"/>
    </IC>
  ),
  '/calculator': (
    <IC>
      {/* Calculator grid */}
      <rect x="3" y="2" width="12" height="14" rx="1.5"/>
      <rect x="5" y="4" width="8" height="2.5" rx="0.5"/>
      <circle cx="6.5" cy="9" r="0.6" fill="currentColor"/>
      <circle cx="9" cy="9" r="0.6" fill="currentColor"/>
      <circle cx="11.5" cy="9" r="0.6" fill="currentColor"/>
      <circle cx="6.5" cy="11.5" r="0.6" fill="currentColor"/>
      <circle cx="9" cy="11.5" r="0.6" fill="currentColor"/>
      <circle cx="11.5" cy="11.5" r="0.6" fill="currentColor"/>
      <rect x="6" y="13.5" width="6" height="1.5" rx="0.4"/>
    </IC>
  ),
  '/data-room': (
    <IC>
      {/* Vault / secure folder */}
      <rect x="2.5" y="4" width="13" height="11" rx="1.5"/>
      <circle cx="9" cy="9.5" r="2.5"/>
      <line x1="9" y1="9.5" x2="9" y2="11.5"/>
      <line x1="2.5" y1="7" x2="15.5" y2="7"/>
    </IC>
  ),
  '/outreach': (
    <IC>
      {/* Megaphone */}
      <path d="M2.5 7v4l8 3V4l-8 3z"/>
      <path d="M10.5 6c1.5 0.5 2.5 1.5 2.5 3s-1 2.5-2.5 3"/>
      <line x1="4.5" y1="11" x2="6" y2="15"/>
    </IC>
  ),
  '/analytics': (
    <IC>
      {/* Bars + trend line */}
      <line x1="2" y1="16" x2="16" y2="16"/>
      <rect x="3" y="11" width="2.5" height="5" rx="0.3"/>
      <rect x="7" y="7" width="2.5" height="9" rx="0.3"/>
      <rect x="11" y="4" width="2.5" height="12" rx="0.3"/>
      <polyline points="3.5,9 8,5.5 12,3 15.5,1.5" strokeWidth="1" opacity="0.6"/>
    </IC>
  ),
  '/team': (
    <IC>
      {/* Three people — team */}
      <circle cx="9" cy="5.5" r="2.5"/>
      <path d="M4.5 16c0-2.49 2.02-4.5 4.5-4.5s4.5 2.01 4.5 4.5"/>
      <circle cx="3" cy="7" r="1.5"/>
      <circle cx="15" cy="7" r="1.5"/>
      <path d="M0.5 14c0-1.5 1.12-2.5 2.5-2.5"/>
      <path d="M17.5 14c0-1.5-1.12-2.5-2.5-2.5"/>
    </IC>
  ),
  '/settings': (
    <IC>
      {/* Gear */}
      <circle cx="9" cy="9" r="2.5"/>
      <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.42 1.42M12.88 12.88l1.42 1.42M14.3 3.7l-1.42 1.42M5.12 12.88l-1.42 1.42"/>
    </IC>
  ),
  '/nda-loi': (
    <IC>
      {/* Document with pen / signature line */}
      <path d="M10 2H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z"/>
      <polyline points="10,2 10,7 15,7"/>
      <line x1="6" y1="11" x2="11" y2="11"/>
      <path d="M11 13.5l1.5-1.5 1.5 1.5"/>
    </IC>
  ),
  '/launch-plan': (
    <IC>
      {/* Rocket / launch */}
      <path d="M9 1.5L13 6v6l-4 3-4-3V6z"/>
      <line x1="6" y1="13.5" x2="5" y2="16.5"/>
      <line x1="12" y1="13.5" x2="13" y2="16.5"/>
      <circle cx="9" cy="7.5" r="1.5"/>
    </IC>
  ),
  '/scale': (
    <IC>
      {/* Upward stair-step growth */}
      <line x1="2" y1="14" x2="4.5" y2="14"/>
      <line x1="4.5" y1="14" x2="4.5" y2="11"/>
      <line x1="4.5" y1="11" x2="8" y2="11"/>
      <line x1="8" y1="11" x2="8" y2="7.5"/>
      <line x1="8" y1="7.5" x2="11.5" y2="7.5"/>
      <line x1="11.5" y1="7.5" x2="11.5" y2="4"/>
      <line x1="11.5" y1="4" x2="16" y2="4"/>
      <polyline points="13.5,2 16,4 13.5,6" strokeWidth="1.2"/>
    </IC>
  ),
}

// ── Nav items · ChiroPillar / Wagner Family Office ───────────────────────────
// Lean nav focused on the chiropractor roll-up workflow.
// Live surfaces: Walkthrough + Intake Submissions + Deal Calculator
// "Soon" badge = wired in the nav, placeholder page for the Loom
const NAV = [
  { href: '/walkthrough',  label: 'Self-Demo Guide',      badge: 'Live' },
  { href: '/overview',     label: 'Overview',             badge: 'Live' },
  { href: '/leads',        label: 'Deal Pipeline · CRM',  badge: 'Live' },
  { href: '/targets',      label: 'Intake Submissions'                  },
  { href: '/calculator',   label: 'Deal Calculator'                     },
  { href: '/analytics',    label: 'Analytics',            badge: 'Live' },
  { href: '/valuation',    label: 'AI Valuation',         badge: 'Live' },
  { href: '/pipeline',     label: 'Acquisition Pipeline', badge: 'Live' },
  { href: '/data-room',    label: 'Data Room',            badge: 'Live' },
  { href: '/nda-loi',      label: 'NDAs & LOIs',          badge: 'Soon' },
  { href: '/scale',        label: 'Scale Services',       badge: 'Live' },
  { href: '/launch-plan',  label: '24-Mo Launch Plan',    badge: 'NEW'  },
  { href: '/outreach',     label: 'Outreach Campaigns',   badge: 'Soon' },
]

// Admin-only surfaces · Eric / Wagner / McGrath
const ADMIN_DEMOS: Array<{ href: string; label: string; ericOnly?: boolean }> = [
  { href: '/agents',       label: 'Agent Center'                       },
  { href: '/founder-comp', label: 'Founder Comp', ericOnly: true       },
  { href: '/admin',        label: 'Admin Panel'                        },
]


export default function Sidebar({ userEmail, isDemo, isAdmin, isEricOnly }: { userEmail?: string; isDemo?: boolean; isAdmin?: boolean; isEricOnly?: boolean }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  // Escalating Pillar platform mark · no baked text · wordmark rendered as HTML below
  const logoSrc = '/chiropillar-logo-platform.svg'

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 769) setMobileOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const sidebarContent = (
    <div style={{
      width: '240px', minWidth: '240px', height: '100vh', background: 'var(--kb-sidebar-bg)',
      borderRight: '1px solid var(--kb-sidebar-border)', display: 'flex',
      flexDirection: 'column', fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif", fontFeatureSettings: '"cv01", "ss03"', flexShrink: 0,
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>

      {/* Logo · mascot icon + bold white ChiroPillar wordmark (no tagline — hard to read at this size) */}
      <div style={{ padding: '22px 16px 18px', borderBottom: '1px solid var(--kb-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="ChiroPillar mascot" style={{ width: '52px', height: '52px', display: 'block', flexShrink: 0 }} />
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '22px',
          fontWeight: 800,
          color: '#F2EEE7',
          letterSpacing: '-0.02em',
          lineHeight: 1,
          flex: 1,
        }}>
          ChiroPillar
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="kb-hamburger"
          style={{ display: 'none', background: 'transparent', border: 'none', color: 'var(--kb-text-secondary)', fontSize: '22px', cursor: 'pointer', padding: '4px' }}
        >✕</button>
      </div>

      {/* Platform badge · ChiroPillar partnership */}
      <div style={{ padding: '14px 14px', borderBottom: '1px solid var(--kb-border-subtle)' }}>
        <div style={{ background: 'rgba(46,117,182,0.10)', border: '1px solid rgba(46,117,182,0.25)', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--kb-text-secondary)', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '5px' }}>Platform</div>
          <div style={{ fontSize: '15px', color: 'var(--kb-text)', fontWeight: 600, lineHeight: 1.3 }}>ChiroPillar</div>
          <div style={{ fontSize: '12px', color: 'var(--kb-text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>Chiropractic Roll-Up Partnership</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
        {NAV.map((item: { href: string; label: string; badge?: string }) => {
          const exact = item.href === '/overview'
          const isActive = exact ? pathname === item.href : pathname.startsWith(item.href)
          const icon = ICONS[item.href]
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '11px 12px', borderRadius: '8px', marginBottom: '2px',
                background: isActive ? 'rgba(201,168,76,0.08)' : 'transparent',
                borderLeft: isActive ? '3px solid #C9A84C' : '3px solid transparent',
                color: isActive ? '#C9A84C' : '#9BA8C0',
                fontSize: '14px', fontWeight: 510,
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <span style={{ opacity: isActive ? 1 : 0.55, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  {icon}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{
                    fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em',
                    padding: '2px 6px', borderRadius: '4px',
                    background: 'rgba(201,168,76,0.12)', color: '#C9A84C',
                    textTransform: 'uppercase',
                  }}>{item.badge}</span>
                )}
              </div>
            </Link>
          )
        })}

        {/* Admin nav · Eric/Wagner/McGrath only (Agent Center + Admin Panel) */}
        {isAdmin && (
          <>
            <div style={{ margin: '10px 14px 8px', borderTop: '1px solid var(--kb-border)' }} />
            <div style={{ padding: '4px 12px 6px', fontSize: '11px', color: 'var(--kb-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 510 }}>Admin</div>
            {ADMIN_DEMOS.filter(item => !item.ericOnly || isEricOnly).map(({ href, label }) => (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '11px 12px', borderRadius: '8px', marginBottom: '2px',
                  background: pathname.startsWith(href) ? 'rgba(232,73,73,0.08)' : 'transparent',
                  borderLeft: pathname.startsWith(href) ? '3px solid #E87373' : '3px solid transparent',
                  color: pathname.startsWith(href) ? '#E87373' : '#9BA8C0',
                  fontSize: '14px', fontWeight: 510,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <span style={{ opacity: pathname.startsWith(href) ? 1 : 0.55, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    {ICONS[href] ?? ICONS['/admin']}
                  </span>
                  {label}
                </div>
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div style={{ padding: '14px', borderTop: '1px solid var(--kb-border)' }}>
        {isDemo && (
          <div style={{ marginBottom: '10px', padding: '8px 12px', background: 'var(--kb-accent-dim)', border: '1px solid var(--kb-accent-border)', borderRadius: '7px', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--kb-accent)', textTransform: 'uppercase' }}>Demo</span>
            <span style={{ fontSize: '13px', color: 'var(--kb-text-secondary)' }}>Read-only · 30 min session</span>
          </div>
        )}
        <div style={{ fontSize: '13px', color: 'var(--kb-text-muted)', marginBottom: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {userEmail || 'demo@kingdombroker.com'}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <ThemeToggle />
          <a href="/login" style={{ flex: 1, display: 'block', textAlign: 'center', padding: '8px', background: 'transparent', border: '1px solid var(--kb-border)', borderRadius: '6px', color: 'var(--kb-text-secondary)', fontSize: '13px', textDecoration: 'none' }}>
            Sign Out
          </a>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="kb-hamburger"
        style={{
          display: 'none', position: 'fixed', top: '14px', left: '14px', zIndex: 198,
          background: 'rgba(8,15,30,0.95)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '8px', padding: '8px 12px',
          color: 'var(--kb-accent)', fontSize: '20px', cursor: 'pointer',
          alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)',
        }}
        aria-label="Open menu"
      >☰</button>

      {mobileOpen && <div className="kb-mobile-overlay" onClick={() => setMobileOpen(false)} />}

      <div className={`kb-sidebar${mobileOpen ? ' kb-sidebar-open' : ''}`}>
        {sidebarContent}
      </div>
    </>
  )
}
