export default function ReportsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-40 bg-surface-elevated rounded-lg" />
      {Array.from({ length: 3 }).map((_, g) => (
        <div key={g} className="space-y-3">
          <div className="h-3 w-32 bg-surface-elevated rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface-card border border-surface-border rounded-xl h-32" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
