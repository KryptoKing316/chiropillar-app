// ============================================================
// Admin Action Logger — server-side only
// Logs all admin actions to the activity_log table with IP + timestamp
// ============================================================
import 'server-only'
import { NextRequest } from 'next/server'

export type AdminAction =
  | 'agent_run_triggered'
  | 'buyer_leads_viewed'
  | 'seller_leads_viewed'
  | 'deal_accessed'
  | 'document_downloaded'
  | 'valuation_computed'
  | 'outreach_sent'
  | 'deal_status_changed'
  | 'user_role_changed'
  | 'api_key_used'

export async function logAdminAction(
  req: NextRequest,
  action: AdminAction,
  metadata: Record<string, unknown> = {},
  dealId?: string
): Promise<void> {
  try {
    const { getAdminSupabase } = await import('@/lib/supabase')
    const admin = getAdminSupabase()

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'

    const userAgent = req.headers.get('user-agent') || 'unknown'

    // Get the user from the auth header if present
    let userId: string | null = null
    try {
      const { requireSession } = await import('@/lib/auth')
      const { user } = await requireSession(req)
      userId = user?.id ?? null
    } catch {
      // Non-fatal — log action without user
    }

    await admin.from('activity_log').insert({
      deal_id: dealId ?? null,
      event_type: action,
      event_description: `Admin action: ${action}`,
      metadata: {
        ...metadata,
        ip_address: ip,
        user_agent: userAgent,
        user_id: userId,
        timestamp: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    })
  } catch (err) {
    // Never let logging failures break the main request
    console.error('[admin-log] Failed to log action:', action, err)
  }
}
