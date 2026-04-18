/**
 * API base URL for the FastAPI backend
 */

const DEFAULT_DEV_API = 'http://127.0.0.1:8000'

export function getPublicApiBase() {
  const env = process.env.NEXT_PUBLIC_API_URL?.trim()
  if (env) {
    return env.replace(/\/$/, '')
  }

  if (typeof window === 'undefined') {
    return ''
  }

  const { hostname, port } = window.location

  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return ''
  }

  // If frontend is running on different port → backend on 8000
  if (port !== '8000') {
    return DEFAULT_DEV_API
  }

  return ''
}

/**
 * Full URL for an API path.
 * Example: /schemes/recommend
 */
export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  const base = getPublicApiBase()
  return base ? `${base}${p}` : p
}