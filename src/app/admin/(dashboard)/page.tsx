import { getAnalyticsSummary, buildDateRange } from '@/lib/supabase/queries/analytics-advanced'
import { AnalyticsDashboard } from './_components/AnalyticsDashboard'

export const revalidate = 120

export default async function AdminAnalyticsPage() {
  const range = buildDateRange('month')
  const data = await getAnalyticsSummary(range)

  return <AnalyticsDashboard initialData={data} />
}
