import { useSurveyWizard } from '../../contexts/SurveyWizardContext'

export function ConsentStep() {
  const { formData, updateFormData, nextStep } = useSurveyWizard()

  const handleAgree = () => {
    updateFormData({ consentAgreed: true })
    nextStep()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Privacy Notice and Consent
      </h2>

      <div className="rounded border border-blue-200 bg-blue-50 p-4 sm:p-5 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-base text-gray-700 dark:text-gray-300">
            The Department of Social Welfare and Development (DSWD) is committed
            to protecting your personal information in compliance with Republic
            Act No. 10173, otherwise known as the Data Privacy Act of 2012.
          </p>
          <p className="mt-4 text-base text-gray-700 dark:text-gray-300">
            The information collected in this ECT Utilization Monitoring Form
            will be used solely for the purpose of monitoring and evaluating the
            utilization of Emergency Cash Transfer (ECT) assistance provided to
            beneficiaries.
          </p>
          <p className="mt-4 text-base text-gray-700 dark:text-gray-300">
            By proceeding with this survey, you consent to the collection,
            processing, and storage of the information you provide for the
            above-stated purposes.
          </p>
        </div>
      </div>

      <div className="rounded border border-gray-200 bg-gray-50 p-4 sm:p-5 dark:border-gray-700 dark:bg-gray-800">
        <p className="mb-4 text-base text-gray-700 dark:text-gray-300">
          Do you agree to participate in this survey and provide your consent
          for the collection and processing of your personal information?
        </p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleAgree}
            className="flex-1 rounded bg-blue-600 px-5 py-4 text-base font-semibold text-white hover:bg-blue-700"
          >
            Yes, I Agree
          </button>
        </div>
      </div>

      {formData.consentAgreed && (
        <p className="text-base text-green-600 dark:text-green-400">
          Consent recorded. You may proceed to the next step.
        </p>
      )}
    </div>
  )
}
