import { useNavigate } from 'react-router-dom'
import { SurveyWizardProvider, useSurveyWizard } from '../contexts/SurveyWizardContext'
import { StepIndicator } from '../components/ui/StepIndicator'
import { ConsentStep } from '../components/survey/ConsentStep'
import { BeneficiaryInfoStep } from '../components/survey/BeneficiaryInfoStep'
import { AddressStep } from '../components/survey/AddressStep'
import { UtilizationTypeStep } from '../components/survey/UtilizationTypeStep'
import { ExpenseBreakdownStep } from '../components/survey/ExpenseBreakdownStep'
import { PhotoSignatureStep } from '../components/survey/PhotoSignatureStep'
import { InterviewerStep } from '../components/survey/InterviewerStep'
import { AppShell } from '../components/ui/AppShell'

const stepLabels = [
  'Consent',
  'Beneficiary Info',
  'Address',
  'Utilization Type',
  'Expenses',
  'Photo & Signatures',
  'Interviewer',
]

function WizardContent() {
  const navigate = useNavigate()
  const { currentStep, totalSteps } = useSurveyWizard()

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ConsentStep />
      case 2:
        return <BeneficiaryInfoStep />
      case 3:
        return <AddressStep />
      case 4:
        return <UtilizationTypeStep />
      case 5:
        return <ExpenseBreakdownStep />
      case 6:
        return <PhotoSignatureStep />
      case 7:
        return <InterviewerStep />
      default:
        return null
    }
  }

  return (
    <AppShell
      title="ECT Monitoring Survey"
      action={
        <button
          onClick={() => navigate('/')}
          className="rounded border border-white/30 px-4 py-2 text-base font-semibold text-white hover:bg-white/15"
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

      <div className="rounded border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-700 dark:bg-slate-900">
        {renderStep()}
      </div>
    </AppShell>
  )
}

export function SurveyWizard() {
  return (
    <SurveyWizardProvider>
      <WizardContent />
    </SurveyWizardProvider>
  )
}
