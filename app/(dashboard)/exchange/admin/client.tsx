'use client'

import { useState } from 'react'
import Link from 'next/link'

type Firm = {
  id: string
  slug: string
  firm_name: string
  hq_city?: string
  hq_state?: string
  tier: string
  equity_pct: number
  status: string
  primary_contact_name?: string
  primary_contact_email?: string
}

type Member = {
  id: string
  first_name: string
  last_name: string
  email: string
  title?: string
  role: string
  is_active: boolean
  user_id?: string
  created_at: string
  coalition_firms?: { slug: string; firm_name: string } | { slug: string; firm_name: string }[]
}

// Supabase returns nested relations as arrays — unwrap to single object for UI
function firmOf(m: Member): { slug: string; firm_name: string } | undefined {
  if (!m.coalition_firms) return undefined
  return Array.isArray(m.coalition_firms) ? m.coalition_firms[0] : m.coalition_firms
}

export default function AdminClient({ firms, members: initialMembers }: { firms: Firm[]; members: Member[] }) {
  const [members, setMembers] = useState(initialMembers)
  const [firmSlug, setFirmSlug] = useState(firms[0]?.slug ?? '')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [title, setTitle] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [magicLink, setMagicLink] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)

  // Quick-prefill helper for the 5 invited founding firms
  function prefill(firm: Firm) {
    setFirmSlug(firm.slug)
    if (firm.primary_contact_name) {
      const parts = firm.primary_contact_name.split(' ')
      setFirstName(parts[0] ?? '')
      setLastName(parts.slice(1).join(' '))
    }
    if (firm.primary_contact_email) setEmail(firm.primary_contact_email)
    setTitle('Founder')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    setMagicLink(null)
    setOkMsg(null)
    try {
      const res = await fetch('/api/exchange/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firm_slug: firmSlug,
          email,
          first_name: firstName,
          last_name: lastName,
          title: title || null,
          phone: phone || null,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Invite failed')
      setMagicLink(data.magic_link)
      setOkMsg(`✓ ${firstName} ${lastName} (${email}) invited to ${data.firm_name}. Supabase auto-sent magic link email.`)

      // Refresh members list
      const refreshed = await fetch('/api/exchange/invite').then(r => r.json())
      setMembers(refreshed.members ?? [])

      // Clear form
      setFirstName('')
      setLastName('')
      setEmail('')
      setTitle('')
      setPhone('')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }

  async function copyLink() {
    if (!magicLink) return
    await navigator.clipboard.writeText(magicLink)
    setOkMsg('✓ Magic link copied to clipboard')
  }

  return (
    <div className="min-h-screen bg-navy text-kb-text">
      <div className="max-w-6xl mx-auto px-8 py-10">
        <Link href="/exchange" className="text-xs text-gold hover:underline">← Back to Exchange</Link>

        <div className="mt-4 mb-8">
          <div className="text-xs uppercase tracking-[0.2em] text-gold font-bold mb-1">Admin · Exchange Management</div>
          <h1 className="font-display text-3xl">Invite a Broker</h1>
          <p className="text-kb-muted mt-1">Add a broker to a Exchange firm. Magic-link email goes out automatically.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invite form */}
          <form onSubmit={submit} className="lg:col-span-2 bg-navy-2 border border-kb-border rounded-2xl p-6">
            <h2 className="font-display text-lg mb-4">New Invite</h2>

            <Field label="Firm" required>
              <select
                value={firmSlug}
                onChange={(e) => setFirmSlug(e.target.value)}
                className="w-full bg-navy border border-kb-border rounded-lg px-4 py-3 text-kb-text"
                required
              >
                {firms.map((f) => (
                  <option key={f.slug} value={f.slug}>
                    {f.firm_name} ({f.tier} · {f.status})
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" required>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-navy border border-kb-border rounded-lg px-4 py-3 text-kb-text"
                  required
                />
              </Field>
              <Field label="Last Name" required>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-navy border border-kb-border rounded-lg px-4 py-3 text-kb-text"
                  required
                />
              </Field>
            </div>

            <Field label="Email" required>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="andy@voyageacq.com"
                className="w-full bg-navy border border-kb-border rounded-lg px-4 py-3 text-kb-text"
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Title">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Founder · President · Senior Advisor"
                  className="w-full bg-navy border border-kb-border rounded-lg px-4 py-3 text-kb-text"
                />
              </Field>
              <Field label="Phone">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 555-5555"
                  className="w-full bg-navy border border-kb-border rounded-lg px-4 py-3 text-kb-text"
                />
              </Field>
            </div>

            {err && (
              <div className="bg-red-950/40 border border-red-700 rounded-lg p-3 text-sm text-red-200 mb-3">{err}</div>
            )}
            {okMsg && (
              <div className="bg-green-950/40 border border-green-700 rounded-lg p-3 text-sm text-green-200 mb-3">{okMsg}</div>
            )}
            {magicLink && (
              <div className="bg-gold/5 border border-gold/40 rounded-lg p-4 mb-3">
                <div className="text-xs uppercase tracking-wider text-gold font-bold mb-2">Magic Link (also email-sent automatically)</div>
                <div className="font-mono text-xs text-kb-text bg-navy rounded p-2 mb-2 break-all">{magicLink}</div>
                <button
                  type="button"
                  onClick={copyLink}
                  className="text-xs px-3 py-1.5 bg-gold text-navy font-bold rounded hover:bg-gold-light transition"
                >
                  📋 Copy link
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full px-6 py-3 bg-gold text-navy font-bold rounded-lg hover:bg-gold-light disabled:opacity-50 transition mt-2"
            >
              {busy ? 'Inviting...' : 'Send Magic Link Invite →'}
            </button>
          </form>

          {/* Quick-invite shortcuts for the 5 invited founding firms */}
          <div className="bg-navy-2 border border-gold/30 rounded-2xl p-6">
            <h2 className="font-display text-lg mb-1 text-gold">⚡ Quick Invites</h2>
            <p className="text-xs text-kb-muted mb-4">Pre-fill from invited founding firms</p>

            <div className="space-y-2">
              {firms.filter(f => f.status === 'invited').map(f => (
                <button
                  key={f.slug}
                  onClick={() => prefill(f)}
                  className="w-full text-left bg-navy border border-kb-border hover:border-gold/40 rounded-lg p-3 transition"
                >
                  <div className="text-sm font-semibold text-kb-text">{f.firm_name}</div>
                  <div className="text-xs text-kb-muted mt-0.5">
                    {f.primary_contact_name ?? '?'} · {f.tier} · {f.equity_pct}%
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Member directory */}
        <div className="mt-10">
          <h2 className="font-display text-xl mb-4">Exchange Member Directory ({members.length})</h2>
          <div className="bg-navy-2 border border-kb-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-navy-3 text-xs uppercase tracking-wider text-kb-muted">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Firm</th>
                  <th className="text-left px-4 py-3">Title</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Signed In</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-kb-faint">No members invited yet. Use the form above to send the first invite.</td></tr>
                ) : members.map(m => (
                  <tr key={m.id} className="border-t border-kb-border">
                    <td className="px-4 py-3 text-kb-text font-semibold">{m.first_name} {m.last_name}</td>
                    <td className="px-4 py-3 text-kb-muted">{m.email}</td>
                    <td className="px-4 py-3 text-kb-text">{firmOf(m)?.firm_name ?? '—'}</td>
                    <td className="px-4 py-3 text-kb-muted">{m.title ?? '—'}</td>
                    <td className="px-4 py-3 text-kb-muted">{m.role}</td>
                    <td className="px-4 py-3">
                      {m.user_id ? <span className="text-green-400 text-xs">✓ Active</span> : <span className="text-amber-400 text-xs">⏳ Pending sign-in</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-xs uppercase tracking-wider text-kb-muted mb-2 font-semibold">
        {label} {required && <span className="text-gold">*</span>}
      </label>
      {children}
    </div>
  )
}
