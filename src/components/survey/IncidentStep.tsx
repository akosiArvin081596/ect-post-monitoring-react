import { useEffect, useState } from 'react'
import { useSurveyWizard } from '../../contexts/SurveyWizardContext'
import { fetchIncidents, type Incident } from '../../lib/incidents'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'

export function IncidentStep() {
  const { formData, updateFormData, nextStep, prevStep } = useSurveyWizard()
  const isOnline = useOnlineStatus()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setHasError(false)
      try {
        const items = await fetchIncidents()
        setIncidents(items)
        if (items.length === 1) {
          const incident = items[0]
          updateFormData({ incidentId: incident.id, incidentName: incident.name })
        }
      } catch {
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [updateFormData])

  const canProceed = !!formData.incidentId

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Incident Selection
      </h2>

      <div className="border border-blue-200 bg-blue-50 p-4 sm:p-5 dark:border-blue-800 dark:bg-blue-900/20">
        <p className="text-base text-gray-700 dark:text-gray-300">
          Select the incident this survey is monitoring. This keeps responses organized
          across multiple events.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 text-base text-gray-600 dark:text-gray-300">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          Loading incidents...
        </div>
      ) : incidents.length === 0 ? (
        <div className="border border-amber-200 bg-amber-50 p-4 text-base text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          {hasError
            ? 'Unable to load incidents. Please check your connection.'
            : 'No active incidents available. Please contact an administrator.'}
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map((incident) => {
            const isSelected = formData.incidentId === incident.id
            return (
              <label
                key={incident.id}
                className="block cursor-pointer border border-slate-200 bg-white p-4 transition hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-700 has-checked:border-blue-500 has-checked:bg-blue-50 dark:has-checked:bg-blue-900/30"
              >
                <input
                  type="radio"
                  name="incident"
                  value={incident.id}
                  checked={isSelected}
                  onChange={() =>
                    updateFormData({ incidentId: incident.id, incidentName: incident.name })
                  }
                  className="sr-only"
                />
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {incident.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {incident.type}
                      {incident.startsAt && ` · ${incident.startsAt}`}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                      Selected
                    </span>
                  )}
                </div>
                {incident.description && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {incident.description}
                  </p>
                )}
              </label>
            )
          })}
        </div>
      )}

      <div className="flex flex-col gap-3 pt-4 sm:flex-row">
        <button
          type="button"
          onClick={prevStep}
          className="flex-1 border border-gray-300 px-5 py-4 text-base font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={nextStep}
          disabled={!canProceed}
          className="flex-1 bg-blue-600 px-5 py-4 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {!isOnline && incidents.length > 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          You are offline. Incident list is loaded from the last cached data.
        </p>
      )}
    </div>
  )
}

