import { notFound } from 'next/navigation'
import { ReportViewer } from '../_components/ReportViewer'
import { REPORT_DEFINITIONS } from '@/lib/supabase/queries/reports'
import type { ReportType } from '@/lib/types/analytics'

interface Props {
  params: Promise<{ reportType: string }>
  searchParams: Promise<{ start?: string; end?: string; page?: string; search?: string; category?: string; payment?: string }>
}

export default async function ReportTypePage({ params, searchParams }: Props) {
  const { reportType } = await params
  const sp = await searchParams

  if (!(reportType in REPORT_DEFINITIONS)) notFound()

  const def = REPORT_DEFINITIONS[reportType as ReportType]

  // Default: last 30 days
  const today = new Date()
  const start = sp.start ?? new Date(Date.now() - 30 * 86400_000).toISOString().split('T')[0]
  const end   = sp.end   ?? today.toISOString().split('T')[0]
  const page  = Math.max(1, parseInt(sp.page ?? '1'))

  return (
    <ReportViewer
      reportType={reportType as ReportType}
      title={def.title}
      description={def.description}
      initialFilters={{
        startDate: start,
        endDate: end,
        search: sp.search,
        paymentMethod: sp.payment,
        categoryId: sp.category ? parseInt(sp.category) : undefined,
        page,
        pageSize: 50,
      }}
    />
  )
}

export function generateStaticParams() {
  return Object.keys(REPORT_DEFINITIONS).map((type) => ({ reportType: type }))
}
