import { type AxiosError } from 'axios'
import { db, type OfflineSurvey, type SyncQueueItem } from './db'
import { api } from './api'
import {
  listSurveysByStatus,
  getSurvey,
  markSurveyAsSynced,
  markSurveyAsError,
} from './surveyStorage'
import { toSnakeCase, type SurveyFormData } from './types'

interface ApiSurveyUpload {
  type: 'photo_with_id' | 'respondent_signature' | 'interviewer_signature'
  url: string
}

interface ApiSurvey {
  id: number
  client_uuid: string
  consent_agreed: boolean | number | string
  beneficiary_name: string | null
  respondent_name: string | null
  relationship_to_beneficiary: string | null
  relationship_specify: string | null
  birthdate: string | null
  age: number | string | null
  beneficiary_classification: string[] | null
  household_id_no: string | null
  sex: string | null
  demographic_classification: string[] | null
  ip_specify: string | null
  highest_educational_attainment: string | null
  educational_attainment_specify: string | null
  province: string | null
  district: string | null
  municipality: string | null
  barangay: string | null
  sitio_purok_street: string | null
  latitude: number | string | null
  longitude: number | string | null
  altitude: number | string | null
  accuracy: number | string | null
  utilization_type: string | null
  amount_received: number | string | null
  date_received: string | null
  expense_food: number | string | null
  expense_educational: number | string | null
  expense_house_rental: number | string | null
  livelihood_types: string[] | null
  livelihood_specify: string | null
  expense_livelihood: number | string | null
  expense_medical: number | string | null
  expense_non_food_items: number | string | null
  expense_utilities: number | string | null
  expense_shelter_materials: number | string | null
  expense_transportation: number | string | null
  expense_others_specify: string | null
  expense_others: number | string | null
  reason_not_fully_utilized: string | null
  interviewed_by: string | null
  position: string | null
  survey_modality: string | null
  modality_specify: string | null
  uploads?: ApiSurveyUpload[]
  created_at?: string
  updated_at?: string
}

interface ApiSurveyCollection {
  data: ApiSurvey[]
  meta?: {
    current_page?: number
    last_page?: number
  }
}

function extractServerIdFromError(error: unknown): number | undefined {
  if (error && typeof error === 'object' && 'config' in error) {
    const axiosError = error as AxiosError
    const url = axiosError.config?.url
    if (url) {
      const match = url.match(/\/v1\/surveys\/(\d+)\//)
      if (match) {
        return parseInt(match[1], 10)
      }
    }
  }
  return undefined
}

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function toNumberValue(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return fallback
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }
  const parsed = toNumberValue(value, Number.NaN)
  return Number.isNaN(parsed) ? null : parsed
}

function toBooleanValue(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'number') {
    return value === 1
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === '1' || normalized === 'true' || normalized === 'yes'
  }
  return false
}

function toDateValue(value: unknown, fallback: Date): Date {
  if (value instanceof Date) {
    return Number.isNaN(value.valueOf()) ? fallback : value
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = new Date(value)
    return Number.isNaN(parsed.valueOf()) ? fallback : parsed
  }
  return fallback
}

