import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getSurvey, deleteSurvey, markSurveyAsPending } from '../lib/surveyStorage'
import { syncSingleSurvey } from '../lib/sync'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { type OfflineSurvey } from '../lib/db'
import { type SurveyFormData } from '../lib/types'
import { AppShell } from '../components/ui/AppShell'

export function SurveyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isOnline = useOnlineStatus()
  const [survey, setSurvey] = useState<OfflineSurvey | null>(null)
  const [formData, setFormData] = useState<SurveyFormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!id) return
      const data = await getSurvey(id)
      if (data) {
        setSurvey(data)
        setFormData(JSON.parse(data.formData) as SurveyFormData)
      }
      setIsLoading(false)
    }
    load()
  }, [id])

  const handleDelete = async () => {
    if (!id) return
    if (confirm('Are you sure you want to delete this survey?')) {
      await deleteSurvey(id)
      navigate('/')
    }
  }

  const handleSync = async () => {
    if (!id || !isOnline || isSyncing) return
    setIsSyncing(true)
    try {
      await markSurveyAsPending(id)
      await syncSingleSurvey(id)
      const updated = await getSurvey(id)
      if (updated) {
        setSurvey(updated)
      }
    } finally {
      setIsSyncing(false)
    }
  }

  const handleRetry = async () => {
    if (!id || !isOnline || isSyncing) return
    setIsSyncing(true)
    try {
      await markSurveyAsPending(id)
      await syncSingleSurvey(id)
      const updated = await getSurvey(id)
      if (updated) {
        setSurvey(updated)
      }
    } finally {
      setIsSyncing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (!survey || !formData) {
    return (
      <AppShell title="Survey Details" backTo="/" showNav={false}>
        <div className="rounded border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="mb-4 text-base text-slate-600 dark:text-slate-400">
            Survey not found
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded bg-blue-600 px-5 py-3 text-base font-semibold text-white hover:bg-blue-700"
          >
            Return to Dashboard
          </Link>
        </div>
      </AppShell>
    )
  }

  const totalUtilization =
    formData.expenseFood +
    formData.expenseEducational +
    formData.expenseHouseRental +
    formData.expenseLivelihood +
    formData.expenseMedical +
    formData.expenseNonFoodItems +
    formData.expenseUtilities +
    formData.expenseShelterMaterials +
    formData.expenseTransportation +
    formData.expenseOthers

  const variance = formData.amountReceived - totalUtilization

  return (
      <AppShell title="Survey Details" backTo="/" showNav={false}>
        {survey.status === 'error' && survey.errorMessage && (
          <div className="mb-5 rounded border border-red-200 bg-red-50 p-4 text-base text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            <p>Sync Error: {survey.errorMessage}</p>
          </div>
        )}

        <div className="rounded border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900 dark:text-white">
            {formData.beneficiaryName || 'Unnamed Beneficiary'}
          </h2>

          <div className="space-y-5">
            <Section title="Beneficiary Information">
              <InfoRow label="Respondent" value={formData.respondentName} />
              <InfoRow label="Relationship" value={formData.relationshipToBeneficiary} />
              <InfoRow label="Age" value={formData.age.toString()} />
              <InfoRow label="Sex" value={formData.sex} />
              <InfoRow label="Classification" value={formData.beneficiaryClassification.join(', ')} />
            </Section>

            <Section title="Address">
              <InfoRow label="Province" value={formData.province} />
              <InfoRow label="District" value={formData.district} />
              <InfoRow label="Municipality" value={formData.municipality} />
              <InfoRow label="Barangay" value={formData.barangay} />
            </Section>

            <Section title="ECT Information">
              <InfoRow label="Type" value={formData.utilizationType} />
              <InfoRow
                label="Amount Received"
                value={`₱${formData.amountReceived.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
              />
              <InfoRow label="Date Received" value={formData.dateReceived} />
              <InfoRow
                label="Total Utilized"
                value={`₱${totalUtilization.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
              />
              <InfoRow
                label="Variance"
                value={`₱${variance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
                className={variance < 0 ? 'text-red-600' : variance > 0 ? 'text-amber-600' : 'text-green-600'}
              />
            </Section>

            <Section title="Interviewer">
              <InfoRow label="Interviewed By" value={formData.interviewedBy} />
              <InfoRow label="Position" value={formData.position} />
              <InfoRow label="Modality" value={formData.surveyModality} />
            </Section>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {(survey.status === 'draft' || survey.status === 'error') && (
              <Link
                to={`/survey/${survey.clientUuid}/edit`}
                className="flex-1 rounded border border-blue-600 bg-white px-5 py-4 text-center text-base font-semibold text-blue-600 hover:bg-blue-50 dark:bg-transparent dark:hover:bg-blue-900/20"
              >
                Edit Survey
              </Link>
            )}
            {survey.status === 'draft' && (
              <>
                <button
                  onClick={handleSync}
                  disabled={!isOnline || isSyncing}
                  className="flex-1 rounded bg-emerald-600 px-5 py-4 text-base font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSyncing ? 'Syncing...' : 'Submit & Sync'}
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded bg-red-600 px-5 py-4 text-base font-semibold text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </>
            )}
            {survey.status === 'pending' && isOnline && (
              <button
                onClick={handleRetry}
                disabled={isSyncing}
                className="flex-1 rounded bg-blue-600 px-5 py-4 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            )}
            {survey.status === 'error' && (
              <>
                {isOnline && (
                  <button
                    onClick={handleRetry}
                    disabled={isSyncing}
                    className="flex-1 rounded bg-blue-600 px-5 py-4 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSyncing ? 'Retrying...' : 'Retry Sync'}
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="rounded bg-red-600 px-5 py-4 text-base font-semibold text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </AppShell>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
      <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function InfoRow({
  label,
  value,
  className = '',
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className="flex flex-col gap-1 text-base sm:flex-row sm:items-center sm:justify-between">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className={`font-semibold text-gray-900 dark:text-white ${className}`}>
        {value || '-'}
      </span>
    </div>
  )
}
