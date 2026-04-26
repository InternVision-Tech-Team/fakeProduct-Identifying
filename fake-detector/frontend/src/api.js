import axios from 'axios'
import { db, STORES_ENUM } from './services/indexedDB'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear()
      db.clearAll().catch((e) => console.error('Failed to clear IndexedDB:', e))
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

/**
 * Cache configuration for different endpoints
 * ttl: time to live in milliseconds (0 = no cache)
 */
const CACHE_CONFIG = {
  '/products/': { ttl: 5 * 60 * 1000, store: STORES_ENUM.PRODUCTS }, // 5 minutes
  '/scans/': { ttl: 3 * 60 * 1000, store: STORES_ENUM.SCAN_RECORDS }, // 3 minutes
  '/qr-codes/': { ttl: 10 * 60 * 1000, store: STORES_ENUM.QR_CODES }, // 10 minutes
  '/reports/': { ttl: 5 * 60 * 1000, store: STORES_ENUM.REPORTS }, // 5 minutes
}

/**
 * Get cache key with timestamp
 */
function getCacheKey(url) {
  return `cache_${url}_timestamp`
}

/**
 * Check if cache is still valid
 */
function isCacheValid(url) {
  const cacheConfig = CACHE_CONFIG[url]
  if (!cacheConfig || cacheConfig.ttl === 0) return false

  const timestamp = localStorage.getItem(getCacheKey(url))
  if (!timestamp) return false

  const age = Date.now() - parseInt(timestamp, 10)
  return age < cacheConfig.ttl
}

/**
 * Mark cache as valid
 */
function updateCacheTimestamp(url) {
  localStorage.setItem(getCacheKey(url), Date.now().toString())
}

/**
 * Get data from local store
 */
async function getFromLocalStore(store) {
  try {
    return await db.getAll(store)
  } catch (error) {
    console.error(`Failed to get data from ${store}:`, error)
    return []
  }
}

/**
 * Store data locally
 */
async function storeLocally(store, data) {
  try {
    if (Array.isArray(data)) {
      await db.putMany(store, data)
    } else {
      await db.put(store, data)
    }
  } catch (error) {
    console.error(`Failed to store data in ${store}:`, error)
  }
}

/**
 * Fetch with local caching strategy
 * Uses cached data if available, syncs in background
 */
api.getWithCache = async (url, config = {}) => {
  const cacheConfig = CACHE_CONFIG[url]
  const useCache = cacheConfig && cacheConfig.ttl > 0

  // If cache is valid, return cached data
  if (useCache && isCacheValid(url)) {
    console.log(`Using cached data for ${url}`)
    const cachedData = await getFromLocalStore(cacheConfig.store)
    return {
      data: { results: cachedData },
      fromCache: true,
    }
  }

  try {
    // Fetch from server
    const response = await api.get(url, config)
    const data = response.data

    // Store in local DB if configured
    if (useCache && data.results) {
      updateCacheTimestamp(url)
      await storeLocally(cacheConfig.store, data.results)
    }

    return {
      data,
      fromCache: false,
    }
  } catch (error) {
    // If offline, try to return cached data
    if (useCache && !navigator.onLine) {
      console.log(`Offline: returning cached data for ${url}`)
      const cachedData = await getFromLocalStore(cacheConfig.store)
      return {
        data: { results: cachedData },
        fromCache: true,
        offline: true,
      }
    }
    throw error
  }
}

/**
 * POST with offline queue support
 */
api.postWithQueue = async (url, data, config = {}) => {
  try {
    return await api.post(url, data, config)
  } catch (error) {
    // Queue for later sync if offline
    if (!navigator.onLine) {
      const { syncService } = await import('./services/dataSync')
      const storeName = CACHE_CONFIG[url]?.store || STORES_ENUM.SYNC_QUEUE
      await syncService.queueOperation('create', storeName, data)
      console.log('Operation queued for sync:', { url, data })
      return { queued: true, data }
    }
    throw error
  }
}

export default api
