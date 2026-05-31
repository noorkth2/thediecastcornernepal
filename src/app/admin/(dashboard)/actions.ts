'use server'

import { createClient } from '@/lib/supabase/server'
import { getAnalyticsSummary, buildDateRange } from '@/lib/supabase/queries/analytics-advanced'
import type { AnalyticsSummary, DateRange } from '@/lib/types/analytics'
import { revalidatePath } from 'next/cache'
import { verifyAdmin } from '@/lib/supabase/auth-utils'

// ─── Main analytics summary action ────────────────────────────────────
// Called by client component when date range changes
export async function getAnalyticsSummaryAction(
  preset: string,
  customStart?: string,
  customEnd?: string
): Promise<AnalyticsSummary> {
  await verifyAdmin()

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
    const { user, profile } = await verifyAdmin()

    const supabase = await createClient()

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
  await verifyAdmin()
  revalidatePath('/admin/analytics')
}
