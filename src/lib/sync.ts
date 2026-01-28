import { type AxiosError } from 'axios'
import { db, type SyncQueueItem } from './db'
import { api } from './api'
import {
  listSurveysByStatus,
  getSurvey,
  markSurveyAsSynced,
  markSurveyAsError,
} from './surveyStorage'
import { toSnakeCase, type SurveyFormData } from './types'

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
