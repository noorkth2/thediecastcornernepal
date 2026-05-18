import { getJournalEntries } from '@/lib/supabase/queries/accounting'
import { formatPrice } from '@/lib/utils'
import { ArrowLeft, BookOpen } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 30

export default async function JournalPage() {
  const { data: entries, count } = await getJournalEntries(1, 30)

  const statusColors: Record<string, string> = {
    posted: 'bg-green-400/15 text-green-400',
    draft:  'bg-yellow-400/15 text-yellow-400',
    void:   'bg-red-400/15 text-red-400',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/accounting" className="text-text-faint hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <BookOpen className="w-6 h-6 text-brand-red" />
        <div>
          <h1 className="font-display text-2xl text-white tracking-wide">JOURNAL ENTRIES</h1>
          <p className="text-text-muted text-sm mt-0.5">{count} entries · double-entry accounting ledger</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-brand-gold/10 border border-brand-gold/25 rounded-xl px-5 py-3 text-sm text-brand-gold flex items-start gap-2">
        <span className="text-lg leading-none">ℹ</span>
        <p>
          Journal entries are auto-generated when orders are placed and paid. Manual entries can be added via the accounting API.
          The ledger follows double-entry principles — every debit has a matching credit.
        </p>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated/50">
                {['Entry #', 'Date', 'Description', 'Ref Type', 'Ref ID', 'Status', 'Lines'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-text-faint text-sm">
                    No journal entries yet. They will appear here as orders are processed.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-surface-elevated/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-brand-gold">{entry.entry_number}</td>
                    <td className="px-4 py-3 text-text-muted text-xs tabular-nums">{entry.entry_date}</td>
                    <td className="px-4 py-3 text-text-primary max-w-[200px] truncate">{entry.description}</td>
                    <td className="px-4 py-3 text-text-muted text-xs capitalize">{entry.reference_type ?? '—'}</td>
                    <td className="px-4 py-3 text-text-faint text-xs font-mono">{entry.reference_id ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${statusColors[entry.status] ?? 'bg-surface-elevated text-text-muted'}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted tabular-nums">
                      {entry.items?.length ?? 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
