"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { WifiOff, RefreshCw, Home, Bookmark, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    setIsOnline(navigator.onLine)
    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="bg-card border-border shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <WifiOff className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">You're Offline</CardTitle>
            <CardDescription className="text-base">
              {isOnline
                ? "Connection restored! You can now browse online content."
                : "No internet connection detected. You can still browse cached content."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Connection Status */}
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/50">
              <div className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm font-medium">{isOnline ? "Back Online" : "Offline Mode"}</span>
            </div>

            {/* Available Actions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-center">What you can do:</h3>

              <div className="grid gap-3">
                <Link href="/" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Home className="w-4 h-4 mr-2" />
                    Browse Cached Movies
                  </Button>
                </Link>

                <Link href="/watchlist" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Bookmark className="w-4 h-4 mr-2" />
                    View Watchlist
                  </Button>
                </Link>

                <Link href="/search" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Search className="w-4 h-4 mr-2" />
                    Search Offline Content
                  </Button>
                </Link>
              </div>
            </div>

            {/* Retry Button */}
            <Button onClick={handleRetry} className="w-full bg-primary hover:bg-primary/90" disabled={!isOnline}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {isOnline ? "Reload Page" : "Retry Connection"}
            </Button>

            {/* Tips */}
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>
                💡 <strong>Tip:</strong> Movies you've viewed recently are cached for offline viewing.
              </p>
              <p>🔄 Your watchlist changes will sync when you're back online.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
