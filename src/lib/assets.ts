const apiBaseURL = import.meta.env.VITE_API_URL || '/api'

function getApiOrigin(): string {
  try {
    return new URL(apiBaseURL, window.location.origin).origin
  } catch {
    return window.location.origin
  }
}

export function resolveAssetUrl(value?: string | null): string | null {
  if (!value) return null
  if (value.startsWith('data:')) return value
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  const normalized = value.startsWith('/') ? value : `/${value}`
  return `${getApiOrigin()}${normalized}`
}

