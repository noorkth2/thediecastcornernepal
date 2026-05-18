import type { RevenueByDay, ForecastPoint, StockExhaustionForecast } from '@/lib/types/analytics'
import { format, addDays, parseISO } from 'date-fns'

// ─── Exponential Moving Average (EMA) ────────────────────────────────
// α = smoothing factor (0.3 = 30-day responsiveness, standard for retail)
export function calculateEMA(values: number[], alpha = 0.3): number[] {
  if (values.length === 0) return []
  const result: number[] = [values[0]]
  for (let i = 1; i < values.length; i++) {
    result.push(alpha * values[i] + (1 - alpha) * result[i - 1])
  }
  return result
}

// ─── Revenue Forecast (30-day EMA projection) ─────────────────────────
export function forecastRevenue(
  historicalData: RevenueByDay[],
  daysAhead = 30,
  alpha = 0.3
): ForecastPoint[] {
  if (historicalData.length === 0) return []

  // Sort ascending
  const sorted = [...historicalData].sort(
    (a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime()
  )

  const revenues = sorted.map((d) => d.revenue)
  const emaValues = calculateEMA(revenues, alpha)

  // Last EMA value = basis for forecast
  const lastEMA = emaValues[emaValues.length - 1] ?? 0
  const lastDate = sorted[sorted.length - 1]?.rawDate ?? new Date().toISOString().split('T')[0]

  // Compute std deviation for confidence interval
  const mean = revenues.reduce((s, v) => s + v, 0) / revenues.length
  const variance = revenues.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / revenues.length
  const stdDev = Math.sqrt(variance)

  const points: ForecastPoint[] = []

  // Historical actual + smoothed points
  sorted.forEach((day, i) => {
    points.push({
      date: day.rawDate,
      label: format(parseISO(day.rawDate), 'MMM d'),
      predictedRevenue: Math.max(0, Math.round(emaValues[i])),
      actualRevenue: day.revenue,
      isForecasted: false,
      confidenceLow: Math.max(0, Math.round(emaValues[i] - stdDev)),
      confidenceHigh: Math.round(emaValues[i] + stdDev),
    })
  })

  // Future forecast points
  let currentEMA = lastEMA
  const baseDate = parseISO(lastDate)
  for (let i = 1; i <= daysAhead; i++) {
    // Apply slight decay for uncertainty
    currentEMA = currentEMA * 0.998
    const forecastDate = addDays(baseDate, i)
    const confidence = Math.max(stdDev * (1 + i * 0.02), stdDev)
    points.push({
      date: format(forecastDate, 'yyyy-MM-dd'),
      label: format(forecastDate, 'MMM d'),
      predictedRevenue: Math.max(0, Math.round(currentEMA)),
      isForecasted: true,
      confidenceLow: Math.max(0, Math.round(currentEMA - confidence)),
      confidenceHigh: Math.round(currentEMA + confidence),
    })
  }

  return points
}

// ─── Stock Exhaustion Prediction ─────────────────────────────────────
export function predictStockExhaustion(
  products: Array<{
    productId: number
    title: string
    brand: string | null
    stockQty: number
    unitsSoldLast30Days: number
  }>
): StockExhaustionForecast[] {
  return products
    .map((p) => {
      const avgDailySales = p.unitsSoldLast30Days / 30
      const daysUntilStockOut =
        avgDailySales > 0 ? Math.floor(p.stockQty / avgDailySales) : null

      let urgency: StockExhaustionForecast['urgency'] = 'ok'
      if (daysUntilStockOut !== null) {
        if (daysUntilStockOut <= 7) urgency = 'critical'
        else if (daysUntilStockOut <= 30) urgency = 'warning'
      }
      if (p.stockQty === 0) urgency = 'critical'

      return {
        productId: p.productId,
        title: p.title,
        brand: p.brand,
        stockQty: p.stockQty,
        avgDailySales: Math.round(avgDailySales * 100) / 100,
        daysUntilStockOut,
        urgency,
      }
    })
    .sort((a, b) => {
      // Sort by urgency: critical first, then by days
      if (a.urgency === 'critical' && b.urgency !== 'critical') return -1
      if (b.urgency === 'critical' && a.urgency !== 'critical') return 1
      if (a.daysUntilStockOut === null) return 1
      if (b.daysUntilStockOut === null) return -1
      return a.daysUntilStockOut - b.daysUntilStockOut
    })
}

// ─── Growth Rate Calculator ───────────────────────────────────────────
export function calcGrowthPct(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100 * 10) / 10
}

// ─── Predicted Next Month Revenue ────────────────────────────────────
export function predictNextMonthRevenue(
  forecastPoints: ForecastPoint[]
): number {
  const future = forecastPoints.filter((p) => p.isForecasted).slice(0, 30)
  return future.reduce((sum, p) => sum + p.predictedRevenue, 0)
}

// ─── Category Demand Score ────────────────────────────────────────────
// Simple score: units_sold / max_units_sold in the set, 0–100
export function categoriesDemandScore(
  categories: Array<{ name: string; unitsSold: number }>
): Array<{ name: string; unitsSold: number; score: number }> {
  const max = Math.max(...categories.map((c) => c.unitsSold), 1)
  return categories.map((c) => ({
    ...c,
    score: Math.round((c.unitsSold / max) * 100),
  }))
}
