'use client'

import { exportToCSV, exportToExcel, printReport, buildReportFilename } from '@/lib/utils/export'
import { Download, FileSpreadsheet, Printer } from 'lucide-react'

interface Props {
  data: Record<string, unknown>[]
  columns: Array<{ key: string; label: string; format?: string }>
  filename: string
  title: string
}

export function ExportBar({ data, columns, filename, title }: Props) {
  function buildExportRows() {
    return data.map((row) => {
      const out: Record<string, string | number | null> = {}
      for (const col of columns) {
        const val = row[col.key]
        if (val === null || val === undefined) {
          out[col.label] = '—'
        } else if (col.format === 'currency') {
          out[col.label] = `Rs. ${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        } else if (col.format === 'percent') {
          out[col.label] = `${val}%`
        } else if (col.format === 'date') {
          out[col.label] = new Date(String(val)).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        } else {
          out[col.label] = String(val)
        }
      }
      return out
    })
  }

  function handleCSV() {
    exportToCSV(buildExportRows(), filename)
  }

  function handleExcel() {
    exportToExcel(buildExportRows(), filename, title.slice(0, 31))
  }

  function handlePrint() {
    printReport(title)
  }

  if (data.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      <span className="text-text-faint text-xs mr-1">{data.length} rows</span>
      <button
        onClick={handleCSV}
        className="flex items-center gap-1.5 px-3 py-2 bg-surface-card border border-surface-border rounded-lg text-xs font-medium text-text-muted hover:text-white hover:border-brand-gold/40 transition-all"
      >
        <Download className="w-3.5 h-3.5" />
        CSV
      </button>
      <button
        onClick={handleExcel}
        className="flex items-center gap-1.5 px-3 py-2 bg-surface-card border border-surface-border rounded-lg text-xs font-medium text-text-muted hover:text-white hover:border-green-400/40 transition-all"
      >
        <FileSpreadsheet className="w-3.5 h-3.5" />
        Excel
      </button>
      <button
        onClick={handlePrint}
        className="flex items-center gap-1.5 px-3 py-2 bg-surface-card border border-surface-border rounded-lg text-xs font-medium text-text-muted hover:text-white hover:border-blue-400/40 transition-all print:hidden"
      >
        <Printer className="w-3.5 h-3.5" />
        Print
      </button>
    </div>
  )
}
