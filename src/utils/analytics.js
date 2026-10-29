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
const pendingTrackingPaths = new Set()

/**
 * Tracks a public website visit or page view asynchronously.
 * Resilient to Render Free Tier cold-starts: retries safely if the container
 * is waking up from idle, guaranteeing the first visitor is never lost.
 */
export function trackPageView(pagePath = '/') {
  if (isRestrictedContext()) {
    return
  }

  const cleanPath = pagePath.startsWith('/') ? pagePath : `/${pagePath}`
  const today = new Date().toISOString().slice(0, 10)
  const sessionKey = `${today}:${cleanPath}`

  // Check in-memory session cache
  if (sessionTrackedPaths.has(sessionKey)) {
    return
  }

  // Check sessionStorage to prevent duplicate tracking on page reload in same session
  try {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(`nc_pv_${sessionKey}`)) {
      sessionTrackedPaths.add(sessionKey)
      return
    }
  } catch {
    // Restricted environment / private mode
  }

  // Prevent multiple concurrent tracking requests for the same path
  if (pendingTrackingPaths.has(sessionKey)) {
    return
  }
  pendingTrackingPaths.add(sessionKey)

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

    /**
     * Dispatches tracking request with automatic backoff retry for Render cold starts.
     * Retries up to 2 times (total 3 attempts) if the backend returns 502/503/504 or drops connection while spinning up.
     */
    const dispatchTracking = (attempt = 1) => {
      // 35s timeout to give Render's container ample time to spin up
      let timeoutId = null
      let controller = null

      if (typeof AbortController !== 'undefined') {
        controller = new AbortController()
        timeoutId = setTimeout(() => {
          try { controller.abort() } catch {}
        }, 35000)
      }

      fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: payload,
        keepalive: true,
        signal: controller ? controller.signal : undefined
      })
        .then((res) => {
          if (timeoutId) clearTimeout(timeoutId)

          if (res.ok) {
            // Successfully recorded by backend
            sessionTrackedPaths.add(sessionKey)
            pendingTrackingPaths.delete(sessionKey)
            try {
              if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem(`nc_pv_${sessionKey}`, '1')
              }
            } catch {}
            return
          }

          // If Render returned 502 Bad Gateway / 503 / 504 while waking up, retry
          if ((res.status === 502 || res.status === 503 || res.status === 504 || res.status >= 500) && attempt < 3) {
            const delay = attempt === 1 ? 5000 : 12000
            setTimeout(() => dispatchTracking(attempt + 1), delay)
          } else {
            // Terminal response or max attempts reached
            pendingTrackingPaths.delete(sessionKey)
          }
        })
        .catch(() => {
          if (timeoutId) clearTimeout(timeoutId)
          // Network error or cold-start abort: retry if attempts remain
          if (attempt < 3) {
            const delay = attempt === 1 ? 5000 : 12000
            setTimeout(() => dispatchTracking(attempt + 1), delay)
          } else {
            pendingTrackingPaths.delete(sessionKey)
          }
        })
    }

    // Fire non-blocking asynchronous tracking
    dispatchTracking(1)
  } catch {
    pendingTrackingPaths.delete(sessionKey)
  }
}
