import { useState, useEffect } from 'react'

interface UseOfflineOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseOfflineReturn {
  isOnline: boolean
  error: string | null
  lastUpdated: Date | null
  isRefreshing: boolean
  setError: (error: string | null) => void
  setLastUpdated: (date: Date | null) => void
  setIsRefreshing: (refreshing: boolean) => void
  executeWithOfflineCheck: <T>(fn: () => Promise<T>) => Promise<T | null>
}

export function useOffline(options: UseOfflineOptions = {}): UseOfflineReturn {
  const { autoRefresh = true, refreshInterval = 30000 } = options

  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setError(null)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setError("You're currently offline. Showing last available data.")
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [])

  // Function to execute async operations with offline checking
  const executeWithOfflineCheck = async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    // Don't execute if offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setError("You're currently offline. Showing last available data.")
      return null
    }

    setError(null)

    try {
      const result = await fn()
      setLastUpdated(new Date())
      setError(null)
      return result
    } catch (error) {
      console.error('Error executing function:', error)
      setError("Failed to load data. Please check your connection and try again.")
      setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true)
      return null
    }
  }

  return {
    isOnline,
    error,
    lastUpdated,
    isRefreshing,
    setError,
    setLastUpdated,
    setIsRefreshing,
    executeWithOfflineCheck,
  }
}

// Hook for auto-refreshing data
export function useAutoRefresh(
  fetchFunction: () => Promise<void>,
  options: UseOfflineOptions = {}
) {
  const { refreshInterval = 30000 } = options
  const { isOnline, executeWithOfflineCheck } = useOffline(options)

  useEffect(() => {
    // Initial fetch
    executeWithOfflineCheck(fetchFunction)

    // Set up auto-refresh
    const interval = setInterval(() => {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        executeWithOfflineCheck(fetchFunction)
      }
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [])

  return { isOnline, executeWithOfflineCheck }
}