"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Global error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-red-600">Oops!</h1>
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-gray-400">We encountered an unexpected error. Please try again.</p>
        </div>

        <div className="flex gap-4 justify-center">
          <button onClick={reset} className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-md transition-colors">
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="border border-gray-600 hover:border-gray-400 px-6 py-3 rounded-md transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  )
}
