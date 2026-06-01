'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

type Client = {
  id: string
  slug: string
  business_name: string
  display_name: string | null
  city: string | null
  state: string | null
  industry: string | null
  owner_name: string | null
  owner_email: string | null
  signed_date: string | null
  exit_target_date: string | null
  exit_target_price_low: number | null
  exit_target_price_high: number | null
  current_fair_market: number | null
  run_rate_revenue: number | null
  normalized_ebitda: number | null
  current_multiple: number | null
  target_multiple: number | null
  total_owner_benefit: number | null
  upfront_fee: number | null
  success_fee_pct: number | null
  status: string | null
  is_demo: boolean | null
}

type Phase = {
  id: string
  client_id: string
  phase_number: number
  name: string
  tagline: string | null
  start_date: string | null
  end_date: string | null
  status: string | null
  sort_order: number | null
}

type Task = {
  id: string
  client_id: string
  phase_id: string | null
  title: string
  description: string | null
  owner: string | null
  category: string | null
  status: string | null
  priority: string | null
  due_date: string | null
  completed_at: string | null
  sort_order: number | null
}

type Document = {
  id: string
  client_id: string
  doc_group: string
  name: string
  file_path: string | null
  file_size: number | null
  status: 'pending' | 'uploaded' | 'processing' | string
  meta: string | null
  uploaded_at: string | null
  sort_order: number | null
}

type Activity = {
  id: string
  client_id: string
  who: string
  verb: string
  what: string
  activity_type: string | null
  created_at: string
}

type Signer = {
  name?: string
  email?: string
  role?: string
  status?: string
  signed_at?: string | null
  embed_src?: string
}

type SignatureRequest = {
  id: string
  client_id: string
  docuseal_submission_id: string | null
  document_name: string
  document_type: string | null
  status: string
  signers: Signer[] | null
  sent_at: string | null
  completed_at: string | null
  docuseal_audit_url: string | null
  created_at: string
}

type Props = {
  client: Client
  phases: Phase[]
  tasks: Task[]
  documents?: Document[]
  activities?: Activity[]
  signatures?: SignatureRequest[]
  isDemo: boolean
  isAdmin?: boolean
  activeTab: string
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'scale-plan', label: 'Scale Plan' },
  { id: 'financials', label: 'Financials' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'acquisition', label: 'Acquisition' },
  { id: 'documents', label: 'Documents' },
  { id: 'charity', label: 'Charity' },
]

function fmtMoney(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

function daysUntil(date: string | null): number {
  if (!date) return 0
  const target = new Date(date).getTime()
  const today = Date.now()
  return Math.max(0, Math.ceil((target - today) / (1000 * 60 * 60 * 24)))
}

function pctComplete(tasks: Task[]): number {
  if (tasks.length === 0) return 0
  const done = tasks.filter(t => t.status === 'completed' || t.status === 'done').length
  return Math.round((done / tasks.length) * 100)
}

function useTheme() {
  const [t, setT] = useState('dark')
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setT(document.documentElement.getAttribute('data-theme') || 'dark')
    )
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    setT(document.documentElement.getAttribute('data-theme') || 'dark')
    return () => obs.disconnect()
  }, [])
  return t
}

