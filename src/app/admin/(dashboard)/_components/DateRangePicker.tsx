'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { PresetRange } from '@/lib/types/analytics'
import { Calendar, ChevronDown } from 'lucide-react'

const PRESETS: { id: PresetRange; label: string }[] = [
  { id: 'today',     label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'week',      label: 'Last 7 Days' },
  { id: 'month',     label: 'Last 30 Days' },
  { id: 'quarter',   label: 'Last 90 Days' },
  { id: 'year',      label: 'Last 365 Days' },
  { id: 'custom',    label: 'Custom Range' },
]

interface Props {
  activePreset: PresetRange
  onChange: (preset: PresetRange, customStart?: string, customEnd?: string) => void
  disabled?: boolean
}

export function DateRangePicker({ activePreset, onChange, disabled }: Props) {
  const [open, setOpen]             = useState(false)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd]   = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const activeLabel = PRESETS.find((p) => p.id === activePreset)?.label ?? 'Select Range'

  function handlePreset(id: PresetRange) {
    if (id === 'custom') {
      setShowCustom(true)
      return
    }
    setShowCustom(false)
    setOpen(false)
    onChange(id)
  }

  function handleCustomApply() {
    if (!customStart || !customEnd) return
    setOpen(false)
    setShowCustom(false)
    onChange('custom', customStart, customEnd)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 bg-surface-card border border-surface-border',
          'rounded-xl text-sm text-text-primary hover:border-brand-red/50 transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <Calendar className="w-4 h-4 text-brand-gold" />
        <span className="font-medium">{activeLabel}</span>
        <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 w-56 bg-surface-card border border-surface-border rounded-xl shadow-2xl overflow-hidden animate-fade-up">
            <div className="p-1">
              {PRESETS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => handlePreset(id)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors',
                    activePreset === id && id !== 'custom'
                      ? 'bg-brand-red/20 text-brand-red font-semibold'
                      : 'text-text-muted hover:text-white hover:bg-surface-elevated'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {showCustom && (
              <div className="border-t border-surface-border p-3 space-y-2">
                <div>
                  <label className="text-xs text-text-faint mb-1 block">Start Date</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-faint mb-1 block">End Date</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-red"
                  />
                </div>
                <button
                  onClick={handleCustomApply}
                  disabled={!customStart || !customEnd}
                  className="w-full bg-brand-red text-white text-sm font-semibold py-2 rounded-lg hover:bg-brand-red-light transition-colors disabled:opacity-40"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
