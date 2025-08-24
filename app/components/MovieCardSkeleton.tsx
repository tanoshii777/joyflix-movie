export default function MovieCardSkeleton() {
  return (
    <div className="movie-card-mobile sm:min-w-0 animate-pulse">
      <div className="aspect-[2/3] w-full bg-gray-700 rounded-lg"></div>
      <div className="mt-2 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  )
}
