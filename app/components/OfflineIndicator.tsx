"use client"

import { useOffline } from "@/app/hooks/useOffline"
import { WifiOff, Wifi, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function OfflineIndicator() {
  const { isOnline, pendingActions } = useOffline()

  if (isOnline && pendingActions.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge
        variant={isOnline ? "secondary" : "destructive"}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium shadow-lg"
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
      </Badge>
    </div>
  )
}
