'use server'

import { createClient } from '@/lib/supabase/server'
import type { ReportType, ReportFilters } from '@/lib/types/analytics'
import {
  getDailySalesReport, getProductSalesReport, getInventoryValuationReport,
  getLowStockReport, getRefundReport, getCustomerPurchaseReport,
  getPaymentGatewayReport, getAuditLogReport, getDeadInventoryReport,
  getTaxSummaryReport,
} from '@/lib/supabase/queries/reports'

export async function fetchReportAction(type: ReportType, filters: ReportFilters): Promise<unknown[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { startDate, endDate } = filters
  switch (type) {
    case 'sales-daily':          return getDailySalesReport(filters)
    case 'sales-monthly':        return [] // handled elsewhere or requires distinct view
    case 'product-sales':
    case 'fast-movers':          return getProductSalesReport(filters)
    case 'inventory-valuation':  return getInventoryValuationReport(filters)
    case 'low-stock':            return getLowStockReport()
    case 'dead-inventory':       return getDeadInventoryReport()
    case 'refunds':              return getRefundReport(filters)
    case 'customer-purchase':    return getCustomerPurchaseReport(filters)
    case 'payment-gateway':      return getPaymentGatewayReport(startDate, endDate)
    case 'tax-summary':          return (await getTaxSummaryReport(startDate, endDate)).rows
    case 'audit-log':            return (await getAuditLogReport(filters)).data
    default:                     return []
  }
}
