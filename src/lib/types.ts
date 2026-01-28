export interface SurveyFormData {
  // Consent
  consentAgreed: boolean

  // Beneficiary info
  beneficiaryName: string
  respondentName: string
  relationshipToBeneficiary: string
  relationshipSpecify: string
  birthdate: string
  age: number
  beneficiaryClassification: string[]
  householdIdNo: string
  sex: string
  demographicClassification: string[]
  ipSpecify: string
  highestEducationalAttainment: string
  educationalAttainmentSpecify: string

  // Address
  province: string
  district: string
  municipality: string
  barangay: string
  sitioPurokStreet: string
  latitude: number | null
  longitude: number | null
  altitude: number | null
  accuracy: number | null

  // Utilization
  utilizationType: string
  amountReceived: number
  dateReceived: string

  // Expenses
  expenseFood: number
  expenseEducational: number
  expenseHouseRental: number
  livelihoodTypes: string[]
  livelihoodSpecify: string
  expenseLivelihood: number
  expenseMedical: number
  expenseNonFoodItems: number
  expenseUtilities: number
  expenseShelterMaterials: number
  expenseTransportation: number
  expenseOthersSpecify: string
  expenseOthers: number
  reasonNotFullyUtilized: string

  // Interviewer
  interviewedBy: string
  position: string
  surveyModality: string
  modalitySpecify: string
}

export const initialSurveyFormData: SurveyFormData = {
  consentAgreed: false,
  beneficiaryName: '',
  respondentName: '',
  relationshipToBeneficiary: '',
  relationshipSpecify: '',
  birthdate: '',
  age: 0,
  beneficiaryClassification: [],
  householdIdNo: '',
  sex: '',
  demographicClassification: [],
  ipSpecify: '',
  highestEducationalAttainment: '',
  educationalAttainmentSpecify: '',
  province: '',
  district: '',
  municipality: '',
  barangay: '',
  sitioPurokStreet: '',
  latitude: null,
  longitude: null,
  altitude: null,
  accuracy: null,
  utilizationType: '',
  amountReceived: 0,
  dateReceived: '',
  expenseFood: 0,
  expenseEducational: 0,
  expenseHouseRental: 0,
  livelihoodTypes: [],
  livelihoodSpecify: '',
  expenseLivelihood: 0,
  expenseMedical: 0,
  expenseNonFoodItems: 0,
  expenseUtilities: 0,
  expenseShelterMaterials: 0,
  expenseTransportation: 0,
  expenseOthersSpecify: '',
  expenseOthers: 0,
  reasonNotFullyUtilized: '',
  interviewedBy: '',
  position: '',
  surveyModality: '',
  modalitySpecify: '',
}

export function toSnakeCase(data: SurveyFormData): Record<string, unknown> {
  return {
    consent_agreed: data.consentAgreed,
    beneficiary_name: data.beneficiaryName,
    respondent_name: data.respondentName,
    relationship_to_beneficiary: data.relationshipToBeneficiary,
    relationship_specify: data.relationshipSpecify || null,
    birthdate: data.birthdate,
    age: data.age,
    beneficiary_classification: data.beneficiaryClassification,
    household_id_no: data.householdIdNo || null,
    sex: data.sex,
    demographic_classification: data.demographicClassification,
    ip_specify: data.ipSpecify || null,
    highest_educational_attainment: data.highestEducationalAttainment,
    educational_attainment_specify: data.educationalAttainmentSpecify || null,
    province: data.province,
    district: data.district,
    municipality: data.municipality,
    barangay: data.barangay,
    sitio_purok_street: data.sitioPurokStreet || null,
    latitude: data.latitude,
    longitude: data.longitude,
    altitude: data.altitude,
    accuracy: data.accuracy,
    utilization_type: data.utilizationType,
    amount_received: data.amountReceived,
    date_received: data.dateReceived,
    expense_food: data.expenseFood,
    expense_educational: data.expenseEducational,
    expense_house_rental: data.expenseHouseRental,
    livelihood_types: data.livelihoodTypes.length > 0 ? data.livelihoodTypes : null,
    livelihood_specify: data.livelihoodSpecify || null,
    expense_livelihood: data.expenseLivelihood,
    expense_medical: data.expenseMedical,
    expense_non_food_items: data.expenseNonFoodItems,
    expense_utilities: data.expenseUtilities,
    expense_shelter_materials: data.expenseShelterMaterials,
    expense_transportation: data.expenseTransportation,
    expense_others_specify: data.expenseOthersSpecify || null,
    expense_others: data.expenseOthers,
    reason_not_fully_utilized: data.reasonNotFullyUtilized || null,
    interviewed_by: data.interviewedBy,
    position: data.position,
    survey_modality: data.surveyModality,
    modality_specify: data.modalitySpecify || null,
  }
}
