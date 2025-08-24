import { Star } from "lucide-react"

export default function RatingsLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="pt-20 px-4 sm:px-6">
        <div className="py-8 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-8 h-8 text-yellow-500 animate-pulse" />
            <div className="h-8 bg-gray-700 rounded w-48 animate-pulse"></div>
          </div>
          <div className="h-4 bg-gray-700 rounded w-64 animate-pulse"></div>
        </div>

        <div className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-28 bg-gray-700 rounded animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-700 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded w-32 mb-3 animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
