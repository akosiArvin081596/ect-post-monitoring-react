import { api } from './api'

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

const INCIDENT_CACHE_KEY = 'ect_incident_cache'

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

function getCachedIncidents(): Incident[] {
  const cached = localStorage.getItem(INCIDENT_CACHE_KEY)
  if (!cached) {
    return []
  }
  try {
    const parsed = JSON.parse(cached) as Incident[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function setCachedIncidents(incidents: Incident[]): void {
  localStorage.setItem(INCIDENT_CACHE_KEY, JSON.stringify(incidents))
}

export async function fetchIncidents(): Promise<Incident[]> {
  try {
    const response = await api.get<IncidentCollection>('/v1/incidents')
    const incidents = response.data.data.map(mapIncident)
    setCachedIncidents(incidents)
    return incidents
  } catch {
    return getCachedIncidents()
  }
}