function mapApiSurveyToFormData(survey: ApiSurvey): SurveyFormData {
  return {
    consentAgreed: toBooleanValue(survey.consent_agreed),
    beneficiaryName: toStringValue(survey.beneficiary_name),
    respondentName: toStringValue(survey.respondent_name),
    relationshipToBeneficiary: toStringValue(survey.relationship_to_beneficiary),
    relationshipSpecify: toStringValue(survey.relationship_specify),
    birthdate: toStringValue(survey.birthdate),
    age: toNumberValue(survey.age),
    beneficiaryClassification: toStringArray(survey.beneficiary_classification),
    householdIdNo: toStringValue(survey.household_id_no),
    sex: toStringValue(survey.sex),
    demographicClassification: toStringArray(survey.demographic_classification),
    ipSpecify: toStringValue(survey.ip_specify),
    highestEducationalAttainment: toStringValue(survey.highest_educational_attainment),
    educationalAttainmentSpecify: toStringValue(survey.educational_attainment_specify),
    province: toStringValue(survey.province),
    district: toStringValue(survey.district),
    municipality: toStringValue(survey.municipality),
    barangay: toStringValue(survey.barangay),
    sitioPurokStreet: toStringValue(survey.sitio_purok_street),
    latitude: toNullableNumber(survey.latitude),
    longitude: toNullableNumber(survey.longitude),
    altitude: toNullableNumber(survey.altitude),
    accuracy: toNullableNumber(survey.accuracy),
    utilizationType: toStringValue(survey.utilization_type),
    amountReceived: toNumberValue(survey.amount_received),
    dateReceived: toStringValue(survey.date_received),
    expenseFood: toNumberValue(survey.expense_food),
    expenseEducational: toNumberValue(survey.expense_educational),
    expenseHouseRental: toNumberValue(survey.expense_house_rental),
    livelihoodTypes: toStringArray(survey.livelihood_types),
    livelihoodSpecify: toStringValue(survey.livelihood_specify),
    expenseLivelihood: toNumberValue(survey.expense_livelihood),
    expenseMedical: toNumberValue(survey.expense_medical),
    expenseNonFoodItems: toNumberValue(survey.expense_non_food_items),
    expenseUtilities: toNumberValue(survey.expense_utilities),
    expenseShelterMaterials: toNumberValue(survey.expense_shelter_materials),
    expenseTransportation: toNumberValue(survey.expense_transportation),
    expenseOthersSpecify: toStringValue(survey.expense_others_specify),
    expenseOthers: toNumberValue(survey.expense_others),
    reasonNotFullyUtilized: toStringValue(survey.reason_not_fully_utilized),
    interviewedBy: toStringValue(survey.interviewed_by),
    position: toStringValue(survey.position),
    surveyModality: toStringValue(survey.survey_modality),
    modalitySpecify: toStringValue(survey.modality_specify),
  }
}

function mapApiSurveyToOfflineSurvey(
  survey: ApiSurvey,
  existing?: OfflineSurvey
): OfflineSurvey {
  const uploads = survey.uploads ?? []
  const photoWithId =
    uploads.find((upload) => upload.type === 'photo_with_id')?.url ??
    existing?.photoWithIdBase64 ??
    null
  const respondentSignature =
    uploads.find((upload) => upload.type === 'respondent_signature')?.url ??
    existing?.respondentSignatureBase64 ??
    null
  const interviewerSignature =
    uploads.find((upload) => upload.type === 'interviewer_signature')?.url ??
    existing?.interviewerSignatureBase64 ??
    null

  const fallbackCreatedAt = existing?.createdAt ?? new Date()
  const fallbackUpdatedAt = existing?.updatedAt ?? fallbackCreatedAt

  return {
    clientUuid: survey.client_uuid,
    formData: JSON.stringify(mapApiSurveyToFormData(survey)),
    photoWithIdBase64: photoWithId,
    respondentSignatureBase64: respondentSignature,
    interviewerSignatureBase64: interviewerSignature,
    status: 'synced',
    serverId: survey.id,
    errorMessage: null,
    createdAt: toDateValue(survey.created_at, fallbackCreatedAt),
    updatedAt: toDateValue(survey.updated_at, fallbackUpdatedAt),
  }
}

export async function enqueueRequest(
  url: string,
  method: SyncQueueItem['method'],
  body: unknown,
  headers: Record<string, string> = {}
): Promise<void> {
  await db.syncQueue.add({
    url,
    method,
    body: JSON.stringify(body),
    headers,
    createdAt: new Date(),
  })
}

export async function processSyncQueue(): Promise<number> {
  const items = await db.syncQueue.orderBy('createdAt').toArray()

  if (items.length === 0) {
    return 0
  }

  let synced = 0

  for (const item of items) {
    try {
      await api.request({
        url: item.url,
        method: item.method,
        data: JSON.parse(item.body),
        headers: item.headers,
      })

      await db.syncQueue.delete(item.id!)
      synced++
    } catch {
      break
    }
  }

  return synced
}

export async function getPendingSyncCount(): Promise<number> {
  return db.syncQueue.count()
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteString = atob(base64.split(',')[1])
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ab], { type: mimeType })
}

async function uploadFile(
  surveyId: number,
  base64Data: string,
  type: 'photo_with_id' | 'respondent_signature' | 'interviewer_signature'
): Promise<void> {
  const mimeType = base64Data.startsWith('data:image/png') ? 'image/png' : 'image/jpeg'
  const blob = base64ToBlob(base64Data, mimeType)
  const ext = mimeType === 'image/png' ? 'png' : 'jpg'

  const formData = new FormData()
  formData.append('file', blob, `${type}.${ext}`)
  formData.append('type', type)

  await api.post(`/v1/surveys/${surveyId}/uploads`, formData)
}

