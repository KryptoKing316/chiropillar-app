// One-off: ensure chiropillar_team table exists + whitelist Wagner + send magic link
// Run: cd chiropillar-app && node scripts/send-wagner-magiclink.mjs
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const envPath = path.resolve(process.cwd(), '.env.local')
const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((a, l) => {
  const m = l.match(/^([A-Z_]+)=(.+)$/); if (m) a[m[1]] = m[2].replace(/^["']|["']$/g, '')
  return a
}, {})

const url = env.NEXT_PUBLIC_SUPABASE_URL
const sk  = env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !sk) { console.error('Missing Supabase keys'); process.exit(1) }
const supa = createClient(url, sk, { auth: { persistSession: false } })

const WAGNER = 'scottwagner715@gmail.com'

// 1) Ensure chiropillar_team table exists. Use PostgREST direct SQL via the
//    Supabase Management API → fallback: skip and rely on profiles table.
//    Since service-role doesn't have direct SQL access in the JS SDK, we
//    try the table first; if it errors, we route auth through `profiles`.
console.log('Checking chiropillar_team table ...')
const { error: probeErr } = await supa.from('chiropillar_team').select('email').limit(1)
const tableExists = !probeErr
console.log('  exists:', tableExists, probeErr ? `(${probeErr.message})` : '')

if (tableExists) {
  console.log('Upserting Wagner into chiropillar_team ...')
  const { error: upErr } = await supa.from('chiropillar_team').upsert({
    email: WAGNER, full_name: 'Dr. Scott Wagner', role: 'admin', active: true,
  }, { onConflict: 'email' })
  if (upErr) console.error('  upsert failed:', upErr.message)
  else console.log('  whitelisted ✓')
} else {
  console.log('Falling back to profiles table (current production auth path)')
  // Make sure Wagner has a profiles row so the auth layout can find him via that path
  const { error: profErr } = await supa.from('profiles').upsert({
    email: WAGNER, full_name: 'Dr. Scott Wagner', role: 'admin',
  }, { onConflict: 'email' })
  if (profErr) console.error('  profiles upsert failed:', profErr.message)
  else console.log('  profile created/updated ✓')
}

// 2) Send the magic-link login email via Supabase Auth
console.log('Sending magic-link login email ...')
const { error: otpErr } = await supa.auth.signInWithOtp({
  email: WAGNER,
  options: { emailRedirectTo: 'https://www.chiropillar.com/auth/callback' },
})
if (otpErr) { console.error('Magic-link send failed:', otpErr.message); process.exit(1) }
console.log('  magic-link sent ✓')
console.log(`\nDone. Wagner should see the login email in ${WAGNER} within 1–2 min.`)
