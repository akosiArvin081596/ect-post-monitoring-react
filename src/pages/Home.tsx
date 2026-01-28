import { useOnlineStatus } from '../hooks/useOnlineStatus'

export function Home() {
  const isOnline = useOnlineStatus()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
        Post Monitoring
      </h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        {isOnline
          ? 'Connected - data syncs automatically.'
          : 'Offline - data will sync when reconnected.'}
      </p>
      <div className="w-full max-w-md border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Your app is ready. Start building your features here.
        </p>
      </div>
    </div>
  )
}
