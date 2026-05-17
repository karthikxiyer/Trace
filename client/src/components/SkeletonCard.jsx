export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-[rgba(0,49,53,0.1)] p-3.5 sm:p-4 animate-pulse">
      <div className="flex gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-[rgba(0,49,53,0.06)] shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-[rgba(0,49,53,0.06)] rounded w-3/4" />
          <div className="h-3 bg-[rgba(0,49,53,0.06)] rounded w-full" />
          <div className="h-3 bg-[rgba(0,49,53,0.06)] rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}
