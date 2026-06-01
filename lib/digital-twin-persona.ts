// Shared helper for resolving a Digital Twin persona identifier (UUID or slug)
// to the underlying persona UUID. Auto-creates the default CEO twin on first use.

import type { SupabaseClient } from '@supabase/supabase-js'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Accepts either a UUID or a slug and returns the persona UUID.
 * Returns null if the slug doesn't exist (except for 'default-ceo-twin' which is auto-created).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function resolvePersonaId(admin: SupabaseClient<any>, personaId: string): Promise<string | null> {
  if (UUID_REGEX.test(personaId)) return personaId

  const { data: existing } = await admin
    .from('digital_twin_personas')
    .select('id')
    .eq('slug', personaId)
    .maybeSingle()

  if (existing) return existing.id

  // Auto-create the default CEO twin on first use so the Knowledge Base tab
  // works out of the box without requiring seller intake to run first.
  if (personaId === 'default-ceo-twin') {
    const { data: created, error } = await admin
      .from('digital_twin_personas')
      .insert({
        name: 'Kingdom Broker CEO Twin',
        slug: 'default-ceo-twin',
        title: 'CEO',
        company: 'Kingdom Broker',
        persona_type: 'ceo',
        expertise: 'Business operations, team, customers, SOPs, growth',
        greeting: 'Hi, I am the Digital Twin for your business. Ask me anything.',
        is_published: false,
      })
      .select('id')
      .single()

    if (error) return null
    return created.id
  }

  return null
}