export async function syncPendingSurveys(): Promise<{
  synced: number
  failed: number
}> {
  const pendingSurveys = await listSurveysByStatus('pending')

  let synced = 0
  let failed = 0

  for (const survey of pendingSurveys) {
    let serverId = survey.serverId

    try {
      // Only create survey if not already on server
      if (!serverId) {
        const formData = JSON.parse(survey.formData) as SurveyFormData
        const payload = {
          client_uuid: survey.clientUuid,
          ...toSnakeCase(formData),
        }

        const response = await api.post<{ data: { id: number } }>('/v1/surveys', payload)
        serverId = response.data.data.id
      }

      // Upload files if present
      if (survey.photoWithIdBase64) {
        await uploadFile(serverId, survey.photoWithIdBase64, 'photo_with_id')
      }
      if (survey.respondentSignatureBase64) {
        await uploadFile(serverId, survey.respondentSignatureBase64, 'respondent_signature')
      }
      if (survey.interviewerSignatureBase64) {
        await uploadFile(serverId, survey.interviewerSignatureBase64, 'interviewer_signature')
      }

      await markSurveyAsSynced(survey.clientUuid, serverId)
      synced++
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      // Try to extract serverId from error URL if not already set
      const errorServerId = serverId ?? extractServerIdFromError(error)
      await markSurveyAsError(survey.clientUuid, message, errorServerId)
      failed++
    }
  }

  return { synced, failed }
}

async function fetchSurveyPage(page: number): Promise<ApiSurveyCollection> {
  const response = await api.get<ApiSurveyCollection>(`/v1/surveys?page=${page}`)
  return response.data
}

export async function fetchAllServerSurveys(): Promise<ApiSurvey[]> {
  const surveys: ApiSurvey[] = []
  let page = 1

  while (true) {
    const response = await fetchSurveyPage(page)
    surveys.push(...response.data)

    const lastPage = response.meta?.last_page ?? page
    if (page >= lastPage || response.data.length === 0) {
      break
    }
    page += 1
  }

  return surveys
}

export async function syncServerSurveys(): Promise<number> {
  const serverSurveys = await fetchAllServerSurveys()
  if (serverSurveys.length === 0) {
    return 0
  }

  const localSurveys = await db.surveys.toArray()
  const localByClientUuid = new Map(
    localSurveys.map((survey) => [survey.clientUuid, survey])
  )

  const upserts: OfflineSurvey[] = []

  for (const serverSurvey of serverSurveys) {
    if (!serverSurvey.client_uuid) {
      continue
    }

    const local = localByClientUuid.get(serverSurvey.client_uuid)
    if (local && (local.status === 'draft' || local.status === 'pending' || local.status === 'error')) {
      continue
    }

    upserts.push(mapApiSurveyToOfflineSurvey(serverSurvey, local))
  }

  if (upserts.length > 0) {
    await db.surveys.bulkPut(upserts)
  }

  return upserts.length
}

export async function recoverErrorSurvey(clientUuid: string, serverId: number): Promise<void> {
  const survey = await getSurvey(clientUuid)
  if (!survey || survey.status !== 'error') {
    throw new Error('Survey not found or not in error status')
  }
  await markSurveyAsError(clientUuid, survey.errorMessage || '', serverId)
}

export async function syncSingleSurvey(clientUuid: string): Promise<boolean> {
  const survey = await getSurvey(clientUuid)
  if (!survey || (survey.status !== 'pending' && survey.status !== 'error')) {
    return false
  }

  let serverId = survey.serverId

  try {
    // Only create survey if not already on server
    if (!serverId) {
      const formData = JSON.parse(survey.formData) as SurveyFormData
      const payload = {
        client_uuid: survey.clientUuid,
        ...toSnakeCase(formData),
      }

      const response = await api.post<{ data: { id: number } }>('/v1/surveys', payload)
      serverId = response.data.data.id
    }

    if (survey.photoWithIdBase64) {
      await uploadFile(serverId, survey.photoWithIdBase64, 'photo_with_id')
    }
    if (survey.respondentSignatureBase64) {
      await uploadFile(serverId, survey.respondentSignatureBase64, 'respondent_signature')
    }
    if (survey.interviewerSignatureBase64) {
      await uploadFile(serverId, survey.interviewerSignatureBase64, 'interviewer_signature')
    }

    await markSurveyAsSynced(survey.clientUuid, serverId)
    return true
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    // Try to extract serverId from error URL if not already set
    const errorServerId = serverId ?? extractServerIdFromError(error)
    await markSurveyAsError(survey.clientUuid, message, errorServerId)
    return false
  }
}
