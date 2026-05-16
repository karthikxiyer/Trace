export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-neutral-100 p-3.5 sm:p-4 animate-pulse">
      <div className="flex gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-neutral-100 shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-neutral-100 rounded w-3/4" />
          <div className="h-3 bg-neutral-100 rounded w-full" />
          <div className="h-3 bg-neutral-100 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}
