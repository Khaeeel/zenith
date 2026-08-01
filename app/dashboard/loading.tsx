export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-8">
      <div>
        <div className="h-8 w-48 rounded bg-white/10" />
        <div className="mt-3 h-4 w-full max-w-md rounded bg-white/5" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded border border-white/10 bg-white/5" />
        ))}
      </div>
      <div className="h-40 rounded border border-white/10 bg-white/5" />
      <div className="h-56 rounded border border-white/10 bg-white/5" />
    </div>
  );
}
