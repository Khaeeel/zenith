export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6 p-4 lg:p-8">
      <div className="h-8 w-40 rounded bg-white/10" />
      <div className="h-4 w-72 max-w-full rounded bg-white/5" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded border border-white/10 bg-white/5" />
        ))}
      </div>
    </div>
  );
}
