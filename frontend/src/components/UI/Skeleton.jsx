const SkeletonCard = ({ lines = 3 }) => (
  <div className="rounded-xl p-4 border bg-base-200 border-base-300 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 rounded-lg bg-base-300 shimmer" />
      <div className="flex-1 h-4 rounded bg-base-300 shimmer" />
    </div>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={`h-3 rounded bg-base-300 shimmer mb-2 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
    ))}
    <div className="flex gap-2 mt-4">
      <div className="h-6 w-16 rounded-full bg-base-300 shimmer" />
      <div className="h-6 w-20 rounded-full bg-base-300 shimmer" />
    </div>
  </div>
)

export const SkeletonList = ({ count = 4, lines }) => (
  <div className="grid gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} lines={lines} />
    ))}
  </div>
)

export const SkeletonDashboard = () => (
  <div className="p-6 space-y-6 animate-pulse">
    {/* Stats row */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-xl p-4 bg-base-200 border border-base-300 h-24">
          <div className="h-4 w-16 bg-base-300 rounded mb-2 shimmer" />
          <div className="h-8 w-12 bg-base-300 rounded shimmer" />
        </div>
      ))}
    </div>
    {/* Chart placeholder */}
    <div className="rounded-xl p-6 bg-base-200 border border-base-300 h-64 shimmer" />
    {/* Tasks list */}
    <div className="grid md:grid-cols-2 gap-4">
      <SkeletonCard lines={4} />
      <SkeletonCard lines={4} />
    </div>
  </div>
)

export default SkeletonCard
