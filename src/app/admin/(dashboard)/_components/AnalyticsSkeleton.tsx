export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface-card border border-surface-border rounded-xl p-5 h-32" />
        ))}
      </div>
      {/* Main chart row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-card border border-surface-border rounded-xl h-72" />
        <div className="bg-surface-card border border-surface-border rounded-xl h-72" />
      </div>
      {/* Secondary row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-card border border-surface-border rounded-xl h-56" />
        <div className="bg-surface-card border border-surface-border rounded-xl h-56" />
      </div>
      {/* Table */}
      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <div className="h-14 border-b border-surface-border bg-surface-elevated/40" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 border-b border-surface-border/50 px-6 flex items-center gap-4">
            <div className="h-3 w-4 bg-surface-elevated rounded" />
            <div className="h-3 flex-1 max-w-[200px] bg-surface-elevated rounded" />
            <div className="h-3 w-16 bg-surface-elevated rounded ml-auto" />
            <div className="h-3 w-20 bg-surface-elevated rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
