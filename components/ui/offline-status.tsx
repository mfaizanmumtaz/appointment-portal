import { WifiOff, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OfflineStatusProps {
  isOnline: boolean
  error: string | null
  lastUpdated: Date | null
  isRefreshing: boolean
  onRefresh: () => void
  showRefreshButton?: boolean
}

export function OfflineStatus({
  isOnline,
  error,
  lastUpdated,
  isRefreshing,
  onRefresh,
  showRefreshButton = true
}: OfflineStatusProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 rounded-full">
          <WifiOff className="w-4 h-4 text-orange-600" />
          <span className="text-sm text-orange-600 font-medium">Offline</span>
        </div>
      )}

      {/* Last updated timestamp */}
      {lastUpdated && (
        <span className="text-xs text-muted-foreground">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </span>
      )}

      {/* Connection error indicator */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-600">Connection issues</span>
        </div>
      )}

      {/* Refresh button */}
      {showRefreshButton && (
        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          disabled={isRefreshing || !isOnline}
          className="cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      )}
    </div>
  )
}

// Error banner component
interface ErrorBannerProps {
  error: string | null
}

export function ErrorBanner({ error }: ErrorBannerProps) {
  if (!error) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <p className="text-red-700">{error}</p>
      </div>
    </div>
  )
}