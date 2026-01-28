import { useCallback, useEffect, useRef, useState } from 'react'
import { useOnlineStatus } from './useOnlineStatus'
import { getPendingSyncCount, processSyncQueue } from '../lib/sync'

const SYNC_INTERVAL_MS = 30_000 // 30 seconds

export function useSync() {
  const isOnline = useOnlineStatus()
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refreshPendingCount = useCallback(async () => {
    const count = await getPendingSyncCount()
    setPendingCount(count)
  }, [])

  const sync = useCallback(async () => {
    if (!isOnline || isSyncing) {
      return
    }

    setIsSyncing(true)
    try {
      await processSyncQueue()
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
