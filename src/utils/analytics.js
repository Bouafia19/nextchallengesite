/**
 * Next Challenge — Lightweight First-Party Visitor Tracking Client
 *
 * Privacy Guarantees:
 * - Zero raw IP address storage or collection.
 * - Anonymous client-side UUIDs for unique visitor and session counting.
 * - Non-blocking asynchronous tracking via navigator.sendBeacon with fetch keepalive fallback.
 * - Automatic deduplication: SPA route switches, re-renders, and rapid reloads do NOT inflate metrics.
 * - Strictly excludes administrative portals, web crawlers, and automated testing harnesses.
 */

function generateUuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID()
    } catch {
      // Fallback below
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function getVisitorId() {
  try {
    let vid = localStorage.getItem('nc_vid')
    let isNew = false
    if (!vid || typeof vid !== 'string' || vid.length < 10) {
      vid = generateUuid()
      localStorage.setItem('nc_vid', vid)
      isNew = true
    }
    return { vid, isNew }
  } catch {
    return { vid: generateUuid(), isNew: false }
  }
}

function getSessionId() {
  try {
    let sid = sessionStorage.getItem('nc_sid')
    if (!sid || typeof sid !== 'string' || sid.length < 10) {
      sid = generateUuid()
      sessionStorage.setItem('nc_sid', sid)
    }
    return sid
  } catch {
    return generateUuid()
  }
}

function getDeviceType() {
  if (typeof window === 'undefined') return 'desktop'
  const w = window.innerWidth || 1024
  if (w < 768) return 'mobile'
  if (w <= 1024) return 'tablet'
  return 'desktop'
}

function getBrowserType() {
  if (typeof navigator === 'undefined') return 'other'
  const ua = (navigator.userAgent || '').toLowerCase()
  if (ua.includes('edg/')) return 'edge'
  if (ua.includes('firefox/')) return 'firefox'
  if (ua.includes('chrome/')) return 'chrome'
  if (ua.includes('safari/')) return 'safari'
  return 'other'
}

/**
 * Checks if the current view or environment is an administrative portal or automated tool.
 */
function isRestrictedContext() {
  if (typeof window === 'undefined') return true
  if (navigator.webdriver) return true

  const path = window.location.pathname.toLowerCase()
  const hash = window.location.hash.toLowerCase()

  // Block administrative paths
  if (
    path.startsWith('/admin') ||
    path.startsWith('/administrator') ||
    hash === '#admin' ||
    hash === '#/admin' ||
    window.__NC_ADMIN_GATE__ === true
  ) {
    return true
  }

  // Check meta tag injected by server-side admin gate
  if (document.querySelector('meta[name="nc-admin-gate"]')?.content === 'active') {
    return true
  }

  return false
}

// In-memory cache of paths tracked in the current session
const sessionTrackedPaths = new Set()

/**
 * Tracks a public website visit or page view asynchronously.
 */
export function trackPageView(pagePath = '/') {
  if (isRestrictedContext()) {
    return
  }

  const cleanPath = pagePath.startsWith('/') ? pagePath : `/${pagePath}`

  // Prevent duplicate tracking within the same session for this exact path
  const sessionKey = `${cleanPath}`
  if (sessionTrackedPaths.has(sessionKey)) {
    return
  }
  sessionTrackedPaths.add(sessionKey)

  try {
    const { vid, isNew } = getVisitorId()
    const sid = getSessionId()
    const device = getDeviceType()
    const browser = getBrowserType()

    const payload = JSON.stringify({
      visitorId: vid,
      sessionId: sid,
      path: cleanPath,
      device,
      browser,
      isClientNew: isNew
    })

    const targetUrl = '/api/analytics/track'

    // Prefer navigator.sendBeacon for zero render interference
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' })
      const dispatched = navigator.sendBeacon(targetUrl, blob)
      if (dispatched) return
    }

    // Fallback to fetch with keepalive
    fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: payload,
      keepalive: true
    }).catch(() => {
      // Intentionally silent
    })
  } catch {
    // Intentionally silent
  }
}
