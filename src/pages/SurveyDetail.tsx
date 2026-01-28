import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getSurvey, deleteSurvey, markSurveyAsPending } from '../lib/surveyStorage'
import { syncSingleSurvey } from '../lib/sync'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { type OfflineSurvey } from '../lib/db'
import { initialSurveyFormData, type SurveyFormData } from '../lib/types'
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
        const parsed = JSON.parse(data.formData) as Partial<SurveyFormData>
        setFormData({ ...initialSurveyFormData, ...parsed })
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
        <div className="border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="mb-4 text-base text-slate-600 dark:text-slate-400">
            Survey not found
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-blue-600 px-5 py-3 text-base font-semibold text-white hover:bg-blue-700"
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
          <div className="mb-5 border border-red-200 bg-red-50 p-4 text-base text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            <p>Sync Error: {survey.errorMessage}</p>
          </div>
        )}

        <div className="border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900 dark:text-white">
            {formData.beneficiaryName || 'Unnamed Beneficiary'}
          </h2>

          <div className="space-y-5">
            {formData.incidentName && (
              <Section title="Incident">
                <InfoRow label="Incident" value={formData.incidentName} />
              </Section>
            )}
            <Section title="Beneficiary Information">
              <InfoRow label="Respondent" value={formData.respondentName} />
              <InfoRow label="Relationship" value={formData.relationshipToBeneficiary} />
              {formData.relationshipSpecify && (
                <InfoRow label="Relationship (Specify)" value={formData.relationshipSpecify} />
              )}
              <InfoRow label="Birthdate" value={formData.birthdate} />
              <InfoRow label="Age" value={formData.age.toString()} />
              <InfoRow label="Sex" value={formData.sex} />
              <InfoRow label="Beneficiary Classification" value={formData.beneficiaryClassification.join(', ')} />
              {formData.householdIdNo && (
                <InfoRow label="Household ID No." value={formData.householdIdNo} />
              )}
              <InfoRow label="Demographic Classification" value={formData.demographicClassification.join(', ')} />
              {formData.ipSpecify && (
                <InfoRow label="IP Group" value={formData.ipSpecify} />
              )}
              <InfoRow label="Highest Education" value={formData.highestEducationalAttainment} />
              {formData.educationalAttainmentSpecify && (
                <InfoRow label="Education (Specify)" value={formData.educationalAttainmentSpecify} />
              )}
            </Section>

            <Section title="Address">
              <InfoRow label="Province" value={formData.province} />
              <InfoRow label="District" value={formData.district} />
              <InfoRow label="Municipality" value={formData.municipality} />
              <InfoRow label="Barangay" value={formData.barangay} />
              {formData.sitioPurokStreet && (
                <InfoRow label="Sitio/Purok/Street" value={formData.sitioPurokStreet} />
              )}
              {formData.latitude && formData.longitude && (
                <>
                  <InfoRow label="GPS Coordinates" value={`${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}`} />
                  {formData.accuracy && (
                    <InfoRow label="GPS Accuracy" value={`${formData.accuracy.toFixed(1)}m`} />
                  )}
                </>
              )}
            </Section>

            <Section title="ECT Information">
              <InfoRow label="Type" value={formData.utilizationType} />
              <InfoRow
                label="Amount Received"
                value={`₱${formData.amountReceived.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
              />
              <InfoRow label="Date Received" value={formData.dateReceived} />
            </Section>

            <Section title="Expense Breakdown">
              <InfoRow label="Food" value={`₱${formData.expenseFood.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`} />
              <InfoRow label="Educational" value={`₱${formData.expenseEducational.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`} />
              <InfoRow label="House Rental" value={`₱${formData.expenseHouseRental.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`} />
              <InfoRow label="Medical" value={`₱${formData.expenseMedical.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`} />
              <InfoRow label="Non-Food Items" value={`₱${formData.expenseNonFoodItems.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`} />
              <InfoRow label="Utilities" value={`₱${formData.expenseUtilities.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`} />
              <InfoRow label="Shelter Materials" value={`₱${formData.expenseShelterMaterials.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`} />
              <InfoRow label="Transportation" value={`₱${formData.expenseTransportation.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`} />
              {formData.livelihoodTypes.length > 0 && (
                <>
                  <InfoRow label="Livelihood Types" value={formData.livelihoodTypes.join(', ')} />
                  {formData.livelihoodSpecify && (
                    <InfoRow label="Livelihood (Specify)" value={formData.livelihoodSpecify} />
                  )}
                  <InfoRow label="Livelihood Expense" value={`₱${formData.expenseLivelihood.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`} />
                </>
              )}
              {formData.expenseOthers > 0 && (
                <>
                  {formData.expenseOthersSpecify && (
                    <InfoRow label="Other Expense (Specify)" value={formData.expenseOthersSpecify} />
                  )}
                  <InfoRow label="Other Expenses" value={`₱${formData.expenseOthers.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`} />
                </>
              )}
              <div className="border-t border-gray-200 pt-3 mt-3 dark:border-gray-700">
                <InfoRow
                  label="Total Utilized"
                  value={`₱${totalUtilization.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
                  className="font-bold"
                />
                <InfoRow
                  label="Variance (Unutilized)"
                  value={`₱${variance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
                  className={variance < 0 ? 'text-red-600 font-bold' : variance > 0 ? 'text-amber-600 font-bold' : 'text-green-600 font-bold'}
                />
              </div>
              {formData.reasonNotFullyUtilized && (
                <InfoRow label="Reason Not Fully Utilized" value={formData.reasonNotFullyUtilized} />
              )}
            </Section>

            <Section title="Interviewer">
              <InfoRow label="Interviewed By" value={formData.interviewedBy} />
              <InfoRow label="Position" value={formData.position} />
              <InfoRow label="Modality" value={formData.surveyModality} />
              {formData.modalitySpecify && (
                <InfoRow label="Modality (Specify)" value={formData.modalitySpecify} />
              )}
            </Section>

            {(survey.photoWithIdBase64 || survey.respondentSignatureBase64 || survey.interviewerSignatureBase64) && (
              <Section title="Attachments">
                {survey.photoWithIdBase64 && (
                  <div className="mb-4">
                    <p className="mb-2 text-base text-gray-600 dark:text-gray-400">Photo with ID</p>
                    <img
                      src={survey.photoWithIdBase64}
                      alt="Beneficiary with ID"
                      className="max-w-full h-auto border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                )}
                {survey.respondentSignatureBase64 && (
                  <div className="mb-4">
                    <p className="mb-2 text-base text-gray-600 dark:text-gray-400">Respondent Signature</p>
                    <img
                      src={survey.respondentSignatureBase64}
                      alt="Respondent Signature"
                      className="max-w-full h-auto border border-gray-300 dark:border-gray-600 bg-white"
                    />
                  </div>
                )}
                {survey.interviewerSignatureBase64 && (
                  <div className="mb-4">
                    <p className="mb-2 text-base text-gray-600 dark:text-gray-400">Interviewer Signature</p>
                    <img
                      src={survey.interviewerSignatureBase64}
                      alt="Interviewer Signature"
                      className="max-w-full h-auto border border-gray-300 dark:border-gray-600 bg-white"
                    />
                  </div>
                )}
              </Section>
            )}

            <Section title="Status">
              <InfoRow label="Survey Status" value={survey.status.charAt(0).toUpperCase() + survey.status.slice(1)} />
              {survey.serverId && (
                <InfoRow label="Server ID" value={survey.serverId.toString()} />
              )}
              <InfoRow label="Last Updated" value={new Date(survey.updatedAt).toLocaleString()} />
            </Section>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {(survey.status === 'draft' || survey.status === 'error') && (
              <Link
                to={`/survey/${survey.clientUuid}/edit`}
                className="flex-1 border border-blue-600 bg-white px-5 py-4 text-center text-base font-semibold text-blue-600 hover:bg-blue-50 dark:bg-transparent dark:hover:bg-blue-900/20"
              >
                Edit Survey
              </Link>
            )}
            {survey.status === 'draft' && (
              <>
                <button
                  onClick={handleSync}
                  disabled={!isOnline || isSyncing}
                  className="flex-1 bg-emerald-600 px-5 py-4 text-base font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSyncing ? 'Syncing...' : 'Submit & Sync'}
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 px-5 py-4 text-base font-semibold text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </>
            )}
            {survey.status === 'pending' && isOnline && (
              <button
                onClick={handleRetry}
                disabled={isSyncing}
                className="flex-1 bg-blue-600 px-5 py-4 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
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
                    className="flex-1 bg-blue-600 px-5 py-4 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSyncing ? 'Retrying...' : 'Retry Sync'}
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="bg-red-600 px-5 py-4 text-base font-semibold text-white hover:bg-red-700"
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
