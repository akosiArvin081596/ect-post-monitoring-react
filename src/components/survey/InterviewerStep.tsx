import { useSurveyWizard } from '../../contexts/SurveyWizardContext'
import { TextInput } from '../ui/TextInput'
import { SelectInput } from '../ui/SelectInput'

const modalityOptions = [
  { value: 'Face-to-face', label: 'Face-to-face' },
  { value: 'Phone', label: 'Phone' },
  { value: 'Video Call', label: 'Video Call' },
  { value: 'Others', label: 'Others (specify)' },
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

      <div className="mt-5 rounded border border-gray-200 bg-gray-50 p-4 sm:mt-6 sm:p-5 dark:border-gray-700 dark:bg-gray-800">
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
          className="flex-1 rounded border border-gray-300 px-5 py-4 text-base font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={submitSurvey}
          disabled={!canSubmit || isSubmitting}
          className="flex-1 rounded bg-green-600 px-5 py-4 text-base font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Survey'}
        </button>
      </div>
    </div>
  )
}
