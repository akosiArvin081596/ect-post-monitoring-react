import { useSync } from '../hooks/useSync'

export function NetworkStatus() {
  const { isOnline, pendingCount, isSyncing, sync } = useSync()

  return (
    <div className="fixed bottom-24 right-4 flex items-center gap-3 border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
      <span
        className={`inline-block h-3 w-3 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
      />
      <span className="text-base text-gray-700 dark:text-gray-300">
        {isOnline ? 'Online' : 'Offline'}
      </span>

      {pendingCount > 0 && (
        <>
          <span className="text-base text-gray-400">|</span>
          <span className="text-base text-amber-600 dark:text-amber-400">
            {pendingCount} pending
          </span>
          {isOnline && (
            <button
              onClick={sync}
              disabled={isSyncing}
              className="bg-blue-600 px-4 py-2 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSyncing ? 'Syncing...' : 'Sync'}
            </button>
          )}
        </>
      )}
    </div>
  )
}