export default function ClientPortalShell({ client, phases, tasks: initialTasks, documents = [], activities = [], signatures = [], isDemo, isAdmin = false, activeTab: initialTab }: Props) {
  const [tab, setTab] = useState(initialTab)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [tasks, setTasks] = useState(initialTasks)
  const theme = useTheme()
  const isLight = theme.startsWith('light')
  const logoSrc = isLight ? '/kb-logo-dark.png' : '/kb-logo.png'

  // Detect mobile viewport
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const tasksByPhase = useMemo(() => {
    const map: Record<string, Task[]> = {}
    for (const p of phases) map[p.id] = []
    for (const t of tasks) {
      if (t.phase_id && map[t.phase_id]) map[t.phase_id].push(t)
    }
    return map
  }, [phases, tasks])

  const overallPct = pctComplete(tasks)
  const daysToExit = daysUntil(client.exit_target_date)

  const handleTaskUpdate = async (id: string, status: string) => {
    // Optimistic update
    setTasks(ts => ts.map(t => t.id === id ? { ...t, status } : t))
    try {
      const res = await fetch('/api/portal/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) {
        // Roll back on failure
        setTasks(ts => ts.map(t => t.id === id ? { ...t, status: initialTasks.find(it => it.id === id)?.status ?? 'pending' } : t))
      }
    } catch {
      setTasks(ts => ts.map(t => t.id === id ? { ...t, status: initialTasks.find(it => it.id === id)?.status ?? 'pending' } : t))
    }
  }

  return (
    <div style={isMobile ? S.appMobile : S.app}>
      {/* MOBILE TOP BAR */}
      {isMobile && (
        <div style={S.mobileTopBar}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="Kingdom Broker" style={S.mobileTopLogo} />
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            style={S.mobileMenuButton}
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? '✕' : '☰'}
          </button>
        </div>
      )}

      {/* SIDEBAR */}
      <aside style={isMobile ? { ...S.sidebar, ...S.sidebarMobile, ...(mobileNavOpen ? S.sidebarMobileOpen : {}) } : S.sidebar}>
        <div style={S.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="Kingdom Broker" style={S.logo} />
          <div style={S.brandPortal}>Client Portal · Beta</div>
        </div>

        <div style={S.ownerBlock}>
          <div style={S.ownerName}>{client.owner_name ?? 'Owner'}</div>
          <div style={S.ownerCo}>{client.business_name} · Owner</div>
        </div>

        <div style={S.navGroupLabel}>Navigation</div>
        <nav style={S.nav}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setMobileNavOpen(false) }}
              style={{ ...S.navItem, ...(tab === t.id ? S.navItemActive : {}) }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div style={S.activePrograms}>
          <div style={S.activeLabel}>Active Programs</div>
          <ul style={S.activeList}>
            <li style={S.activeItem}>10-Yr Warranty Product</li>
            <li style={S.activeItem}>Review Drive (target 100+)</li>
            <li style={S.activeItem}>Testimonial Library</li>
            <li style={S.activeItem}>$1/day Content Engine</li>
          </ul>
        </div>

        <div style={S.sidebarFooter}>
          {isDemo ? (
            <Link href="/login" style={S.exitDemo}>Exit demo →</Link>
          ) : (
            <span style={S.signedIn}>Signed in as {client.owner_email}</span>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <main style={isMobile ? { ...S.main, ...S.mainMobile } : S.main}>
        {isDemo && (
          <div style={S.demoBanner}>
            <span style={S.demoDot} />
            DEMO MODE · Anonymized client data
            <Link href="/login" style={S.demoLink}>Log in to see your real engagement →</Link>
          </div>
        )}

        {/* HEADER */}
        <header style={S.pageHeader}>
          <div style={S.engagementRibbon}>CLIENT · ENGAGEMENT MONTH 1 OF 9</div>
          <h1 style={S.pageTitle}>
            {client.business_name}{' '}
            <span style={S.cityState}>
              {client.city ? `· ${client.city}` : ''}{client.state ? `, ${client.state}` : ''}
            </span>
          </h1>
        </header>

        {tab === 'overview' && (
          <OverviewTab client={client} phases={phases} daysToExit={daysToExit} overallPct={overallPct} activities={activities} />
        )}
        {tab === 'scale-plan' && (
          <ScalePlanTab phases={phases} tasksByPhase={tasksByPhase} isAdmin={isAdmin} onTaskUpdate={handleTaskUpdate} />
        )}
        {tab === 'documents' && (
          <DocumentsTab client={client} documents={documents} signatures={signatures} isAdmin={isAdmin} />
        )}
        {tab === 'pipeline' && (
          <PipelineTab client={client} />
        )}
        {tab !== 'overview' && tab !== 'scale-plan' && tab !== 'documents' && tab !== 'pipeline' && (
          <ComingSoonTab tab={tab} />
        )}
      </main>
    </div>
  )
}

function OverviewTab({ client, phases = [], daysToExit, overallPct, activities = [] }: {
  client: Client
  phases?: Phase[]
  daysToExit: number
  overallPct: number
  activities?: Activity[]
}) {
  const targetLow = client.exit_target_price_low ?? 0
  const targetHigh = client.exit_target_price_high ?? 0
  const targetText = targetLow && targetHigh
    ? targetLow === targetHigh
      ? fmtMoney(targetLow)
      : `${fmtMoney(targetLow)}–${fmtMoney(targetHigh)}`
    : fmtMoney(targetLow || targetHigh)

  // Compute KPI subtext lines dynamically from client data
  const exitDateStr = client.exit_target_date
    ? new Date(client.exit_target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null
  const monthsToExit = Math.ceil(daysToExit / 30)
  const targetExitSub = exitDateStr && targetLow
    ? `${monthsToExit} months · ${exitDateStr} · floor ${fmtMoney(targetLow)}`
    : exitDateStr ?? undefined
  const daysToExitSub = daysToExit > 180 ? '→ LOI window opens month 7' : daysToExit > 90 ? '↗ CIM drafting underway' : '↗ In LOI / due diligence window'

  // Run-rate target = 1.3x current revenue (path to ~$1M from $770K, etc.)
  const revTarget = client.run_rate_revenue ? Math.round(client.run_rate_revenue * 1.3 / 100000) * 100000 : null
  const revSub = revTarget ? `↗ Target ${fmtMoney(revTarget)} run rate by month 7` : undefined

  // EBITDA target + multiple math
  const ebitdaTarget = client.normalized_ebitda ? Math.round(client.normalized_ebitda * 1.25 / 25000) * 25000 : null
  const targetMult = client.target_multiple ?? null
  const ebitdaSub = ebitdaTarget && targetMult
    ? `→ Target ${fmtMoney(ebitdaTarget)} · ${targetMult}x = ${targetText} exit`
    : undefined

  return (
    <div style={S.tabBody}>
      {/* KPI GRID */}
      <div style={S.kpiGrid}>
        <KpiCard label="Target Exit Price" value={targetText} subtext={targetExitSub} accent />
        <KpiCard label="Days to Exit" value={daysToExit.toString()} subtext={daysToExitSub} />
        <KpiCard label="Run Rate Revenue" value={fmtMoney(client.run_rate_revenue)} subtext={revSub} />
        <KpiCard label="Normalized EBITDA" value={fmtMoney(client.normalized_ebitda)} subtext={ebitdaSub} />
      </div>

      {/* PHASE RIBBON — strategic 9-month story */}
      {phases.length > 0 && <PhaseRibbon phases={phases} />}

      {/* EXIT COUNTDOWN */}
      <section style={S.section}>
        <div style={S.sectionHeader}>
          <h2 style={S.sectionTitle}>Exit Countdown</h2>
          <span style={S.sectionMeta}>Path to {fmtMoney(targetLow || targetHigh)}+ exit</span>
        </div>
        <div style={S.exitGrid}>
          <ExitCard label="Today's As-Is" value={fmtMoney(client.current_fair_market)} sub={`${client.current_multiple ?? '—'}x × ${fmtMoney(client.normalized_ebitda)} EBITDA`} />
          <ExitCard label="Target Exit" value={targetText} sub={`${client.target_multiple ?? '—'}x target multiple`} accent />
          <ExitCard label="Price Lift" value={`+${fmtMoney((targetLow || 0) - (client.current_fair_market || 0))}`} sub="Multiple expansion + EBITDA growth" />
          <ExitCard label="Total Owner Benefit" value={`+${fmtMoney(client.total_owner_benefit)}`} sub="Includes tax structure savings" highlight />
        </div>
      </section>

      {/* OVERALL PROGRESS */}
      <section style={S.section}>
        <div style={S.sectionHeader}>
          <h2 style={S.sectionTitle}>Overall Roadmap Progress</h2>
          <span style={S.sectionMeta}>{overallPct}% complete</span>
        </div>
        <div style={S.progressBar}>
          <div style={{ ...S.progressFill, width: `${overallPct}%` }} />
        </div>
        <p style={S.helperText}>
          Your KB engagement is structured in 3 phases: <strong>Build the Asset</strong> (months 1-3),{' '}
          <strong>Drive the Multiple</strong> (months 4-6), <strong>Package &amp; Sell</strong> (months 7-9). Switch to the{' '}
          <em>Scale Plan</em> tab to see every task and who owns it.
        </p>
      </section>

      {/* ACTIVITY FEED */}
      <ActivityFeed activities={activities ?? []} />
    </div>
  )
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ActivityFeed({ activities }: { activities: Activity[] }) {
  const colorMap: Record<string, string> = {
    doc: 'var(--kb-accent)',
    task: 'var(--kb-green)',
    launch: 'var(--kb-accent)',
    finance: '#d97706',
    deal: 'var(--kb-green)',
    milestone: 'var(--kb-accent)',
  }

  if (activities.length === 0) {
    return (
      <section style={S.section}>
        <div style={S.sectionHeader}>
          <h2 style={S.sectionTitle}>Recent Activity</h2>
        </div>
        <p style={S.helperText}>
          No KB actions logged yet. Activity will appear here as the engagement progresses.
        </p>
      </section>
    )
  }

  return (
    <section style={S.section}>
      <div style={S.sectionHeader}>
        <h2 style={S.sectionTitle}>Recent Activity</h2>
        <span style={S.sectionMeta}>Last {activities.length} KB action{activities.length === 1 ? '' : 's'} on your engagement</span>
      </div>
      <div style={S.activityList}>
        {activities.map(a => (
          <div key={a.id} style={S.activityRow}>
            <div style={{ ...S.activityDot, background: colorMap[a.activity_type ?? 'task'] ?? 'var(--kb-accent)' }} />
            <div style={S.activityBody}>
              <div style={S.activityText}>
                <strong style={{ color: 'var(--kb-text)' }}>{a.who}</strong>{' '}
                <span style={{ color: 'var(--kb-text-secondary)' }}>{a.verb}</span>{' '}
                <span style={{ color: 'var(--kb-text)', fontWeight: 500 }}>{a.what}</span>
              </div>
              <div style={S.activityWhen}>{timeAgo(a.created_at)}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function PhaseRibbon({ phases }: { phases: Phase[] }) {
  return (
    <section style={S.section}>
      <div style={S.sectionHeader}>
        <h2 style={S.sectionTitle}>The 9-Month Engagement</h2>
        <span style={S.sectionMeta}>3 phases · Build → Drive → Sell</span>
      </div>
      <div style={S.ribbonGrid}>
        {phases.map(p => {
          const isCurrent = p.status === 'in_progress'
          const isDone = p.status === 'completed'
          return (
            <div
              key={p.id}
              style={{
                ...S.ribbonCard,
                ...(isCurrent ? S.ribbonCardCurrent : {}),
                ...(isDone ? S.ribbonCardDone : {}),
              }}
            >
              <div style={{ ...S.ribbonEyebrow, color: isCurrent ? 'var(--kb-accent)' : isDone ? 'var(--kb-green)' : 'var(--kb-text-muted)' }}>
                Phase {p.phase_number}{isCurrent ? ' · CURRENT' : isDone ? ' · DONE' : ''} · MONTHS {(p.phase_number - 1) * 3 + 1}-{p.phase_number * 3}
              </div>
              <div style={S.ribbonName}>{p.name}</div>
              {p.tagline && <div style={S.ribbonTagline}>{p.tagline}</div>}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function ScalePlanTab({ phases, tasksByPhase, isAdmin, onTaskUpdate }: { phases: Phase[]; tasksByPhase: Record<string, Task[]>; isAdmin?: boolean; onTaskUpdate?: (id: string, status: string) => void }) {
  return (
    <div style={S.tabBody}>
      <p style={{ ...S.helperText, margin: '0 0 8px' }}>
        Every task below has an owner and a due date. KB updates status in real time as the engagement executes.
      </p>
      {phases.map(p => {
        const phaseTasks = tasksByPhase[p.id] ?? []
        const pct = pctComplete(phaseTasks)
        return (
          <section key={p.id} style={S.section}>
            <div style={S.phaseHeader}>
              <div>
                <div style={S.phaseEyebrow}>
                  PHASE {p.phase_number} · {p.status === 'in_progress' ? 'CURRENT' : (p.status?.toUpperCase() ?? 'PENDING')} · MONTHS {(p.phase_number - 1) * 3 + 1}-{p.phase_number * 3}
                </div>
                <h2 style={S.phaseTitle}>{p.name}</h2>
                {p.tagline && <p style={S.phaseTagline}>{p.tagline}</p>}
              </div>
              <div style={S.phasePct}>{pct}%</div>
            </div>
            <div style={S.taskList}>
              {phaseTasks.map(t => <TaskRow key={t.id} task={t} isAdmin={isAdmin} onUpdate={onTaskUpdate} />)}
              {phaseTasks.length === 0 && <div style={S.emptyTasks}>No tasks in this phase yet.</div>}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function TaskRow({ task, isAdmin, onUpdate }: { task: Task; isAdmin?: boolean; onUpdate?: (id: string, status: string) => void }) {
  const isDone = task.status === 'completed' || task.status === 'done'
  const isInProgress = task.status === 'in_progress'

  const handleClick = async () => {
    if (!isAdmin || !onUpdate) return
    // Cycle: pending → in_progress → completed → pending
    const next = isDone ? 'pending' : isInProgress ? 'completed' : 'in_progress'
    onUpdate(task.id, next)
  }

  return (
    <div style={{ ...S.task, ...(isDone ? S.taskDone : {}) }}>
      <button
        onClick={handleClick}
        disabled={!isAdmin}
        title={isAdmin ? 'Click to cycle status' : undefined}
        style={{
          ...S.taskCheck,
          ...(isDone ? S.taskCheckDone : isInProgress ? S.taskCheckProgress : {}),
          cursor: isAdmin ? 'pointer' : 'default',
          padding: 0,
          fontFamily: 'inherit',
        }}
      >
        {isDone ? '✓' : isInProgress ? '●' : ''}
      </button>
      <div style={S.taskBody}>
        <div style={S.taskTitle}>{task.title}</div>
        <div style={S.taskMeta}>
          {task.owner && <span style={S.taskOwner}>{task.owner}</span>}
          {task.due_date && (
            <span style={S.taskDue}>
              Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {task.category && <span style={S.taskCat}>{task.category}</span>}
          {task.priority === 'high' && <span style={S.taskPriority}>HIGH</span>}
        </div>
      </div>
      <div style={S.taskStatus}>
        {isDone ? 'Done' : isInProgress ? 'In Progress' : 'Pending'}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// DOCUMENTS TAB
// ════════════════════════════════════════════════════════════════

const DOC_GROUP_META: Record<string, string> = {
  'Tax Returns': '3-year requirement · Federal returns + state returns + supporting schedules',
  'P&L Statements': '3 years · monthly + annual rollup · normalization in progress',
  'Bank Statements': '3 years · operating + payroll accounts · for QoE reconciliation',
  'Operating Documents': 'Articles of incorporation, lease, insurance, HR, compliance',
  'Engagement Outputs': 'KB-prepared deliverables. Auto-uploaded as we produce them.',
}

function DocumentsTab({ client, documents, signatures = [], isAdmin }: { client: Client; documents: Document[]; signatures?: SignatureRequest[]; isAdmin?: boolean }) {
  const [uploading, setUploading] = useState(false)
  const [uploadGroup, setUploadGroup] = useState<string | null>(null)

  // Group documents by doc_group
  const grouped: Record<string, Document[]> = {}
  for (const g of Object.keys(DOC_GROUP_META)) grouped[g] = []
  for (const d of documents) {
    if (!grouped[d.doc_group]) grouped[d.doc_group] = []
    grouped[d.doc_group].push(d)
  }

  const totalDocs = documents.length
  const uploaded = documents.filter(d => d.status === 'uploaded').length
  const pct = totalDocs > 0 ? Math.round((uploaded / totalDocs) * 100) : 0

  const handleFilePick = async (group: string, files: FileList | null) => {
    if (!files || files.length === 0 || !isAdmin) return
    setUploading(true)
    setUploadGroup(group)
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('client_slug', client.slug)
      fd.append('doc_group', group)
      fd.append('name', file.name)
      try {
        await fetch('/api/portal/documents', { method: 'POST', body: fd })
      } catch (e) {
        console.error('Upload failed', e)
      }
    }
    setUploading(false)
    setUploadGroup(null)
    // Refresh page to show new docs
    if (typeof window !== 'undefined') window.location.reload()
  }

  return (
    <div style={S.tabBody}>
      {/* Documents to Sign — DocuSeal */}
      {signatures.length > 0 && <SignaturesSection signatures={signatures} />}

      {/* Upload zone */}
      <section style={{ ...S.section, padding: 'clamp(24px, 4vw, 32px)' }}>
        <div style={S.sectionHeader}>
          <h2 style={S.sectionTitle}>Document Vault</h2>
          <span style={S.sectionMeta}>{uploaded}/{totalDocs} uploaded · {pct}% complete</span>
        </div>
        <label
          htmlFor="upload-general"
          style={{ ...S.uploadZone, cursor: isAdmin ? 'pointer' : 'default', opacity: isAdmin ? 1 : 0.6 }}
        >
          <div style={S.uploadIcon}>↑</div>
          <div style={S.uploadHeading}>
            {uploading ? 'Uploading…' : isAdmin ? 'Click to browse, drop files, or pick a category below' : 'Document uploads are admin-only'}
          </div>
          <div style={S.uploadHint}>PDFs, images, Excel, Word — encrypted at rest. Files land in &quot;Operating Documents&quot; unless picked otherwise.</div>
          {isAdmin && (
            <input
              id="upload-general"
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleFilePick('Operating Documents', e.target.files)}
            />
          )}
        </label>
        <div style={S.progressBar}>
          <div style={{ ...S.progressFill, width: `${pct}%` }} />
        </div>
        <p style={S.helperText}>
          Every document uploaded is encrypted and tied to this client. Tax returns, P&amp;Ls, and bank statements get normalized into a buyer-ready financial package by KB&apos;s CPA partner.
        </p>
      </section>

      {/* Grouped doc list */}
      {Object.entries(DOC_GROUP_META).map(([title, meta]) => {
        const docs = grouped[title] ?? []
        const groupUploaded = docs.filter(d => d.status === 'uploaded').length
        return (
          <section key={title} style={S.section}>
            <div style={S.sectionHeader}>
              <h2 style={S.sectionTitle}>{title}</h2>
              <span style={S.sectionMeta}>{groupUploaded}/{docs.length} uploaded</span>
            </div>
            <p style={{ ...S.helperText, marginTop: 0, marginBottom: 14 }}>{meta}</p>
            <div style={S.docList}>
              {docs.length === 0 && <div style={S.emptyTasks}>No documents in this category yet.</div>}
              {docs.map(doc => <DocRow key={doc.id} doc={doc} />)}
            </div>
            {isAdmin && (
              <label
                htmlFor={`upload-${title}`}
                style={{
                  display: 'inline-block',
                  marginTop: 12,
                  padding: '8px 18px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--kb-accent)',
                  background: 'var(--kb-accent-dim)',
                  border: '1px solid var(--kb-accent-border)',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                {uploading && uploadGroup === title ? 'Uploading…' : `+ Upload to ${title}`}
                <input
                  id={`upload-${title}`}
                  type="file"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => handleFilePick(title, e.target.files)}
                />
              </label>
            )}
          </section>
        )
      })}
    </div>
  )
}

function SignaturesSection({ signatures }: { signatures: SignatureRequest[] }) {
  const completed = signatures.filter(s => s.status === 'completed').length
  const pending = signatures.filter(s => ['sent', 'in_progress', 'draft'].includes(s.status)).length

  const statusInfo = (s: string) => {
    switch (s) {
      case 'completed': return { label: 'Signed', color: 'var(--kb-green)', bg: 'rgba(46,204,139,0.10)' }
      case 'in_progress': return { label: 'In Progress', color: 'var(--kb-accent)', bg: 'var(--kb-accent-dim)' }
      case 'sent': return { label: 'Sent', color: 'var(--kb-accent)', bg: 'var(--kb-accent-dim)' }
      case 'declined': return { label: 'Declined', color: '#dc2626', bg: 'rgba(220,38,38,0.08)' }
      case 'expired': return { label: 'Expired', color: 'var(--kb-text-muted)', bg: 'var(--kb-bg-raised)' }
      default: return { label: 'Draft', color: 'var(--kb-text-secondary)', bg: 'var(--kb-bg-raised)' }
    }
  }

  return (
    <section style={S.section}>
      <div style={S.sectionHeader}>
        <h2 style={S.sectionTitle}>Documents to Sign</h2>
        <span style={S.sectionMeta}>
          {completed} signed · {pending} pending
        </span>
      </div>
      <p style={{ ...S.helperText, marginTop: 0, marginBottom: 14 }}>
        Powered by DocuSeal. KB-branded signing flow with audit trail per document.
        When KB sends you a document for signature, it appears here. Click to sign in your browser — no app, no account needed on your end.
      </p>

      <div style={S.docList}>
        {signatures.map(sig => {
          const info = statusInfo(sig.status)
          const totalSigners = sig.signers?.length ?? 0
          const signedCount = sig.signers?.filter(x => x.status === 'completed' || x.status === 'signed').length ?? 0
          const pendingSigner = sig.signers?.find(x => x.status === 'awaiting' || x.status === 'pending' || x.status === 'opened')

          return (
            <div key={sig.id} style={{ ...S.task, alignItems: 'flex-start' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 6, flexShrink: 0,
                background: info.bg, color: info.color, border: `1.5px solid ${info.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700,
              }}>
                {sig.status === 'completed' ? '✓' : sig.status === 'declined' ? '✕' : '✎'}
              </div>
              <div style={S.taskBody}>
                <div style={S.taskTitle}>{sig.document_name}</div>
                <div style={S.taskMeta}>
                  <span style={S.taskOwner}>{signedCount}/{totalSigners} signed</span>
                  {sig.document_type && <span style={S.taskCat}>{sig.document_type}</span>}
                  {sig.sent_at && (
                    <span style={S.taskDue}>
                      Sent {new Date(sig.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                  {sig.completed_at && (
                    <span style={S.taskDue}>
                      Signed {new Date(sig.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                  {pendingSigner && (
                    <span style={{ color: 'var(--kb-accent)', fontWeight: 500 }}>
                      Waiting on {pendingSigner.name ?? pendingSigner.email}
                    </span>
                  )}
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {pendingSigner?.embed_src && (
                    <a
                      href={pendingSigner.embed_src}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '6px 14px',
                        background: 'var(--kb-accent)',
                        color: 'var(--kb-bg)',
                        textDecoration: 'none',
                        borderRadius: 5,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Sign Now →
                    </a>
                  )}
                  {sig.docuseal_audit_url && (
                    <a
                      href={sig.docuseal_audit_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '6px 14px',
                        background: 'transparent',
                        color: 'var(--kb-text-secondary)',
                        textDecoration: 'none',
                        borderRadius: 5,
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        border: '1px solid var(--kb-border)',
                      }}
                    >
                      Audit Trail
                    </a>
                  )}
                </div>
              </div>
              <div
                style={{
                  ...S.taskStatus,
                  color: info.color,
                  background: info.bg,
                  padding: '3px 10px',
                  borderRadius: 100,
                  fontSize: 10,
                  fontWeight: 700,
                  border: `1px solid ${info.color}`,
                }}
              >
                {info.label}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function DocRow({ doc }: { doc: Document }) {
  const statusColor = doc.status === 'uploaded' ? 'var(--kb-green)' : doc.status === 'processing' ? 'var(--kb-accent)' : 'var(--kb-text-muted)'
  const statusBg = doc.status === 'uploaded' ? 'rgba(5,150,105,0.1)' : doc.status === 'processing' ? 'var(--kb-accent-dim)' : 'var(--kb-bg-raised)'
  const statusLabel = doc.status === 'uploaded' ? 'Uploaded' : doc.status === 'processing' ? 'Processing…' : 'Pending'
  const icon = doc.status === 'uploaded' ? '✓' : doc.status === 'processing' ? '↻' : '○'

  return (
    <div style={S.docRow}>
      <div style={{ ...S.docIcon, background: statusBg, color: statusColor, borderColor: statusColor }}>
        <span>{icon}</span>
      </div>
      <div style={S.docBody}>
        <div style={S.docName}>{doc.name}</div>
        {doc.meta && <div style={S.docMeta}>{doc.meta}</div>}
      </div>
      <div style={{ ...S.docStatus, color: statusColor }}>{statusLabel}</div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// PIPELINE TAB (buyer matching engine)
// ════════════════════════════════════════════════════════════════

type Buyer = {
  firm: string
  type: 'Family Office' | 'PE Platform' | 'Strategic' | 'Search Fund' | 'Independent Sponsor'
  geo: string
  matchScore: number
  dealRange: string
  fitNotes: string
  status: 'Identified' | 'Outreach Sent' | 'NDA Signed' | 'LOI Received' | 'Passed'
}

const BUYERS: Buyer[] = [
  {
    firm: 'Comfort Systems USA (NYSE: FIX)',
    type: 'Strategic',
    geo: 'National (DMV active)',
    matchScore: 94,
    dealRange: '$5M-$50M',
    fitNotes: 'Largest national MEP roll-up. ~$5B revenue. Acquires regional specialty MEP firms at 5-7x EBITDA. Has appetite for trades operators with MBE/DBE certifications.',
    status: 'Identified',
  },
  {
    firm: 'Meriton LLC',
    type: 'PE Platform',
    geo: 'TX (HQ Irving) + 13 states',
    matchScore: 91,
    dealRange: '$5M-$50M',
    fitNotes: 'PE-backed HVAC roll-up — 10 portfolio companies, $380M consolidated rev. CEO Jerry Braun on Catholic Charities Dallas board (faith-aligned KB connection).',
    status: 'Outreach Sent',
  },
  {
    firm: 'Avance Investment Management',
    type: 'PE Platform',
    geo: 'National',
    matchScore: 87,
    dealRange: '$3M-$25M',
    fitNotes: 'Trades roll-up specialist. Known to bid on quality MEP/specialty contractors with clean financials. Sophisticated on add-backs.',
    status: 'NDA Signed',
  },
  {
    firm: 'Trilantic North America',
    type: 'PE Platform',
    geo: 'NYC + national',
    matchScore: 85,
    dealRange: '$10M-$100M',
    fitNotes: 'Construction services investments. Charles Ayres, Christopher Manning. Family-office capital, patient. Pays premiums for clean MBE-eligible firms.',
    status: 'Identified',
  },
  {
    firm: 'Mona Electric Group (DMV regional)',
    type: 'Strategic',
    geo: 'DC/MD/VA',
    matchScore: 82,
    dealRange: '$3M-$15M',
    fitNotes: 'Successor to Truland Group personnel. Active acquirer of DMV electrical capacity. Quick close, less DD intensity.',
    status: 'Outreach Sent',
  },
  {
    firm: 'Branford Castle Partners',
    type: 'PE Platform',
    geo: 'Lower middle-market national',
    matchScore: 78,
    dealRange: '$5M-$30M',
    fitNotes: 'Specialty contractors a focus. Eric Korsten, John Castle. Pays fair multiples; minimal earn-outs.',
    status: 'Identified',
  },
  {
    firm: 'Limbach Holdings (NASDAQ: LMB)',
    type: 'Strategic',
    geo: 'National, DMV-active',
    matchScore: 76,
    dealRange: '$5M-$25M',
    fitNotes: 'Specialty MEP, ~$500M revenue, acquisitive. Public co — visibility on multiples. Charles Bacon III, CEO.',
    status: 'Identified',
  },
  {
    firm: 'Riverside Company',
    type: 'PE Platform',
    geo: 'Atlanta + national',
    matchScore: 73,
    dealRange: '$10M-$75M',
    fitNotes: 'Has specialty trade portfolio. Slower process but strong reputation. Typically platform investments; bolt-on if right fit.',
    status: 'Identified',
  },
  {
    firm: 'Power Design',
    type: 'Strategic',
    geo: 'St. Petersburg FL + DMV',
    matchScore: 71,
    dealRange: '$5M-$30M',
    fitNotes: 'Specialty electrical contractor, $1B+ revenue, federal-focused. Mitch Permuy, CEO. NADCAP overlap with our certifications.',
    status: 'Passed',
  },
]

function PipelineTab({ client }: { client: Client }) {
  void client
  const total = BUYERS.length
  const counts = {
    identified: BUYERS.filter(b => b.status === 'Identified').length,
    outreach: BUYERS.filter(b => b.status === 'Outreach Sent').length,
    nda: BUYERS.filter(b => b.status === 'NDA Signed').length,
    loi: BUYERS.filter(b => b.status === 'LOI Received').length,
    passed: BUYERS.filter(b => b.status === 'Passed').length,
  }
  const active = total - counts.passed
  const sorted = [...BUYERS].sort((a, b) => b.matchScore - a.matchScore)

  return (
    <div style={S.tabBody}>
      {/* Top stats */}
      <section style={S.section}>
        <div style={S.sectionHeader}>
          <h2 style={S.sectionTitle}>Buyer Pipeline</h2>
          <span style={S.sectionMeta}>{active} active · {total} total identified</span>
        </div>
        <div style={S.pipelineStats}>
          <PipelineStat label="Identified" count={counts.identified} dotColor="var(--kb-text-muted)" />
          <PipelineStat label="Outreach Sent" count={counts.outreach} dotColor="var(--kb-accent)" />
          <PipelineStat label="NDA Signed" count={counts.nda} dotColor="#fbbf24" highlight />
          <PipelineStat label="LOI Received" count={counts.loi} dotColor="var(--kb-green)" highlight />
          <PipelineStat label="Passed" count={counts.passed} dotColor="var(--kb-text-muted)" muted />
        </div>
        <p style={S.helperText}>
          KB&apos;s AI buyer-matching engine surfaces qualified acquirers across 5 categories: national strategics, regional consolidators, PE-backed roll-ups, MBE/DBE buyers, and strategic data-center primes. Match scores are calibrated on industry, deal size, geographic fit, and historical bid behavior.
        </p>
      </section>

      {/* Buyer cards */}
      <section style={S.section}>
        <div style={S.sectionHeader}>
          <h2 style={S.sectionTitle}>Top Matches</h2>
          <span style={S.sectionMeta}>Sorted by match score</span>
        </div>
        <div style={S.buyerGrid}>
          {sorted.map(b => <BuyerCard key={b.firm} buyer={b} />)}
        </div>
      </section>
    </div>
  )
}

function PipelineStat({ label, count, dotColor, highlight, muted }: { label: string; count: number; dotColor: string; highlight?: boolean; muted?: boolean }) {
  return (
    <div style={{ ...S.pipelineStat, ...(highlight ? S.pipelineStatHighlight : {}), ...(muted ? S.pipelineStatMuted : {}) }}>
      <div style={S.pipelineStatLabel}>
        <span style={{ ...S.pipelineStatDot, background: dotColor }} />
        {label}
      </div>
      <div style={S.pipelineStatCount}>{count}</div>
    </div>
  )
}

function BuyerCard({ buyer }: { buyer: Buyer }) {
  const statusStyle = (() => {
    switch (buyer.status) {
      case 'LOI Received': return { bg: 'rgba(5,150,105,0.12)', color: 'var(--kb-green)', label: 'LOI Received' }
      case 'NDA Signed':   return { bg: 'rgba(251,191,36,0.12)', color: '#d97706', label: 'NDA Signed' }
      case 'Outreach Sent': return { bg: 'var(--kb-accent-dim)', color: 'var(--kb-accent)', label: 'Outreach Sent' }
      case 'Passed':       return { bg: 'var(--kb-bg-raised)', color: 'var(--kb-text-muted)', label: 'Passed' }
      default:             return { bg: 'var(--kb-bg-raised)', color: 'var(--kb-text-secondary)', label: 'Identified' }
    }
  })()

  return (
    <div style={S.buyerCard}>
      <div style={S.buyerHeader}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={S.buyerType}>{buyer.type}</div>
          <h3 style={S.buyerFirm}>{buyer.firm}</h3>
          <div style={S.buyerGeo}>{buyer.geo}</div>
        </div>
        <div style={S.buyerScore}>
          <div style={S.buyerScoreNum}>{buyer.matchScore}</div>
          <div style={S.buyerScoreLabel}>match</div>
        </div>
      </div>
      <p style={S.buyerNotes}>{buyer.fitNotes}</p>
      <div style={S.buyerFooter}>
        <span style={S.buyerDealRange}>{buyer.dealRange}</span>
        <span style={{ ...S.buyerStatusBadge, background: statusStyle.bg, color: statusStyle.color }}>{statusStyle.label}</span>
      </div>
    </div>
  )
}

function ComingSoonTab({ tab }: { tab: string }) {
  const labels: Record<string, string> = {
    financials: 'Financial Analysis',
    marketing: 'Marketing Engine',
    pipeline: 'Buyer Pipeline',
    acquisition: 'Acquisition Targets',
    documents: 'Document Vault',
    charity: 'Charity Allocation',
  }
  return (
    <div style={S.tabBody}>
      <section style={{ ...S.section, textAlign: 'center', padding: '64px 24px' }}>
        <div style={{ fontSize: 36, color: 'var(--kb-accent)', marginBottom: 16, fontFamily: '"Playfair Display", Georgia, serif' }}>◯</div>
        <h2 style={S.sectionTitle}>{labels[tab] ?? 'Coming Soon'}</h2>
        <p style={S.helperText}>
          This section is being built into the live portal next. For now, your engagement data lives in the Overview and Scale Plan tabs.
        </p>
      </section>
    </div>
  )
}

function KpiCard({ label, value, subtext, accent }: { label: string; value: string; subtext?: string; accent?: boolean }) {
  return (
    <div style={{ ...S.kpi, ...(accent ? S.kpiAccent : {}) }}>
      <div style={S.kpiLabel}>{label}</div>
      <div style={{ ...S.kpiValue, ...(accent ? S.kpiValueAccent : {}) }}>{value}</div>
      {subtext && <div style={S.kpiSub}>{subtext}</div>}
    </div>
  )
}

function ExitCard({ label, value, sub, accent, highlight }: { label: string; value: string; sub?: string; accent?: boolean; highlight?: boolean }) {
  return (
    <div style={{ ...S.exitCard, ...(accent ? S.exitCardAccent : {}), ...(highlight ? S.exitCardHighlight : {}) }}>
      <div style={S.exitLabel}>{label}</div>
      <div style={S.exitValue}>{value}</div>
      {sub && <div style={S.exitSub}>{sub}</div>}
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  app: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--kb-bg)',
    color: 'var(--kb-text)',
    fontFamily: 'Inter, -apple-system, sans-serif',
  },
  appMobile: {
    display: 'block',
    minHeight: '100vh',
    background: 'var(--kb-bg)',
    color: 'var(--kb-text)',
    fontFamily: 'Inter, -apple-system, sans-serif',
  },
  mobileTopBar: {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'var(--kb-sidebar-bg, var(--kb-bg-panel))',
    borderBottom: '1px solid var(--kb-border)',
    height: 56,
  },
  mobileTopLogo: { height: 28, width: 'auto' },
  mobileMenuButton: {
    background: 'transparent',
    border: '1px solid var(--kb-border)',
    color: 'var(--kb-text)',
    fontSize: 18,
    width: 36,
    height: 36,
    borderRadius: 6,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  sidebarMobile: {
    position: 'fixed',
    top: 56,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: 'auto',
    transform: 'translateX(-100%)',
    transition: 'transform 0.25s ease',
    zIndex: 40,
    overflowY: 'auto',
  },
  sidebarMobileOpen: { transform: 'translateX(0)' },
  mainMobile: { padding: '20px 18px 64px' },
  sidebar: {
    width: 256,
    flexShrink: 0,
    background: 'var(--kb-sidebar-bg, var(--kb-bg-panel))',
    borderRight: '1px solid var(--kb-sidebar-border, var(--kb-border))',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  brand: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--kb-border-subtle, var(--kb-border))' },
  logo: { width: '70%', maxWidth: 160, height: 'auto', display: 'block' },
  brandPortal: { fontFamily: '"DM Mono", monospace', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--kb-text-muted)' },
  ownerBlock: { padding: '14px 14px', background: 'var(--kb-accent-dim)', border: '1px solid var(--kb-accent-border)', borderRadius: 8, marginBottom: 24 },
  ownerName: { fontSize: 14, fontWeight: 700, color: 'var(--kb-text)', marginBottom: 2 },
  ownerCo: { fontSize: 11, color: 'var(--kb-text-secondary)' },
  navGroupLabel: { fontSize: 9, letterSpacing: '0.18em', color: 'var(--kb-text-muted)', marginBottom: 8, padding: '0 12px', fontFamily: '"DM Mono", monospace' },
  nav: { display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 28 },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 14px',
    background: 'transparent',
    border: 'none',
    color: 'var(--kb-text-secondary)',
    fontSize: 13,
    fontWeight: 500,
    borderRadius: 6,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
  },
  navItemActive: {
    background: 'var(--kb-sidebar-active, var(--kb-accent-dim))',
    color: 'var(--kb-accent)',
    fontWeight: 600,
  },
  activePrograms: { padding: '14px 14px', background: 'var(--kb-bg-raised)', borderRadius: 8, marginTop: 'auto', marginBottom: 12, border: '1px solid var(--kb-border-subtle, var(--kb-border))' },
  activeLabel: { fontSize: 9, letterSpacing: '0.18em', color: 'var(--kb-text-muted)', marginBottom: 8, fontFamily: '"DM Mono", monospace', textTransform: 'uppercase' },
  activeList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 5 },
  activeItem: { fontSize: 11, color: 'var(--kb-text-secondary)' },
  sidebarFooter: { padding: '12px 8px', fontSize: 11, color: 'var(--kb-text-muted)', borderTop: '1px solid var(--kb-border-subtle, var(--kb-border))' },
  exitDemo: { color: 'var(--kb-accent)', textDecoration: 'none', fontWeight: 600 },
  signedIn: {},
  main: { flex: 1, padding: '36px 44px', minWidth: 0 },
  demoBanner: {
    background: 'var(--kb-accent-dim)',
    border: '1px solid var(--kb-accent-border)',
    borderRadius: 8,
    padding: '11px 16px',
    marginBottom: 24,
    fontSize: 12,
    color: 'var(--kb-accent)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontWeight: 500,
  },
  demoDot: { width: 6, height: 6, borderRadius: '50%', background: 'var(--kb-accent)', display: 'inline-block' },
  demoLink: { color: 'var(--kb-accent)', fontWeight: 700, marginLeft: 'auto', textDecoration: 'underline' },
  pageHeader: { marginBottom: 28, paddingBottom: 18, borderBottom: '1px solid var(--kb-border)' },
  engagementRibbon: {
    display: 'inline-block',
    fontSize: 10,
    letterSpacing: '0.18em',
    color: 'var(--kb-accent)',
    background: 'var(--kb-accent-dim)',
    border: '1px solid var(--kb-accent-border)',
    padding: '4px 12px',
    borderRadius: 100,
    marginBottom: 14,
    fontFamily: '"DM Mono", monospace',
    fontWeight: 700,
  },
  pageTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: 'clamp(22px, 5vw, 32px)',
    fontWeight: 700,
    color: 'var(--kb-text)',
    margin: 0,
    letterSpacing: '-0.01em',
    lineHeight: 1.15,
  },
  cityState: { fontSize: 'clamp(16px, 3vw, 22px)', color: 'var(--kb-text-secondary)', fontWeight: 400, fontStyle: 'italic' },
  tabBody: { display: 'flex', flexDirection: 'column', gap: 24 },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 },
  kpi: {
    background: 'var(--kb-bg-card, var(--kb-bg-panel))',
    border: '1px solid var(--kb-border)',
    borderRadius: 12,
    padding: '20px 22px',
    boxShadow: 'var(--kb-shadow-1, 0 1px 3px rgba(0,0,0,0.04))',
  },
  kpiAccent: {
    background: 'var(--kb-accent-dim)',
    borderColor: 'var(--kb-accent-border)',
  },
  kpiLabel: {
    fontSize: 10,
    letterSpacing: '0.18em',
    color: 'var(--kb-text-muted)',
    marginBottom: 10,
    textTransform: 'uppercase',
    fontFamily: '"DM Mono", monospace',
    fontWeight: 600,
  },
  kpiValue: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: 'clamp(22px, 4vw, 28px)',
    fontWeight: 700,
    color: 'var(--kb-text)',
    lineHeight: 1.1,
  },
  kpiValueAccent: { color: 'var(--kb-accent)' },
  kpiSub: { fontSize: 11, color: 'var(--kb-text-muted)', marginTop: 6 },
  section: {
    background: 'var(--kb-bg-panel)',
    border: '1px solid var(--kb-border)',
    borderRadius: 12,
    padding: 'clamp(18px, 3vw, 28px)',
    boxShadow: 'var(--kb-shadow-1, 0 1px 3px rgba(0,0,0,0.04))',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottom: '1px solid var(--kb-border-subtle, var(--kb-border))',
  },
  sectionTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--kb-text)',
    margin: 0,
  },
  sectionMeta: { fontSize: 11, color: 'var(--kb-text-muted)', fontFamily: '"DM Mono", monospace', letterSpacing: '0.06em', fontWeight: 500 },
  exitGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 },
  exitCard: {
    background: 'var(--kb-bg-raised)',
    border: '1px solid var(--kb-border)',
    borderRadius: 8,
    padding: '16px 18px',
  },
  exitCardAccent: {
    background: 'var(--kb-accent-dim)',
    borderColor: 'var(--kb-accent-border)',
  },
  exitCardHighlight: {
    background: 'rgba(5,150,105,0.08)',
    borderColor: 'rgba(5,150,105,0.25)',
  },
  exitLabel: {
    fontSize: 10,
    letterSpacing: '0.16em',
    color: 'var(--kb-text-muted)',
    marginBottom: 6,
    fontFamily: '"DM Mono", monospace',
    textTransform: 'uppercase',
    fontWeight: 600,
  },
  exitValue: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--kb-text)',
  },
  exitSub: { fontSize: 11, color: 'var(--kb-text-muted)', marginTop: 4 },
  progressBar: { height: 8, background: 'var(--kb-bg-raised)', borderRadius: 100, overflow: 'hidden', border: '1px solid var(--kb-border-subtle, var(--kb-border))' },
  progressFill: { height: '100%', background: 'var(--kb-accent)', transition: 'width 0.5s ease' },
  helperText: { fontSize: 13, color: 'var(--kb-text-secondary)', lineHeight: 1.7, marginTop: 14 },
  phaseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
    paddingBottom: 14,
    borderBottom: '1px solid var(--kb-border-subtle, var(--kb-border))',
  },
  phaseEyebrow: {
    fontSize: 10,
    letterSpacing: '0.18em',
    color: 'var(--kb-accent)',
    fontFamily: '"DM Mono", monospace',
    marginBottom: 8,
    fontWeight: 700,
  },
  phaseTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: 24,
    fontWeight: 700,
    color: 'var(--kb-text)',
    margin: 0,
  },
  phaseTagline: { fontSize: 13, color: 'var(--kb-text-secondary)', marginTop: 4, fontStyle: 'italic' },
  phasePct: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: 36,
    fontWeight: 700,
    color: 'var(--kb-accent)',
    lineHeight: 1,
  },
  taskList: { display: 'flex', flexDirection: 'column', gap: 6 },
  task: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    padding: '12px 16px',
    background: 'var(--kb-bg-raised)',
    border: '1px solid var(--kb-border-subtle, var(--kb-border))',
    borderRadius: 8,
    transition: 'background 0.15s',
  },
  taskDone: { opacity: 0.55 },
  taskCheck: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    border: '1.5px solid var(--kb-border)',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    color: 'transparent',
    marginTop: 2,
    background: 'var(--kb-bg-panel)',
  },
  taskCheckDone: { background: 'var(--kb-green)', borderColor: 'var(--kb-green)', color: '#fff' },
  taskCheckProgress: { background: 'transparent', borderColor: 'var(--kb-accent)', color: 'var(--kb-accent)' },
  taskBody: { flex: 1, minWidth: 0 },
  taskTitle: { fontSize: 13.5, color: 'var(--kb-text)', fontWeight: 500, lineHeight: 1.5 },
  taskMeta: { display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 6, fontSize: 11, color: 'var(--kb-text-muted)' },
  taskOwner: { color: 'var(--kb-text-secondary)', fontWeight: 600 },
  taskDue: {},
  taskCat: { fontFamily: '"DM Mono", monospace', letterSpacing: '0.04em', textTransform: 'uppercase' },
  taskPriority: { color: 'var(--kb-accent)', fontWeight: 700, fontSize: 9, letterSpacing: '0.18em', fontFamily: '"DM Mono", monospace' },
  taskStatus: { fontSize: 11, color: 'var(--kb-text-muted)', flexShrink: 0, fontFamily: '"DM Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 },
  emptyTasks: { padding: '20px 14px', textAlign: 'center', fontSize: 12, color: 'var(--kb-text-muted)' },

  // ── Phase ribbon ───────────────────────────────
  ribbonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 14,
  },
  ribbonCard: {
    padding: '18px 20px',
    background: 'var(--kb-bg-raised)',
    border: '1px solid var(--kb-border)',
    borderRadius: 10,
    position: 'relative',
    transition: 'all 0.15s',
  },
  ribbonCardCurrent: {
    background: 'var(--kb-accent-dim)',
    borderColor: 'var(--kb-accent-border)',
    boxShadow: 'var(--kb-shadow-1, 0 1px 3px rgba(0,0,0,0.04))',
  },
  ribbonCardDone: {
    background: 'rgba(5,150,105,0.06)',
    borderColor: 'rgba(5,150,105,0.25)',
  },
  ribbonEyebrow: {
    fontFamily: '"DM Mono", monospace',
    fontSize: 9,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    fontWeight: 700,
    marginBottom: 8,
  },
  ribbonName: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--kb-text)',
    marginBottom: 6,
    lineHeight: 1.25,
  },
  ribbonTagline: {
    fontSize: 12.5,
    color: 'var(--kb-text-secondary)',
    lineHeight: 1.55,
  },

  // ── Activity feed ──────────────────────────────
  activityList: { display: 'flex', flexDirection: 'column', gap: 14 },
  activityRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    paddingBottom: 12,
    borderBottom: '1px solid var(--kb-border-subtle, var(--kb-border))',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: 6,
  },
  activityBody: { flex: 1, minWidth: 0 },
  activityText: { fontSize: 13, color: 'var(--kb-text-secondary)', lineHeight: 1.55 },
  activityWhen: {
    fontSize: 11,
    color: 'var(--kb-text-muted)',
    marginTop: 4,
    fontFamily: '"DM Mono", monospace',
    letterSpacing: '0.04em',
  },

  // ── Documents tab ──────────────────────────────
  uploadZone: {
    border: '2px dashed var(--kb-border)',
    borderRadius: 12,
    padding: '32px 24px',
    textAlign: 'center',
    background: 'var(--kb-bg-raised)',
    marginBottom: 16,
  },
  uploadIcon: {
    fontSize: 32,
    color: 'var(--kb-accent)',
    marginBottom: 10,
    fontFamily: '"Playfair Display", Georgia, serif',
    fontWeight: 700,
  },
  uploadHeading: { fontSize: 15, fontWeight: 600, color: 'var(--kb-text)', marginBottom: 4 },
  uploadHint: { fontSize: 12, color: 'var(--kb-text-secondary)', marginBottom: 14 },
  uploadButton: {
    padding: '10px 24px',
    background: 'var(--kb-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  docList: { display: 'flex', flexDirection: 'column', gap: 6 },
  docRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '12px 16px',
    background: 'var(--kb-bg-raised)',
    border: '1px solid var(--kb-border-subtle, var(--kb-border))',
    borderRadius: 8,
  },
  docIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    border: '1.5px solid',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 14,
  },
  docBody: { flex: 1, minWidth: 0 },
  docName: { fontSize: 13.5, color: 'var(--kb-text)', fontWeight: 500, lineHeight: 1.4 },
  docMeta: { fontSize: 11, color: 'var(--kb-text-muted)', marginTop: 3 },
  docStatus: {
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
    fontFamily: '"DM Mono", monospace',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },

  // ── Pipeline tab ───────────────────────────────
  pipelineStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 10,
    marginBottom: 8,
  },
  pipelineStat: {
    background: 'var(--kb-bg-raised)',
    border: '1px solid var(--kb-border)',
    borderRadius: 8,
    padding: '14px 16px',
  },
  pipelineStatHighlight: {
    background: 'var(--kb-accent-dim)',
    borderColor: 'var(--kb-accent-border)',
  },
  pipelineStatMuted: { opacity: 0.6 },
  pipelineStatLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 11,
    color: 'var(--kb-text-secondary)',
    fontFamily: '"DM Mono", monospace',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    fontWeight: 600,
    marginBottom: 8,
  },
  pipelineStatDot: { width: 6, height: 6, borderRadius: '50%' },
  pipelineStatCount: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: 26,
    fontWeight: 700,
    color: 'var(--kb-text)',
    lineHeight: 1,
  },
  buyerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 14,
  },
  buyerCard: {
    background: 'var(--kb-bg-raised)',
    border: '1px solid var(--kb-border)',
    borderRadius: 10,
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  buyerHeader: { display: 'flex', alignItems: 'flex-start', gap: 12 },
  buyerType: {
    fontSize: 9,
    color: 'var(--kb-accent)',
    fontFamily: '"DM Mono", monospace',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    fontWeight: 700,
    marginBottom: 4,
  },
  buyerFirm: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: 17,
    fontWeight: 700,
    color: 'var(--kb-text)',
    margin: 0,
    lineHeight: 1.25,
  },
  buyerGeo: { fontSize: 11, color: 'var(--kb-text-muted)', marginTop: 4, fontStyle: 'italic' },
  buyerScore: {
    flexShrink: 0,
    width: 56,
    height: 56,
    borderRadius: 12,
    background: 'var(--kb-accent-dim)',
    border: '1.5px solid var(--kb-accent-border)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyerScoreNum: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--kb-accent)',
    lineHeight: 1,
  },
  buyerScoreLabel: { fontSize: 8, color: 'var(--kb-accent)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginTop: 2 },
  buyerNotes: {
    fontSize: 12.5,
    color: 'var(--kb-text-secondary)',
    lineHeight: 1.6,
    margin: 0,
  },
  buyerFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTop: '1px solid var(--kb-border-subtle, var(--kb-border))',
  },
  buyerDealRange: {
    fontFamily: '"DM Mono", monospace',
    fontSize: 11,
    color: 'var(--kb-text-secondary)',
    fontWeight: 600,
  },
  buyerStatusBadge: {
    fontSize: 10,
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: 100,
    fontFamily: '"DM Mono", monospace',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
}
