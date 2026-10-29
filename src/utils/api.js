/**
 * Next Challenge API URL Resolution Utility
 * 
 * Supports both:
 * 1. Direct cross-origin communication with Render backend (via VITE_API_BASE_URL)
 * 2. Same-origin or Netlify proxy routing (via relative paths /api/*)
 */

export const getApiBaseUrl = () => {
  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
    ? import.meta.env.VITE_API_BASE_URL.trim().replace(/\/$/, '')
    : ''
  return envUrl
}

export const buildApiUrl = (endpoint = '') => {
  const base = getApiBaseUrl()
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return base ? `${base}${cleanPath}` : cleanPath
}
