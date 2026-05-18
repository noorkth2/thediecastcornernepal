import * as XLSX from 'xlsx'

// ─── Generic row type ─────────────────────────────────────────────────
type ExportRow = Record<string, string | number | boolean | null>

// ─── CSV Export ───────────────────────────────────────────────────────
export function exportToCSV(data: ExportRow[], filename: string): void {
  if (data.length === 0) return
  const headers = Object.keys(data[0])
  const rows = data.map((row) =>
    headers
      .map((h) => {
        const val = row[h]
        if (val === null || val === undefined) return ''
        const str = String(val)
        // Escape commas and quotes
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      })
      .join(',')
  )
  const csv = [headers.join(','), ...rows].join('\n')
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;')
}

// ─── Excel Export (xlsx) ──────────────────────────────────────────────
export function exportToExcel(
  data: ExportRow[],
  filename: string,
  sheetName = 'Report'
): void {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  // Auto-column widths
  const colWidths = Object.keys(data[0] ?? {}).map((key) => ({
    wch: Math.max(
      key.length,
      ...data.slice(0, 100).map((row) => String(row[key] ?? '').length)
    ),
  }))
  ws['!cols'] = colWidths

  XLSX.writeFile(wb, `${filename}.xlsx`)
}

// ─── Print-friendly Report ────────────────────────────────────────────
export function printReport(title: string): void {
  const originalTitle = document.title
  document.title = title
  window.print()
  document.title = originalTitle
}

// ─── File downloader ──────────────────────────────────────────────────
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ─── Format helpers for export rows ──────────────────────────────────
export function formatCurrencyForExport(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
}

export function formatPctForExport(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatDateForExport(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ─── Report filename generator ─────────────────────────────────────────
export function buildReportFilename(type: string, startDate: string, endDate: string): string {
  const from = startDate.replace(/-/g, '')
  const to = endDate.replace(/-/g, '')
  return `DCN_${type.replace(/-/g, '_').toUpperCase()}_${from}_${to}`
}
