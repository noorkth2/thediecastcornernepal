import { Loader2 } from 'lucide-react'

export default function AdminLoading() {
  return (
    <div className="w-full h-[50vh] flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 text-brand-red animate-spin mb-4" />
      <p className="text-text-muted text-sm font-mono animate-pulse">Loading data...</p>
    </div>
  )
}
