import { useNavigate, useParams } from 'react-router-dom'
import { SurveyWizardProvider, useSurveyWizard } from '../contexts/SurveyWizardContext'
import { StepIndicator } from '../components/ui/StepIndicator'
import { IncidentStep } from '../components/survey/IncidentStep'
import { ConsentStep } from '../components/survey/ConsentStep'
import { BeneficiaryInfoStep } from '../components/survey/BeneficiaryInfoStep'
import { AddressStep } from '../components/survey/AddressStep'
import { UtilizationTypeStep } from '../components/survey/UtilizationTypeStep'
import { ExpenseBreakdownStep } from '../components/survey/ExpenseBreakdownStep'
import { PhotoSignatureStep } from '../components/survey/PhotoSignatureStep'
import { InterviewerStep } from '../components/survey/InterviewerStep'
import { AppShell } from '../components/ui/AppShell'

const stepLabels = [
  'Incident',
  'Consent',
  'Beneficiary Info',
  'Address',
  'Utilization Type',
  'Expenses',
  'Photo & Signatures',
  'Interviewer',
]

function WizardContent({ isEditing }: { isEditing: boolean }) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { currentStep, totalSteps } = useSurveyWizard()

  const handleCancel = () => {
    if (isEditing && id) {
      navigate(`/survey/${id}`)
    } else {
      navigate('/')
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <IncidentStep />
      case 2:
        return <ConsentStep />
      case 3:
        return <BeneficiaryInfoStep />
      case 4:
        return <AddressStep />
      case 5:
        return <UtilizationTypeStep />
      case 6:
        return <ExpenseBreakdownStep />
      case 7:
        return <PhotoSignatureStep />
      case 8:
        return <InterviewerStep />
      default:
        return null
    }
  }

  return (
    <AppShell
      title={isEditing ? 'Edit Survey' : 'ECT Monitoring Survey'}
      action={
        <button
          onClick={handleCancel}
          className="border border-white/30 px-4 py-2 text-base font-semibold text-white hover:bg-white/15"
        >
          Cancel
        </button>
      }
      showNav={false}
    >
      <StepIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        labels={stepLabels}
      />

      <div className="border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-700 dark:bg-slate-900">
        {renderStep()}
      </div>
    </AppShell>
  )
}

export function SurveyWizard() {
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id

  return (
    <SurveyWizardProvider existingUuid={id}>
      <WizardContent isEditing={isEditing} />
    </SurveyWizardProvider>
  )
}
