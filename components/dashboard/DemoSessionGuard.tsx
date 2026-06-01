'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DEMO_SESSION_DURATION_MS, DEMO_SESSION_KEY } from '@/lib/demo-guard'

// Mounts in the dash layout for demo users.
// Tracks when the demo session started and redirects to login after 30 minutes.
export default function DemoSessionGuard() {
  const router = useRouter()

  useEffect(() => {
    const existing = localStorage.getItem(DEMO_SESSION_KEY)
    const now = Date.now()

    if (!existing) {
      // First visit — record start time
      localStorage.setItem(DEMO_SESSION_KEY, String(now))
      return
    }

    const startedAt = parseInt(existing, 10)
    const elapsed = now - startedAt

    if (elapsed >= DEMO_SESSION_DURATION_MS) {
      // Session expired — clear and redirect
      localStorage.removeItem(DEMO_SESSION_KEY)
      router.push('/login?reason=demo_expired')
      return
    }

    // Set a timeout for the remaining duration
    const remaining = DEMO_SESSION_DURATION_MS - elapsed
    const timer = setTimeout(() => {
      localStorage.removeItem(DEMO_SESSION_KEY)
      router.push('/login?reason=demo_expired')
    }, remaining)

    return () => clearTimeout(timer)
  }, [router])

  return null
}
