// app/components/SkeletonCard.tsx
export default function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl bg-gray-800/50 overflow-hidden shadow-md">
      <div className="aspect-video bg-gray-700/50"></div>
      <div className="p-4 space-y-2">
        <div className="h-4 w-2/3 bg-gray-700 rounded"></div>
        <div className="h-3 w-1/2 bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}
