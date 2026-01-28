import { api } from './api'
import { db, type CachedIncident } from './db'

export interface Incident {
  id: number
  name: string
  type: string
  startsAt: string | null
  endsAt: string | null
  isActive: boolean
  description: string | null
}

interface ApiIncident {
  id: number
  name: string
  type: string
  starts_at?: string | null
  ends_at?: string | null
  is_active: boolean
  description?: string | null
}

interface IncidentCollection {
  data: ApiIncident[]
}

function mapIncident(incident: ApiIncident): Incident {
  return {
    id: incident.id,
    name: incident.name,
    type: incident.type,
    startsAt: incident.starts_at ?? null,
    endsAt: incident.ends_at ?? null,
    isActive: incident.is_active,
    description: incident.description ?? null,
  }
}

function mapIncidentToCache(incident: Incident): CachedIncident {
  return {
    id: incident.id,
    name: incident.name,
    type: incident.type,
    startsAt: incident.startsAt,
    endsAt: incident.endsAt,
    isActive: incident.isActive,
    description: incident.description,
  }
}

function mapCacheToIncident(incident: CachedIncident): Incident {
  return {
    id: incident.id,
    name: incident.name,
    type: incident.type,
    startsAt: incident.startsAt,
    endsAt: incident.endsAt,
    isActive: incident.isActive,
    description: incident.description,
  }
}

async function getCachedIncidents(): Promise<Incident[]> {
  const cached = await db.incidents.toArray()
  return cached.map(mapCacheToIncident)
}

async function setCachedIncidents(incidents: Incident[]): Promise<void> {
  await db.incidents.clear()
  await db.incidents.bulkPut(incidents.map(mapIncidentToCache))
}

export async function fetchIncidents(): Promise<Incident[]> {
  try {
    const response = await api.get<IncidentCollection>('/v1/incidents')
    const incidents = response.data.data.map(mapIncident)
    await setCachedIncidents(incidents)
    return incidents
  } catch {
    return await getCachedIncidents()
  }
}
