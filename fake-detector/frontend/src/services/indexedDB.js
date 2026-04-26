/**
 * IndexedDB Database Service
 * Handles local storage of products, scan records, and other data
 */

const DB_NAME = 'FakeDetectDB'
const DB_VERSION = 1

const STORES = {
  PRODUCTS: 'products',
  SCAN_RECORDS: 'scanRecords',
  QR_CODES: 'qrCodes',
  REPORTS: 'reports',
  USERS: 'users',
  SYNC_QUEUE: 'syncQueue', // For queuing offline changes
}

class IndexedDBService {
  constructor() {
    this.db = null
    this.initPromise = this.initDB()
  }

  /**
   * Initialize IndexedDB database
   */
  initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error('IndexedDB initialization failed:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log('IndexedDB initialized successfully')
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Create object stores
        if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
          const productStore = db.createObjectStore(STORES.PRODUCTS, { keyPath: 'id' })
          productStore.createIndex('brand', 'brand', { unique: false })
          productStore.createIndex('sku', 'sku', { unique: true })
          productStore.createIndex('createdAt', 'created_at', { unique: false })
        }

        if (!db.objectStoreNames.contains(STORES.SCAN_RECORDS)) {
          const scanStore = db.createObjectStore(STORES.SCAN_RECORDS, { keyPath: 'id' })
          scanStore.createIndex('qrCode', 'qr_code', { unique: false })
          scanStore.createIndex('scannedAt', 'scanned_at', { unique: false })
          scanStore.createIndex('status', 'status', { unique: false })
        }

        if (!db.objectStoreNames.contains(STORES.QR_CODES)) {
          const qrStore = db.createObjectStore(STORES.QR_CODES, { keyPath: 'id' })
          qrStore.createIndex('codeHash', 'code_hash', { unique: true })
          qrStore.createIndex('product', 'product', { unique: false })
        }

        if (!db.objectStoreNames.contains(STORES.REPORTS)) {
          const reportStore = db.createObjectStore(STORES.REPORTS, { keyPath: 'id' })
          reportStore.createIndex('status', 'status', { unique: false })
          reportStore.createIndex('reportedAt', 'reported_at', { unique: false })
        }

        if (!db.objectStoreNames.contains(STORES.USERS)) {
          db.createObjectStore(STORES.USERS, { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true })
        }
      }
    })
  }

  /**
   * Ensure DB is ready before operations
   */
  async ensureDB() {
    if (!this.db) {
      this.db = await this.initPromise
    }
  }

  /**
   * Add or update data in a store
   */
  async put(storeName, data) {
    await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Add multiple items to store
   */
  async putMany(storeName, dataArray) {
    await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const results = []

      dataArray.forEach((item) => {
        const request = store.put(item)
        request.onsuccess = () => results.push(request.result)
        request.onerror = () => reject(request.error)
      })

      transaction.oncomplete = () => resolve(results)
    })
  }

  /**
   * Get a single item by key
   */
  async get(storeName, key) {
    await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get all items from a store
   */
  async getAll(storeName) {
    await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Query by index
   */
  async queryByIndex(storeName, indexName, value) {
    await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const index = store.index(indexName)
      const request = index.getAll(value)

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Delete an item
   */
  async delete(storeName, key) {
    await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Clear an entire store
   */
  async clear(storeName) {
    await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Clear all data (useful for logout)
   */
  async clearAll() {
    await this.ensureDB()
    const storeNames = Object.values(STORES)
    return Promise.all(storeNames.map((store) => this.clear(store)))
  }
}

export const db = new IndexedDBService()
export const STORES_ENUM = STORES
