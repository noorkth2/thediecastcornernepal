export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="h-8 w-48 bg-surface-elevated rounded-lg" />
      <div className="h-4 w-72 bg-surface-elevated rounded" />
      {/* Tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 w-24 bg-surface-elevated rounded-lg" />
        ))}
      </div>
      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface-card border border-surface-border rounded-xl p-5 h-32" />
        ))}
      </div>
      {/* Chart row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-card border border-surface-border rounded-xl h-72" />
        <div className="bg-surface-card border border-surface-border rounded-xl h-72" />
      </div>
    </div>
  )
}
