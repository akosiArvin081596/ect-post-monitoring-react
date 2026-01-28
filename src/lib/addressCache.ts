import { db, type CachedAddress } from './db'
import { api } from './api'

export async function cacheAddresses(): Promise<void> {
  try {
    const provincesResponse = await api.get<string[]>('/v1/addresses/provinces')
    const provinces = provincesResponse.data

    const addresses: CachedAddress[] = []

    for (const province of provinces) {
      const districtsResponse = await api.get<string[]>(
        `/v1/addresses/districts?province=${encodeURIComponent(province)}`
      )
      const districts = districtsResponse.data

      for (const district of districts) {
        const municipalitiesResponse = await api.get<string[]>(
          `/v1/addresses/municipalities?province=${encodeURIComponent(province)}&district=${encodeURIComponent(district)}`
        )
        const municipalities = municipalitiesResponse.data

        for (const municipality of municipalities) {
          addresses.push({ province, district, municipality })
        }
      }
    }

    await db.addresses.clear()
    await db.addresses.bulkAdd(addresses)
  } catch (error) {
    console.error('Failed to cache addresses:', error)
    throw error
  }
}

export async function getProvinces(): Promise<string[]> {
  const addresses = await db.addresses.toArray()

  if (addresses.length === 0) {
    try {
      const response = await api.get<string[]>('/v1/addresses/provinces')
      return response.data
    } catch {
      return []
    }
  }

  const provinces = [...new Set(addresses.map((a) => a.province))]
  return provinces.sort()
}

export async function getDistricts(province: string): Promise<string[]> {
  const addresses = await db.addresses
    .where('province')
    .equals(province)
    .toArray()

  if (addresses.length === 0) {
    try {
      const response = await api.get<string[]>(
        `/v1/addresses/districts?province=${encodeURIComponent(province)}`
      )
      return response.data
    } catch {
      return []
    }
  }

  const districts = [...new Set(addresses.map((a) => a.district))]
  return districts.sort()
}

export async function getMunicipalities(
  province: string,
  district: string
): Promise<string[]> {
  const addresses = await db.addresses
    .where('[province+district]')
    .equals([province, district])
    .toArray()

  if (addresses.length === 0) {
    try {
      const response = await api.get<string[]>(
        `/v1/addresses/municipalities?province=${encodeURIComponent(province)}&district=${encodeURIComponent(district)}`
      )
      return response.data
    } catch {
      return []
    }
  }

  const municipalities = addresses.map((a) => a.municipality)
  return municipalities.sort()
}

export async function isAddressCacheEmpty(): Promise<boolean> {
  const count = await db.addresses.count()
  return count === 0
}
