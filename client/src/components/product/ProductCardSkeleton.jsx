export default function ProductCardSkeleton() {
  return (
    <div className="bg-[var(--bg-primary)] rounded-2xl overflow-hidden border border-[var(--border)]">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 skeleton rounded-full w-1/4" />
        <div className="h-4 skeleton rounded-full w-full" />
        <div className="h-4 skeleton rounded-full w-2/3" />
        <div className="h-3 skeleton rounded-full w-1/3" />
        <div className="h-6 skeleton rounded-full w-1/3" />
        <div className="h-9 skeleton rounded-xl w-full" />
      </div>
    </div>
  );
}
