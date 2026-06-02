// Demo mode toggle · sets a 30-min cookie that grants read-only platform access
// without requiring magic-link login. Used by the "View Live Demo" button on /login.

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST() {
  const jar = await cookies()
  jar.set('chiropillar-demo', '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 30, // 30 minutes
    path: '/',
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const jar = await cookies()
  jar.delete('chiropillar-demo')
  return NextResponse.json({ ok: true })
}
