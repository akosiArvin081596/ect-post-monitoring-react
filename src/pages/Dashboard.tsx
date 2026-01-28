import { useEffect, useState } from 'react'
import { Link, useSearchParams, type Location } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  listAllSurveys,
  getPendingSurveysCount,
  getDraftSurveysCount,
  getSyncedSurveysCount,
} from '../lib/surveyStorage'
import { syncPendingSurveys, syncServerSurveys } from '../lib/sync'
import { cacheAddresses, isAddressCacheEmpty } from '../lib/addressCache'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { type OfflineSurvey } from '../lib/db'
import { type SurveyFormData } from '../lib/types'
import { AppShell } from '../components/ui/AppShell'

export function Dashboard() {
  const { user, logout } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const isOnline = useOnlineStatus()
  const [surveys, setSurveys] = useState<OfflineSurvey[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [draftCount, setDraftCount] = useState(0)
  const [syncedCount, setSyncedCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)

  const refreshData = async (options?: { includeServer?: boolean }) => {
    if (options?.includeServer && isOnline) {
      try {
        await syncServerSurveys()
      } catch (error) {
        console.error('Failed to sync server surveys:', error)
      }
    }
    const [allSurveys, pending, drafts, synced] = await Promise.all([
      listAllSurveys(),
      getPendingSurveysCount(),
      getDraftSurveysCount(),
      getSyncedSurveysCount(),
    ])
    setSurveys(allSurveys)
    setPendingCount(pending)
    setDraftCount(drafts)
    setSyncedCount(synced)
  }

  useEffect(() => {
    refreshData({ includeServer: true })

    // Cache addresses on first load if online
    const initAddresses = async () => {
      if (isOnline && (await isAddressCacheEmpty())) {
        setIsLoadingAddresses(true)
        try {
          await cacheAddresses()
        } catch (e) {
          console.error('Failed to cache addresses:', e)
        }
        setIsLoadingAddresses(false)
      }
    }
    initAddresses()
  }, [isOnline])

  const handleSync = async () => {
    if (!isOnline || isSyncing) return
    setIsSyncing(true)
    try {
      await syncPendingSurveys()
      await refreshData({ includeServer: true })
    } finally {
      setIsSyncing(false)
    }
  }

  const getStatusBadge = (status: OfflineSurvey['status']) => {
    const styles = {
      draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      synced: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    }
    return (
      <span className={`px-3 py-1 text-base font-medium ${styles[status]}`}>
        {status}
      </span>
    )
  }

  const activeTab = searchParams.get('tab') === 'surveys' ? 'surveys' : 'overview'
  const setTab = (tab: 'overview' | 'surveys') => {
    setSearchParams({ tab })
  }

  const navItems = [
    {
      to: '/?tab=overview',
      label: 'Overview',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
          <path d="M3 11.5L12 4l9 7.5v7a1 1 0 0 1-1 1h-5.5a.5.5 0 0 1-.5-.5V13h-4v6a.5.5 0 0 1-.5.5H4a1 1 0 0 1-1-1v-7Z" />
        </svg>
      ),
      isActive: () => activeTab === 'overview',
    },
    {
      to: '/?tab=surveys',
      label: 'Surveys',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
          <path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm1 4a1 1 0 0 0 0 2h10a1 1 0 1 0 0-2H7Zm0 4a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H7Z" />
        </svg>
      ),
      isActive: () => activeTab === 'surveys',
    },
    {
      to: '/survey/new',
      label: 'New',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
          <path d="M11 5a1 1 0 1 1 2 0v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6V5Z" />
        </svg>
      ),
      isActive: (location: Location) => location.pathname === '/survey/new',
    },
  ]

  return (
    <AppShell
      title="ECT Monitoring"
      subtitle={user?.name}
      action={
        <button
          onClick={logout}
          className="border border-white/30 px-4 py-2 text-base font-semibold text-white hover:bg-white/15"
        >
          Logout
        </button>
      }
      navItems={navItems}
    >
      <div className="flex flex-col gap-5">
        <div className="border border-blue-200 bg-blue-50 p-4 text-base text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold">Survey Activity</p>
              <p className="text-base text-blue-700/90 dark:text-blue-200/80">
                Track data collection and sync status at a glance.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTab('overview')}
                className={`px-4 py-2 text-base font-semibold transition ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white'
                    : 'border border-blue-200 bg-white text-blue-700'
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setTab('surveys')}
                className={`px-4 py-2 text-base font-semibold transition ${
                  activeTab === 'surveys'
                    ? 'bg-blue-600 text-white'
                    : 'border border-blue-200 bg-white text-blue-700'
                }`}
              >
                Surveys
              </button>
            </div>
          </div>
        </div>

        {isLoadingAddresses && (
          <div className="border border-amber-200 bg-amber-50 p-4 text-base text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            Downloading address data for offline use...
          </div>
        )}

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="border border-slate-200 bg-white p-5 text-center dark:border-slate-700 dark:bg-slate-900">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {syncedCount}
                </div>
                <div className="text-base text-slate-600 dark:text-slate-400">Synced</div>
              </div>
              <div className="border border-slate-200 bg-white p-5 text-center dark:border-slate-700 dark:bg-slate-900">
                <div className="text-3xl font-bold text-amber-600">{pendingCount}</div>
                <div className="text-base text-slate-600 dark:text-slate-400">Pending</div>
              </div>
              <div className="border border-slate-200 bg-white p-5 text-center dark:border-slate-700 dark:bg-slate-900">
                <div className="text-3xl font-bold text-slate-500">{draftCount}</div>
                <div className="text-base text-slate-600 dark:text-slate-400">Drafts</div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/survey/new"
                className="flex-1 bg-blue-600 px-5 py-4 text-center text-base font-semibold text-white hover:bg-blue-700"
              >
                Start New Survey
              </Link>
              {pendingCount > 0 && isOnline && (
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="bg-emerald-600 px-5 py-4 text-base font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSyncing ? 'Syncing...' : 'Sync Pending'}
                </button>
              )}
            </div>
          </>
        )}

        {activeTab === 'surveys' && (
          <div className="border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Recent Surveys
              </h2>
            </div>

            {surveys.length === 0 ? (
              <div className="p-8 text-center text-base text-slate-500 dark:text-slate-400">
                No surveys yet. Create your first survey.
              </div>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                {surveys.slice(0, 10).map((survey) => {
                  const data = JSON.parse(survey.formData) as SurveyFormData
                  return (
                    <li key={survey.clientUuid}>
                      <Link
                        to={`/survey/${survey.clientUuid}`}
                        className="block px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-base font-semibold text-slate-900 dark:text-white">
                              {data.beneficiaryName || 'Unnamed'}
                            </p>
                            <p className="text-base text-slate-600 dark:text-slate-400">
                              {data.municipality || 'No location'} -{' '}
                              {new Date(survey.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          {getStatusBadge(survey.status)}
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
