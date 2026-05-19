import { createClient } from '@/lib/supabase/server'
import { AuditClient } from './AuditClient'

export const revalidate = 0 // fresh logs

export default async function AdminAuditPage() {
  const supabase = await createClient()

  // Fetch activity logs joining profiles for actor's name
  const { data: logs, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      actor:profiles (
        full_name,
        role
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching activity logs:', error)
  }

  return <AuditClient initialLogs={logs || []} />
}
