import { useSurveyWizard } from '../../contexts/SurveyWizardContext'
import { DecimalInput } from '../ui/DecimalInput'
import { DateInput } from '../ui/DateInput'
import { CheckboxGroup } from '../ui/CheckboxGroup'
import { TextInput } from '../ui/TextInput'
import { TextArea } from '../ui/TextArea'

const livelihoodOptions = [
  { value: 'Farming', label: 'Farming' },
  { value: 'Fishing', label: 'Fishing' },
  { value: 'Vending/Sari-sari Store', label: 'Vending/Sari-sari Store' },
  { value: 'Livestock', label: 'Livestock' },
  { value: 'Others', label: 'Others (specify)' },
]

export function ExpenseBreakdownStep() {
  const {
    formData,
    updateFormData,
    nextStep,
    prevStep,
    calculateTotalUtilization,
    calculateVariance,
  } = useSurveyWizard()

  const today = new Date().toISOString().split('T')[0]
  const totalUtilization = calculateTotalUtilization()
  const variance = calculateVariance()

  const canProceed =
    formData.amountReceived > 0 &&
    formData.dateReceived &&
    (variance >= 0 || formData.reasonNotFullyUtilized)

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Expense Breakdown
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <DecimalInput
          label="Amount Received"
          value={formData.amountReceived}
          onChange={(v) => updateFormData({ amountReceived: v })}
          prefix="₱"
          required
        />
        <DateInput
          label="Date Received"
          value={formData.dateReceived}
          onChange={(v) => updateFormData({ dateReceived: v })}
          max={today}
          required
        />
      </div>

      <div className="rounded-lg bg-gray-100 p-5 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Expense Categories
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <DecimalInput
            label="Food"
            value={formData.expenseFood}
            onChange={(v) => updateFormData({ expenseFood: v })}
            prefix="₱"
            required
          />
          <DecimalInput
            label="Educational"
            value={formData.expenseEducational}
            onChange={(v) => updateFormData({ expenseEducational: v })}
            prefix="₱"
            required
          />
          <DecimalInput
            label="House Rental"
            value={formData.expenseHouseRental}
            onChange={(v) => updateFormData({ expenseHouseRental: v })}
            prefix="₱"
            required
          />
          <DecimalInput
            label="Medical"
            value={formData.expenseMedical}
            onChange={(v) => updateFormData({ expenseMedical: v })}
            prefix="₱"
            required
          />
          <DecimalInput
            label="Non-Food Items"
            value={formData.expenseNonFoodItems}
            onChange={(v) => updateFormData({ expenseNonFoodItems: v })}
            prefix="₱"
            required
          />
          <DecimalInput
            label="Utilities"
            value={formData.expenseUtilities}
            onChange={(v) => updateFormData({ expenseUtilities: v })}
            prefix="₱"
            required
          />
          <DecimalInput
            label="Shelter Materials"
            value={formData.expenseShelterMaterials}
            onChange={(v) => updateFormData({ expenseShelterMaterials: v })}
            prefix="₱"
            required
          />
          <DecimalInput
            label="Transportation"
            value={formData.expenseTransportation}
            onChange={(v) => updateFormData({ expenseTransportation: v })}
            prefix="₱"
            required
          />
        </div>
      </div>

      <div className="rounded-lg bg-gray-100 p-5 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Livelihood Expenses
        </h3>

        <CheckboxGroup
          label="Types of Livelihood"
          options={livelihoodOptions}
          value={formData.livelihoodTypes}
          onChange={(v) => updateFormData({ livelihoodTypes: v })}
        />

        {formData.livelihoodTypes.includes('Others') && (
          <TextInput
            label="Specify Other Livelihood"
            value={formData.livelihoodSpecify}
            onChange={(v) => updateFormData({ livelihoodSpecify: v })}
          />
        )}

        <DecimalInput
          label="Livelihood Expense Amount"
          value={formData.expenseLivelihood}
          onChange={(v) => updateFormData({ expenseLivelihood: v })}
          prefix="₱"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextInput
          label="Other Expense (specify)"
          value={formData.expenseOthersSpecify}
          onChange={(v) => updateFormData({ expenseOthersSpecify: v })}
        />
        <DecimalInput
          label="Other Amount"
          value={formData.expenseOthers}
          onChange={(v) => updateFormData({ expenseOthers: v })}
          prefix="₱"
          required
        />
      </div>

      <div className="rounded-lg bg-blue-50 p-5 dark:bg-blue-900/20">
        <div className="flex flex-col gap-1 text-base sm:flex-row sm:justify-between">
          <span className="text-gray-700 dark:text-gray-300">Total Utilization:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            ₱{totalUtilization.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="mt-3 flex flex-col gap-1 text-base sm:flex-row sm:justify-between">
          <span className="text-gray-700 dark:text-gray-300">Variance (Unutilized):</span>
          <span
            className={`font-semibold ${variance < 0 ? 'text-red-600' : variance > 0 ? 'text-amber-600' : 'text-green-600'}`}
          >
            ₱{variance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {variance > 0 && (
        <TextArea
          label="Reason for Not Fully Utilized"
          value={formData.reasonNotFullyUtilized}
          onChange={(v) => updateFormData({ reasonNotFullyUtilized: v })}
          required={variance > 0}
        />
      )}

      {variance < 0 && (
        <div className="rounded-lg bg-red-50 p-4 text-base text-red-700 dark:bg-red-900/20 dark:text-red-400">
          Total expenses exceed the amount received. Please verify the entries.
        </div>
      )}

      <div className="flex flex-col gap-3 pt-4 sm:flex-row">
        <button
          type="button"
          onClick={prevStep}
          className="flex-1 rounded-lg border border-gray-300 px-5 py-4 text-base font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={nextStep}
          disabled={!canProceed}
          className="flex-1 rounded-lg bg-blue-600 px-5 py-4 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
