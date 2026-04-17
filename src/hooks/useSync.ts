import { useCallback, useEffect, useRef, useState } from 'react'
import { useOnlineStatus } from './useOnlineStatus'
import { syncPendingSurveys } from '../lib/sync'
import { getPendingSurveysCount } from '../lib/surveyStorage'

const SYNC_INTERVAL_MS = 30_000 // 30 seconds
const TOKEN_KEY = 'ect_auth_token'

export function useSync() {
  const isOnline = useOnlineStatus()
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refreshPendingCount = useCallback(async () => {
    const count = await getPendingSurveysCount()
    setPendingCount(count)
  }, [])

  const sync = useCallback(async () => {
    if (!isOnline || isSyncing) return

    // Skip if the user isn't authenticated — otherwise a leftover pending
    // survey from a prior session would trigger a 401 and the axios
    // interceptor would redirect-loop.
    const token =
      localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
    if (!token) return

    setIsSyncing(true)
    try {
      await syncPendingSurveys()
      await refreshPendingCount()
    } finally {
      setIsSyncing(false)
    }
  }, [isOnline, isSyncing, refreshPendingCount])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline) {
      sync()
    }
  }, [isOnline]) // eslint-disable-line react-hooks/exhaustive-deps

  // Periodic sync while online
  useEffect(() => {
    if (isOnline) {
      intervalRef.current = setInterval(sync, SYNC_INTERVAL_MS)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isOnline, sync])

  // Load initial pending count
  useEffect(() => {
    refreshPendingCount()
  }, [refreshPendingCount])

  return { isOnline, pendingCount, isSyncing, sync, refreshPendingCount }
}
