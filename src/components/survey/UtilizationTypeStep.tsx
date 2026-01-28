import { useSurveyWizard } from '../../contexts/SurveyWizardContext'
import { RadioGroup } from '../ui/RadioGroup'

const utilizationTypeOptions = [
  {
    value: 'Relief/Response',
    label: 'Relief/Response',
  },
  {
    value: 'Recovery/Rehabilitation',
    label: 'Recovery/Rehabilitation',
  },
]

export function UtilizationTypeStep() {
  const { formData, updateFormData, nextStep, prevStep } = useSurveyWizard()

  const canProceed = !!formData.utilizationType

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Type of ECT Utilization
      </h2>

      <div className="rounded border border-blue-200 bg-blue-50 p-4 sm:p-5 dark:border-blue-800 dark:bg-blue-900/20">
        <p className="text-base text-gray-700 dark:text-gray-300">
          Please select the type of Emergency Cash Transfer (ECT) assistance
          that was received.
        </p>
      </div>

      <RadioGroup
        label="ECT Utilization Type"
        options={utilizationTypeOptions}
        value={formData.utilizationType}
        onChange={(v) => updateFormData({ utilizationType: v })}
        required
      />

      <div className="rounded border border-gray-200 bg-gray-50 p-4 sm:p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
          Description:
        </h3>
        {formData.utilizationType === 'Relief/Response' && (
          <p className="text-base text-gray-600 dark:text-gray-400">
            ECT assistance provided during the immediate response phase of a
            disaster or emergency to meet basic survival needs.
          </p>
        )}
        {formData.utilizationType === 'Recovery/Rehabilitation' && (
          <p className="text-base text-gray-600 dark:text-gray-400">
            ECT assistance provided during the recovery phase to help
            beneficiaries restore their livelihood and rebuild their lives.
          </p>
        )}
        {!formData.utilizationType && (
          <p className="text-base text-gray-500 italic dark:text-gray-500">
            Select a type to see its description.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 pt-4 sm:flex-row">
        <button
          type="button"
          onClick={prevStep}
          className="flex-1 rounded border border-gray-300 px-5 py-4 text-base font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={nextStep}
          disabled={!canProceed}
          className="flex-1 rounded bg-blue-600 px-5 py-4 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
