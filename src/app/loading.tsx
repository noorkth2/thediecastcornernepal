import { Loader2 } from 'lucide-react'

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-brand-red animate-spin" />
        <p className="font-mono text-sm text-brand-gold tracking-widest animate-pulse">
          INITIALIZING...
        </p>
      </div>
    </div>
  )
}
