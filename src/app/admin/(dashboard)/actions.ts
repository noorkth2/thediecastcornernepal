'use server'

import { createClient } from '@/lib/supabase/server'
import { getAnalyticsSummary, buildDateRange } from '@/lib/supabase/queries/analytics-advanced'
import type { AnalyticsSummary, DateRange } from '@/lib/types/analytics'
import { revalidatePath } from 'next/cache'

// ─── Main analytics summary action ────────────────────────────────────
// Called by client component when date range changes
export async function getAnalyticsSummaryAction(
  preset: string,
  customStart?: string,
  customEnd?: string
): Promise<AnalyticsSummary> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const range = buildDateRange(preset, customStart, customEnd)
  return getAnalyticsSummary(range)
}

// ─── Log admin action ──────────────────────────────────────────────────
export async function logAdminAction(
  action: string,
  entityType: string,
  entityId?: string,
  oldData?: Record<string, unknown>,
  newData?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    await supabase.from('activity_logs').insert({
      actor_id: user.id,
      actor_role: profile?.role ?? 'unknown',
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_data: oldData ?? null,
      new_data: newData ?? null,
    })
  } catch {
    // Audit logging should never break the main flow
  }
}

// ─── Refresh analytics cache ──────────────────────────────────────────
export async function refreshAnalyticsAction(): Promise<void> {
  revalidatePath('/admin/analytics')
}
