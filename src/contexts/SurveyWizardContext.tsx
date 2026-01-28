import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import {
  type SurveyFormData,
  initialSurveyFormData,
} from '../lib/types'
import {
  createSurvey,
  updateSurvey,
  getSurvey,
  markSurveyAsPending,
} from '../lib/surveyStorage'

interface SurveyWizardContextValue {
  clientUuid: string
  currentStep: number
  formData: SurveyFormData
  photoWithId: string | null
  respondentSignature: string | null
  interviewerSignature: string | null
  totalSteps: number
  updateFormData: (updates: Partial<SurveyFormData>) => void
  setPhotoWithId: (value: string | null) => void
  setRespondentSignature: (value: string | null) => void
  setInterviewerSignature: (value: string | null) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  submitSurvey: () => Promise<void>
  isSubmitting: boolean
  calculateTotalUtilization: () => number
  calculateVariance: () => number
}

const SurveyWizardContext = createContext<SurveyWizardContextValue | null>(null)

const TOTAL_STEPS = 8

interface ProviderProps {
  children: ReactNode
  existingUuid?: string
}

export function SurveyWizardProvider({ children, existingUuid }: ProviderProps) {
  const navigate = useNavigate()
  const [clientUuid] = useState(() => existingUuid || uuidv4())
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<SurveyFormData>(initialSurveyFormData)
  const [photoWithId, setPhotoWithId] = useState<string | null>(null)
  const [respondentSignature, setRespondentSignature] = useState<string | null>(null)
  const [interviewerSignature, setInterviewerSignature] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load existing survey if editing
  useEffect(() => {
    const load = async () => {
      if (existingUuid) {
        const existing = await getSurvey(existingUuid)
        if (existing) {
          const parsed = JSON.parse(existing.formData) as Partial<SurveyFormData>
          setFormData({ ...initialSurveyFormData, ...parsed })
          setPhotoWithId(existing.photoWithIdBase64)
          setRespondentSignature(existing.respondentSignatureBase64)
          setInterviewerSignature(existing.interviewerSignatureBase64)
        }
      } else {
        await createSurvey(clientUuid, formData)
      }
      setIsInitialized(true)
    }
    load()
  }, [clientUuid, existingUuid])

  // Auto-save on form data changes
  useEffect(() => {
    if (!isInitialized) return

    const save = async () => {
      await updateSurvey(clientUuid, {
        formData,
        photoWithIdBase64: photoWithId,
        respondentSignatureBase64: respondentSignature,
        interviewerSignatureBase64: interviewerSignature,
      })
    }
    save()
  }, [
    clientUuid,
    formData,
    photoWithId,
    respondentSignature,
    interviewerSignature,
    isInitialized,
  ])

  const updateFormData = useCallback((updates: Partial<SurveyFormData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...updates }

      // Auto-calculate age when birthdate changes
      if (updates.birthdate) {
        const birthDate = new Date(updates.birthdate)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        updated.age = Math.max(0, age)
      }

      return updated
    })
  }, [])

  const calculateTotalUtilization = useCallback(() => {
    return (
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
    )
  }, [formData])

  const calculateVariance = useCallback(() => {
    return formData.amountReceived - calculateTotalUtilization()
  }, [formData.amountReceived, calculateTotalUtilization])

  const nextStep = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((s) => s + 1)
    }
  }, [currentStep])

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1)
    }
  }, [currentStep])

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= TOTAL_STEPS) {
      setCurrentStep(step)
    }
  }, [])

  const submitSurvey = useCallback(async () => {
    setIsSubmitting(true)
    try {
      await updateSurvey(clientUuid, {
        formData,
        photoWithIdBase64: photoWithId,
        respondentSignatureBase64: respondentSignature,
        interviewerSignatureBase64: interviewerSignature,
      })
      await markSurveyAsPending(clientUuid)
      // Navigate to survey detail if editing, home if new
      if (existingUuid) {
        navigate(`/survey/${clientUuid}`, { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [clientUuid, formData, photoWithId, respondentSignature, interviewerSignature, navigate, existingUuid])

  return (
    <SurveyWizardContext.Provider
      value={{
        clientUuid,
        currentStep,
        formData,
        photoWithId,
        respondentSignature,
        interviewerSignature,
        totalSteps: TOTAL_STEPS,
        updateFormData,
        setPhotoWithId,
        setRespondentSignature,
        setInterviewerSignature,
        nextStep,
        prevStep,
        goToStep,
        submitSurvey,
        isSubmitting,
        calculateTotalUtilization,
        calculateVariance,
      }}
    >
      {children}
    </SurveyWizardContext.Provider>
  )
}

export function useSurveyWizard() {
  const context = useContext(SurveyWizardContext)
  if (!context) {
    throw new Error('useSurveyWizard must be used within SurveyWizardProvider')
  }
  return context
}
