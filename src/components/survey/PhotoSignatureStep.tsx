import { useSurveyWizard } from '../../contexts/SurveyWizardContext'
import { PhotoCapture } from '../ui/PhotoCapture'
import { SignaturePad } from '../ui/SignaturePad'

export function PhotoSignatureStep() {
  const {
    photoWithId,
    respondentSignature,
    interviewerSignature,
    setPhotoWithId,
    setRespondentSignature,
    setInterviewerSignature,
    nextStep,
    prevStep,
  } = useSurveyWizard()

  const canProceed = photoWithId && respondentSignature && interviewerSignature

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Photo and Signatures
      </h2>

      <div className="border border-blue-200 bg-blue-50 p-4 sm:p-5 dark:border-blue-800 dark:bg-blue-900/20">
        <p className="text-base text-gray-700 dark:text-gray-300">
          Please capture a photo of the beneficiary holding a valid ID, and
          collect signatures from both the respondent and interviewer.
        </p>
      </div>

      <PhotoCapture
        label="Photo with Valid ID"
        value={photoWithId}
        onChange={setPhotoWithId}
        required
      />

      <SignaturePad
        label="Respondent's Signature"
        value={respondentSignature}
        onChange={setRespondentSignature}
        required
      />

      <SignaturePad
        label="Interviewer's Signature"
        value={interviewerSignature}
        onChange={setInterviewerSignature}
        required
      />

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
