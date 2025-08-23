import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-red-600">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-gray-400 max-w-md">The page you're looking for doesn't exist or has been moved.</p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/" className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-md transition-colors">
            Go Home
          </Link>
          <Link
            href="/movies"
            className="border border-gray-600 hover:border-gray-400 px-6 py-3 rounded-md transition-colors"
          >
            Browse Movies
          </Link>
        </div>
      </div>
    </div>
  )
}
