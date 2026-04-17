import Dexie, { type EntityTable } from 'dexie'

export type SurveyStatus = 'draft' | 'pending' | 'synced' | 'error'

export interface OfflineSurvey {
  clientUuid: string
  formData: string
  photoWithIdBase64: string | null
  respondentSignatureBase64: string | null
  interviewerSignatureBase64: string | null
  status: SurveyStatus
  serverId: number | null
  errorMessage: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CachedAddress {
  id?: number
  province: string
  district: string
  municipality: string
}

export interface CachedBarangay {
  id?: number
  province: string
  district: string
  municipality: string
  barangay: string
}

export interface CachedIncident {
  id: number
  name: string
  type: string
  startsAt: string | null
  endsAt: string | null
  isActive: boolean
  description: string | null
}

export interface SyncQueueItem {
  id?: number
  url: string
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body: string
  headers: Record<string, string>
  createdAt: Date
}

const db = new Dexie('PostMonitoringDB') as Dexie & {
  surveys: EntityTable<OfflineSurvey, 'clientUuid'>
  addresses: EntityTable<CachedAddress, 'id'>
  barangays: EntityTable<CachedBarangay, 'id'>
  incidents: EntityTable<CachedIncident, 'id'>
  syncQueue: EntityTable<SyncQueueItem, 'id'>
}

db.version(2).stores({
  surveys: 'clientUuid, status, createdAt, updatedAt',
  addresses: '++id, province, [province+district]',
  syncQueue: '++id, url, method, createdAt',
})

db.version(3).stores({
  surveys: 'clientUuid, status, createdAt, updatedAt',
  addresses: '++id, province, [province+district]',
  incidents: 'id, isActive, startsAt',
  syncQueue: '++id, url, method, createdAt',
})

db.version(4).stores({
  surveys: 'clientUuid, status, createdAt, updatedAt',
  addresses: '++id, province, [province+district]',
  barangays: '++id, [province+district+municipality]',
  incidents: 'id, isActive, startsAt',
  syncQueue: '++id, url, method, createdAt',
})

export { db }
