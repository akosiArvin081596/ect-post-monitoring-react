interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  labels?: string[]
}

export function StepIndicator({
  currentStep,
  totalSteps,
  labels,
}: StepIndicatorProps) {
  return (
    <div className="mb-5 sm:mb-7">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex flex-1 items-center">
            <div
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded text-base font-medium sm:h-11 sm:w-11 sm:text-lg ${
                step < currentStep
                  ? 'bg-blue-600 text-white'
                  : step === currentStep
                    ? 'border-2 border-blue-600 bg-white text-blue-600 dark:bg-gray-800'
                    : 'border-2 border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800'
              }`}
            >
              {step < currentStep ? (
                <svg
                  className="h-6 w-6 sm:h-7 sm:w-7"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                step
              )}
            </div>
            {step < totalSteps && (
              <div
                className={`mx-1 h-1.5 flex-1 sm:mx-0 sm:h-2 ${
                  step < currentStep
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      {labels && labels[currentStep - 1] && (
        <p className="mt-4 text-center text-base font-medium text-gray-700 sm:text-lg dark:text-gray-300">
          {labels[currentStep - 1]}
        </p>
      )}
    </div>
  )
}
