/**
 * Service Worker
 * Provides offline support and background sync capabilities
 */

const CACHE_NAME = 'fakedetect-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    }),
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }),
      )
    }),
  )
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Don't intercept WebSocket or non-GET requests to API
  if (request.method !== 'GET' || request.url.includes('/api/')) {
    return
  }

  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response
      }

      return fetch(request).then((response) => {
        // Cache successful responses
        if (!response || response.status !== 200 || response.type === 'basic') {
          return response
        }

        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache)
        })

        return response
      })
    }),
  )
})

// Background sync event - sync data when connection is restored
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag)

  if (event.tag === 'sync-data') {
    event.waitUntil(
      new Promise((resolve) => {
        // Post message to client to trigger sync
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'SYNC_DATA',
              data: null,
            })
          })
        })
        resolve()
      }),
    )
  }
})

console.log('Service Worker loaded')
