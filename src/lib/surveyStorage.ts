import { db, type OfflineSurvey, type SurveyStatus } from './db'
import { type SurveyFormData } from './types'

export async function createSurvey(
  clientUuid: string,
  formData: SurveyFormData
): Promise<void> {
  const now = new Date()
  await db.surveys.add({
    clientUuid,
    formData: JSON.stringify(formData),
    photoWithIdBase64: null,
    respondentSignatureBase64: null,
    interviewerSignatureBase64: null,
    status: 'draft',
    serverId: null,
    errorMessage: null,
    createdAt: now,
    updatedAt: now,
  })
}

export async function updateSurvey(
  clientUuid: string,
  updates: Partial<{
    formData: SurveyFormData
    photoWithIdBase64: string | null
    respondentSignatureBase64: string | null
    interviewerSignatureBase64: string | null
    status: SurveyStatus
    serverId: number | null
    errorMessage: string | null
  }>
): Promise<void> {
  const updateData: Partial<OfflineSurvey> = {
    updatedAt: new Date(),
  }

  if (updates.formData !== undefined) {
    updateData.formData = JSON.stringify(updates.formData)
  }
  if (updates.photoWithIdBase64 !== undefined) {
    updateData.photoWithIdBase64 = updates.photoWithIdBase64
  }
  if (updates.respondentSignatureBase64 !== undefined) {
    updateData.respondentSignatureBase64 = updates.respondentSignatureBase64
  }
  if (updates.interviewerSignatureBase64 !== undefined) {
    updateData.interviewerSignatureBase64 = updates.interviewerSignatureBase64
  }
  if (updates.status !== undefined) {
    updateData.status = updates.status
  }
  if (updates.serverId !== undefined) {
    updateData.serverId = updates.serverId
  }
  if (updates.errorMessage !== undefined) {
    updateData.errorMessage = updates.errorMessage
  }

  await db.surveys.update(clientUuid, updateData)
}

export async function getSurvey(clientUuid: string): Promise<OfflineSurvey | undefined> {
  return db.surveys.get(clientUuid)
}

export async function getSurveyFormData(clientUuid: string): Promise<SurveyFormData | null> {
  const survey = await db.surveys.get(clientUuid)
  if (!survey) return null
  return JSON.parse(survey.formData) as SurveyFormData
}

export async function listSurveysByStatus(status: SurveyStatus): Promise<OfflineSurvey[]> {
  return db.surveys.where('status').equals(status).toArray()
}

export async function listAllSurveys(): Promise<OfflineSurvey[]> {
  return db.surveys.orderBy('updatedAt').reverse().toArray()
}

export async function deleteSurvey(clientUuid: string): Promise<void> {
  await db.surveys.delete(clientUuid)
}

export async function getPendingSurveysCount(): Promise<number> {
  return db.surveys.where('status').equals('pending').count()
}

export async function getDraftSurveysCount(): Promise<number> {
  return db.surveys.where('status').equals('draft').count()
}

export async function getSyncedSurveysCount(): Promise<number> {
  return db.surveys.where('status').equals('synced').count()
}

export async function markSurveyAsPending(clientUuid: string): Promise<void> {
  await updateSurvey(clientUuid, { status: 'pending' })
}

export async function markSurveyAsSynced(
  clientUuid: string,
  serverId: number
): Promise<void> {
  await updateSurvey(clientUuid, { status: 'synced', serverId, errorMessage: null })
}

export async function markSurveyAsError(
  clientUuid: string,
  errorMessage: string,
  serverId?: number
): Promise<void> {
  const updates: Partial<{ status: SurveyStatus; errorMessage: string; serverId: number }> = {
    status: 'error',
    errorMessage,
  }
  if (serverId !== undefined) {
    updates.serverId = serverId
  }
  await updateSurvey(clientUuid, updates)
}
