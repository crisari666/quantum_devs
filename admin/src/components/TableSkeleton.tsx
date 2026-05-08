export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full animate-pulse space-y-2" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-8 rounded bg-slate-800" />
      ))}
    </div>
  );
}
