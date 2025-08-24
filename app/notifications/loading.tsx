import { Bell } from "lucide-react"

export default function NotificationsLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="pt-20 px-4 sm:px-6">
        <div className="py-8 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-8 h-8 text-blue-500 animate-pulse" />
            <div className="h-8 bg-gray-700 rounded w-48 animate-pulse"></div>
          </div>
          <div className="h-4 bg-gray-700 rounded w-64 animate-pulse"></div>
        </div>

        <div className="py-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gray-700 rounded animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
