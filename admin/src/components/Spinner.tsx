export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div
      className="flex items-center gap-2 text-sm text-slate-400"
      role="status"
      aria-live="polite"
    >
      <span
        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-violet-500"
        aria-hidden
      />
      <span>{label}</span>
    </div>
  );
}
