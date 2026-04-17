import { useEffect, useState } from 'react'
import { useSurveyWizard } from '../../contexts/SurveyWizardContext'
import { TextInput } from '../ui/TextInput'
import { SelectInput } from '../ui/SelectInput'
import { detectDevice } from '../../lib/device'

const modalityOptions = [
  { value: 'Face-to-face', label: 'Face-to-face' },
  { value: 'Phone', label: 'Phone' },
  { value: 'Video Call', label: 'Video Call' },
  { value: 'Others', label: 'Others (specify)' },
]

const deviceOptions = [
  { value: 'Mobile', label: 'Mobile' },
  { value: 'Tablet', label: 'Tablet' },
  { value: 'Desktop', label: 'Desktop' },
]

export function InterviewerStep() {
  const {
    formData,
    updateFormData,
    prevStep,
    submitSurvey,
    isSubmitting,
    calculateTotalUtilization,
    calculateVariance,
  } = useSurveyWizard()

  const [isEditingDevice, setIsEditingDevice] = useState(false)

  // Auto-populate surveyor_device and survey_modality on mount if empty.
  // Detection is pointer + width based, not UA sniffing.
  // Always face-to-face in this deployment, so modality defaults accordingly.
  useEffect(() => {
    const patch: Partial<{
      surveyorDevice: 'Mobile' | 'Tablet' | 'Desktop'
      surveyModality: string
    }> = {}
    if (!formData.surveyorDevice) {
      patch.surveyorDevice = detectDevice()
    }
    if (!formData.surveyModality) {
      patch.surveyModality = 'Face-to-face'
    }
    if (Object.keys(patch).length > 0) {
      updateFormData(patch)
    }
    // Run once on mount — we intentionally don't want this re-firing later.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canSubmit =
    formData.interviewedBy &&
    formData.position &&
    formData.surveyModality &&
    (formData.surveyModality !== 'Others' || formData.modalitySpecify)

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Interviewer Information
      </h2>

      <TextInput
        label="Interviewed By"
        value={formData.interviewedBy}
        onChange={(v) => updateFormData({ interviewedBy: v })}
        required
      />

      <TextInput
        label="Position"
        value={formData.position}
        onChange={(v) => updateFormData({ position: v })}
        required
      />

      <SelectInput
        label="Survey Modality"
        options={modalityOptions}
        value={formData.surveyModality}
        onChange={(v) => updateFormData({ surveyModality: v })}
        required
      />

      {formData.surveyModality === 'Others' && (
        <TextInput
          label="Specify Modality"
          value={formData.modalitySpecify}
          onChange={(v) => updateFormData({ modalitySpecify: v })}
          required
        />
      )}

      {/* Recording device — auto-detected, overrideable */}
      <div>
        <label className="mb-2 block text-base font-medium text-gray-700 dark:text-gray-300">
          Recording Device
        </label>
        {isEditingDevice ? (
          <SelectInput
            label=""
            options={deviceOptions}
            value={formData.surveyorDevice ?? ''}
            onChange={(v) => {
              updateFormData({ surveyorDevice: v as 'Mobile' | 'Tablet' | 'Desktop' })
              setIsEditingDevice(false)
            }}
          />
        ) : (
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 border border-gray-300 bg-gray-50 px-3 py-2 text-base text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
              <span className="font-semibold">{formData.surveyorDevice ?? 'Detecting...'}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">(auto-detected)</span>
            </span>
            <button
              type="button"
              onClick={() => setIsEditingDevice(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Change
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 border border-gray-200 bg-gray-50 p-4 sm:mt-6 sm:p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Summary
        </h3>
        <div className="space-y-3 text-base">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-gray-600 dark:text-gray-400">Beneficiary:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formData.beneficiaryName}
            </span>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-gray-600 dark:text-gray-400">Location:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formData.barangay}, {formData.municipality}
            </span>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-gray-600 dark:text-gray-400">ECT Type:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formData.utilizationType}
            </span>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-gray-600 dark:text-gray-400">Amount Received:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              ₱{formData.amountReceived.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-gray-600 dark:text-gray-400">Total Utilized:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              ₱{calculateTotalUtilization().toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-gray-600 dark:text-gray-400">Variance:</span>
            <span
              className={`font-semibold ${calculateVariance() < 0 ? 'text-red-600' : calculateVariance() > 0 ? 'text-amber-600' : 'text-green-600'}`}
            >
              ₱{calculateVariance().toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4 sm:flex-row">
        <button
          type="button"
          onClick={prevStep}
          disabled={isSubmitting}
          className="flex-1 border border-gray-300 px-5 py-4 text-base font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={submitSurvey}
          disabled={!canSubmit || isSubmitting}
          className="flex-1 bg-green-600 px-5 py-4 text-base font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Survey'}
        </button>
      </div>
    </div>
  )
}
