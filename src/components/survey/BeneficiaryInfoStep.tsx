import { useSurveyWizard } from '../../contexts/SurveyWizardContext'
import { TextInput } from '../ui/TextInput'
import { DateInput } from '../ui/DateInput'
import { RadioGroup } from '../ui/RadioGroup'
import { CheckboxGroup } from '../ui/CheckboxGroup'
import { SelectInput } from '../ui/SelectInput'

const relationshipOptions = [
  { value: 'Self', label: 'Self' },
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Child', label: 'Child' },
  { value: 'Parent', label: 'Parent' },
  { value: 'Sibling', label: 'Sibling' },
  { value: 'Others', label: 'Others (specify)' },
]

const beneficiaryClassificationOptions = [
  { value: '4Ps', label: '4Ps' },
  { value: 'Non-4Ps', label: 'Non-4Ps' },
  { value: 'IP', label: 'Indigenous People' },
  { value: 'Senior Citizen', label: 'Senior Citizen' },
]

const sexOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
]

const demographicOptions = [
  { value: 'Indigenous People', label: 'Indigenous People' },
  { value: 'Senior Citizen', label: 'Senior Citizen' },
  { value: 'PWD', label: 'Person with Disability' },
  { value: 'Solo Parent', label: 'Solo Parent' },
  { value: 'Pregnant/Lactating', label: 'Pregnant/Lactating' },
  { value: 'None', label: 'None' },
]

const educationOptions = [
  { value: 'No Formal Education', label: 'No Formal Education' },
  { value: 'Elementary Level', label: 'Elementary Level' },
  { value: 'Elementary Graduate', label: 'Elementary Graduate' },
  { value: 'High School Level', label: 'High School Level' },
  { value: 'High School Graduate', label: 'High School Graduate' },
  { value: 'Vocational', label: 'Vocational' },
  { value: 'College Level', label: 'College Level' },
  { value: 'College Graduate', label: 'College Graduate' },
  { value: 'Post Graduate', label: 'Post Graduate' },
  { value: 'Others', label: 'Others (specify)' },
]

export function BeneficiaryInfoStep() {
  const { formData, updateFormData, nextStep, prevStep } = useSurveyWizard()

  const today = new Date().toISOString().split('T')[0]

  const canProceed =
    formData.beneficiaryName &&
    formData.respondentName &&
    formData.relationshipToBeneficiary &&
    (formData.relationshipToBeneficiary !== 'Others' || formData.relationshipSpecify) &&
    formData.birthdate &&
    formData.beneficiaryClassification.length > 0 &&
    formData.sex &&
    formData.demographicClassification.length > 0 &&
    formData.highestEducationalAttainment &&
    (formData.highestEducationalAttainment !== 'Others' || formData.educationalAttainmentSpecify)

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Beneficiary Information
      </h2>

      <TextInput
        label="Name of Beneficiary"
        value={formData.beneficiaryName}
        onChange={(v) => updateFormData({ beneficiaryName: v })}
        required
      />

      <TextInput
        label="Name of Respondent"
        value={formData.respondentName}
        onChange={(v) => updateFormData({ respondentName: v })}
        required
      />

      <SelectInput
        label="Relationship to Beneficiary"
        options={relationshipOptions}
        value={formData.relationshipToBeneficiary}
        onChange={(v) => updateFormData({ relationshipToBeneficiary: v })}
        required
      />

      {formData.relationshipToBeneficiary === 'Others' && (
        <TextInput
          label="Specify Relationship"
          value={formData.relationshipSpecify}
          onChange={(v) => updateFormData({ relationshipSpecify: v })}
          required
        />
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <DateInput
          label="Birthdate"
          value={formData.birthdate}
          onChange={(v) => updateFormData({ birthdate: v })}
          max={today}
          required
        />
        <div className="mb-4">
          <label className="mb-2 block text-base font-medium text-gray-700 dark:text-gray-300">
            Age
          </label>
          <input
            type="number"
            value={formData.age || ''}
            readOnly
            className="h-14 w-full border border-gray-300 bg-gray-100 px-4 py-3 text-base leading-6 text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 sm:text-lg"
          />
        </div>
      </div>

      <CheckboxGroup
        label="Beneficiary Classification"
        options={beneficiaryClassificationOptions}
        value={formData.beneficiaryClassification}
        onChange={(v) => updateFormData({ beneficiaryClassification: v })}
        required
      />

      <TextInput
        label="Household ID Number"
        value={formData.householdIdNo}
        onChange={(v) => updateFormData({ householdIdNo: v })}
      />

      <RadioGroup
        label="Sex"
        options={sexOptions}
        value={formData.sex}
        onChange={(v) => updateFormData({ sex: v })}
        required
        inline
      />

      <CheckboxGroup
        label="Demographic Classification"
        options={demographicOptions}
        value={formData.demographicClassification}
        onChange={(v) => updateFormData({ demographicClassification: v })}
        required
      />

      {formData.demographicClassification.includes('Indigenous People') && (
        <TextInput
          label="Specify IP Group"
          value={formData.ipSpecify}
          onChange={(v) => updateFormData({ ipSpecify: v })}
          required
        />
      )}

      <SelectInput
        label="Highest Educational Attainment"
        options={educationOptions}
        value={formData.highestEducationalAttainment}
        onChange={(v) => updateFormData({ highestEducationalAttainment: v })}
        required
      />

      {formData.highestEducationalAttainment === 'Others' && (
        <TextInput
          label="Specify Education"
          value={formData.educationalAttainmentSpecify}
          onChange={(v) => updateFormData({ educationalAttainmentSpecify: v })}
          required
        />
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
    </div>
  )
}
