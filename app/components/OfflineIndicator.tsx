"use client"

import { useOffline } from "@/app/hooks/useOffline"
import { useOfflineCache } from "@/app/hooks/useOfflineCache"
import { WifiOff, Wifi, Clock, Database, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function OfflineIndicator() {
  const { isOnline, pendingActions } = useOffline()
  const { getCacheStats, clearExpiredCache } = useOfflineCache()
  const [showDetails, setShowDetails] = useState(false)
  const cacheStats = getCacheStats()

  if (isOnline && pendingActions.length === 0 && !showDetails) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex flex-col items-end gap-2">
        {showDetails && (
          <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-4 text-sm text-white shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Database className="w-4 h-4" />
                Cache Status
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(false)}
                className="h-6 w-6 p-0 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span>Cached Movies:</span>
                <span className="text-blue-400">{cacheStats.movies}</span>
              </div>
              <div className="flex justify-between">
                <span>Cached Searches:</span>
                <span className="text-green-400">{cacheStats.searches}</span>
              </div>
              <div className="flex justify-between">
                <span>Cached Lists:</span>
                <span className="text-purple-400">{cacheStats.lists}</span>
              </div>
              {pendingActions.length > 0 && (
                <div className="flex justify-between">
                  <span>Pending Actions:</span>
                  <span className="text-orange-400">{pendingActions.length}</span>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={clearExpiredCache}
              className="w-full mt-3 text-xs bg-transparent"
            >
              Clear Expired Cache
            </Button>
          </div>
        )}

        <Badge
          variant={isOnline ? "secondary" : "destructive"}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium shadow-lg cursor-pointer transition-all hover:scale-105"
          onClick={() => setShowDetails(!showDetails)}
        >
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4" />
              Online
              {pendingActions.length > 0 && (
                <>
                  <Clock className="w-4 h-4" />
                  {pendingActions.length} syncing
                </>
              )}
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              Offline Mode
              {pendingActions.length > 0 && (
                <>
                  <Clock className="w-4 h-4" />
                  {pendingActions.length} pending
                </>
              )}
            </>
          )}
          {(cacheStats.movies > 0 || cacheStats.searches > 0) && <Database className="w-4 h-4 text-blue-400" />}
        </Badge>
      </div>
    </div>
  )
}
