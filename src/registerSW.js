const BASE = import.meta.env.BASE_URL

/**
 * Register the service worker and re-check for updates whenever the
 * installed home-screen app becomes visible again (iOS often skips
 * background update checks).
 */
export function registerSW() {
  if (!('serviceWorker' in navigator)) return

  let registration
  // Only auto-reload when an *existing* worker is replaced — not on first install
  const hadControllerOnLoad = Boolean(navigator.serviceWorker.controller)

  const checkForWorkerUpdate = () => {
    if (registration) {
      registration.update().catch(() => {})
    }
  }

  window.addEventListener('load', async () => {
    try {
      registration = await navigator.serviceWorker.register(`${BASE}sw.js`, {
        scope: BASE,
        // Critical on GitHub Pages: don't trust HTTP cache for sw.js
        updateViaCache: 'none',
      })

      registration.addEventListener('updatefound', () => {
        const worker = registration.installing
        if (!worker) return
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            worker.postMessage('SKIP_WAITING')
          }
        })
      })

      checkForWorkerUpdate()
    } catch {
      // Registration can fail on first visit / insecure contexts — ignore
    }
  })

  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadControllerOnLoad || refreshing) return
    refreshing = true
    window.location.reload()
  })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkForWorkerUpdate()
    }
  })

  window.addEventListener('pageshow', (event) => {
    // iOS restores standalone apps from bfcache; force an update check
    if (event.persisted) {
      checkForWorkerUpdate()
    }
  })
}
