'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import {
  ClipboardList,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  Activity,
  Layers,
  ChevronDown,
  Check,
} from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'

interface AuditClientProps {
  initialLogs: any[]
}

export function AuditClient({ initialLogs }: AuditClientProps) {
  const [logs] = useState<any[]>(initialLogs)
  const [search, setSearch] = useState('')
  const [entityFilter, setEntityFilter] = useState('all')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Selected log for detailed view
  const [selectedLog, setSelectedLog] = useState<any | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        log.action?.toLowerCase().includes(search.toLowerCase()) ||
        log.actor?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        log.entity_id?.toLowerCase().includes(search.toLowerCase())

      const matchEntity = entityFilter === 'all' || log.entity_type === entityFilter

      return matchSearch && matchEntity
    })
  }, [logs, search, entityFilter])

  // Get unique entities for filtering
  const entities = useMemo(() => {
    const set = new Set(logs.map((l) => l.entity_type).filter(Boolean))
    return Array.from(set)
  }, [logs])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white tracking-wide uppercase flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-brand-red" />
          SYSTEM AUDIT TRAIL
        </h1>
        <p className="text-text-muted text-xs mt-1">
          Immutable tracking of administrative mutations, configuration updates, and commerce adjustments.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-surface-card border border-surface-border p-4 rounded-xl">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
          <input
            type="text"
            placeholder="Search by action, actor, or entity ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 relative" ref={dropdownRef}>
          <Filter className="w-4 h-4 text-text-faint" />
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="input-base bg-surface-elevated text-xs flex items-center justify-between gap-2 min-w-[160px] cursor-pointer hover:bg-surface-elevated/80 transition-colors"
            >
              <span>{entityFilter === 'all' ? 'All Entity Types' : entityFilter.toUpperCase()}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface-card/95 backdrop-blur-md border border-surface-border rounded-xl shadow-2xl overflow-hidden z-30 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="p-1.5 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEntityFilter('all')
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      entityFilter === 'all'
                        ? 'bg-brand-red/10 text-white font-semibold border border-brand-red/20'
                        : 'text-text-muted hover:bg-surface-elevated hover:text-white'
                    }`}
                  >
                    <span>All Entity Types</span>
                    {entityFilter === 'all' && <Check className="w-3.5 h-3.5 text-brand-red" />}
                  </button>

                  {entities.map((ent: any) => (
                    <button
                      key={ent}
                      type="button"
                      onClick={() => {
                        setEntityFilter(ent)
                        setIsOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        entityFilter === ent
                          ? 'bg-brand-red/10 text-white font-semibold border border-brand-red/20'
                          : 'text-text-muted hover:bg-surface-elevated hover:text-white'
                      }`}
                    >
                      <span>{ent.toUpperCase()}</span>
                      {entityFilter === ent && <Check className="w-3.5 h-3.5 text-brand-red" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 bg-surface-card border border-surface-border rounded-xl">
          <Activity className="w-12 h-12 text-surface-border mx-auto mb-3" />
          <p className="text-text-muted text-sm">No matching logs found.</p>
        </div>
      ) : (
        <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated/40 text-[10px] text-text-muted uppercase tracking-widest font-semibold">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Entity Type / ID</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-xs">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-elevated/20 transition-colors">
                  <td className="p-4 font-mono text-[10px] text-text-muted">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-4 font-semibold text-white">
                    <span className="bg-brand-red/10 border border-brand-red/20 px-2 py-0.5 rounded text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-brand-gold" />
                      <div>
                        <span className="font-semibold block">{log.actor?.full_name || 'System'}</span>
                        <span className="text-[9px] text-text-faint block uppercase">{log.actor_role || 'system'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-text-muted">
                      <Layers className="w-3.5 h-3.5" />
                      <div>
                        <span className="font-semibold block text-[10px] uppercase text-text-primary">{log.entity_type}</span>
                        <span className="text-[9px] font-mono text-text-faint block">{log.entity_id || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 rounded bg-surface-elevated border border-surface-border text-text-muted hover:text-white hover:border-brand-red transition-all inline-flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* JSON Diff Detail Modal */}
      <Dialog.Root open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-3xl bg-surface-card border border-surface-border rounded-2xl shadow-2xl p-6 z-50 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
            <Dialog.Title className="text-lg font-display text-white mb-2 uppercase">
              Audit Entry details
            </Dialog.Title>
            <p className="text-[10px] text-text-muted mb-6">
              Action: <span className="text-brand-gold font-mono">{selectedLog?.action}</span> · Actor:{' '}
              <span className="text-brand-gold font-mono">{selectedLog?.actor?.full_name || 'System'}</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Old Data</label>
                <div className="bg-[#171717] border border-surface-border rounded-xl p-4 overflow-x-auto text-[10px] font-mono max-h-[40vh] scrollbar-thin text-red-300">
                  {selectedLog?.old_data ? (
                    <pre>{JSON.stringify(selectedLog.old_data, null, 2)}</pre>
                  ) : (
                    <span className="text-text-faint italic">No historical data</span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">New Data</label>
                <div className="bg-[#171717] border border-surface-border rounded-xl p-4 overflow-x-auto text-[10px] font-mono max-h-[40vh] scrollbar-thin text-green-300">
                  {selectedLog?.new_data ? (
                    <pre>{JSON.stringify(selectedLog.new_data, null, 2)}</pre>
                  ) : (
                    <span className="text-text-faint italic">No update data</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-surface-border">
              <Dialog.Close asChild>
                <button type="button" className="btn-secondary py-2 text-xs">
                  Close
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
