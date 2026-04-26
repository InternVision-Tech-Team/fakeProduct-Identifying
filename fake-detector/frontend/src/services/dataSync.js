/**
 * Data Sync Service
 * Handles syncing offline changes with the backend server
 */

import { db, STORES_ENUM } from './indexedDB'
import api from '../api'

class DataSyncService {
  constructor() {
    this.isSyncing = false
    this.lastSyncTime = localStorage.getItem('lastSyncTime') || null
  }

  /**
   * Queue an operation for later sync
   */
  async queueOperation(operationType, storeName, data) {
    const operation = {
      type: operationType, // 'create', 'update', 'delete'
      store: storeName,
      data,
      timestamp: new Date().toISOString(),
      synced: false,
    }

    return db.put(STORES_ENUM.SYNC_QUEUE, operation)
  }

  /**
   * Get all pending sync operations
   */
  async getPendingOperations() {
    return db.getAll(STORES_ENUM.SYNC_QUEUE)
  }

  /**
   * Remove a synced operation from queue
   */
  async removeSyncedOperation(operationId) {
    return db.delete(STORES_ENUM.SYNC_QUEUE, operationId)
  }

  /**
   * Sync products with backend
   */
  async syncProducts() {
    try {
      const { data } = await api.get('/products/')
      await db.clear(STORES_ENUM.PRODUCTS)
      if (data.results && Array.isArray(data.results)) {
        await db.putMany(STORES_ENUM.PRODUCTS, data.results)
      }
      return data
    } catch (error) {
      console.error('Failed to sync products:', error)
      throw error
    }
  }

  /**
   * Sync scan records with backend
   */
  async syncScanRecords() {
    try {
      const { data } = await api.get('/scans/')
      await db.clear(STORES_ENUM.SCAN_RECORDS)
      if (data.results && Array.isArray(data.results)) {
        await db.putMany(STORES_ENUM.SCAN_RECORDS, data.results)
      }
      return data
    } catch (error) {
      console.error('Failed to sync scan records:', error)
      throw error
    }
  }

  /**
   * Sync QR codes with backend
   */
  async syncQRCodes() {
    try {
      const { data } = await api.get('/qr-codes/')
      await db.clear(STORES_ENUM.QR_CODES)
      if (data.results && Array.isArray(data.results)) {
        await db.putMany(STORES_ENUM.QR_CODES, data.results)
      }
      return data
    } catch (error) {
      console.error('Failed to sync QR codes:', error)
      throw error
    }
  }

  /**
   * Perform full data sync with backend
   */
  async fullSync() {
    if (this.isSyncing) {
      console.warn('Sync already in progress')
      return
    }

    this.isSyncing = true
    try {
      console.log('Starting full data sync...')

      // Sync all data types
      await Promise.all([this.syncProducts(), this.syncScanRecords(), this.syncQRCodes()])

      // Process pending operations
      await this.processPendingOperations()

      this.lastSyncTime = new Date().toISOString()
      localStorage.setItem('lastSyncTime', this.lastSyncTime)

      console.log('Full sync completed successfully')
      return { success: true, lastSyncTime: this.lastSyncTime }
    } catch (error) {
      console.error('Full sync failed:', error)
      return { success: false, error: error.message }
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * Process pending offline operations
   */
  async processPendingOperations() {
    const operations = await this.getPendingOperations()

    if (operations.length === 0) {
      console.log('No pending operations to sync')
      return
    }

    console.log(`Processing ${operations.length} pending operations`)

    for (const operation of operations) {
      try {
        await this.executePendingOperation(operation)
        await this.removeSyncedOperation(operation.id)
      } catch (error) {
        console.error(`Failed to execute operation ${operation.id}:`, error)
      }
    }
  }

  /**
   * Execute a single pending operation
   */
  async executePendingOperation(operation) {
    const { type, store, data } = operation

    switch (store) {
      case STORES_ENUM.PRODUCTS:
        return this.syncProductOperation(type, data)
      case STORES_ENUM.SCAN_RECORDS:
        return this.syncScanRecordOperation(type, data)
      case STORES_ENUM.REPORTS:
        return this.syncReportOperation(type, data)
      default:
        console.warn(`Unknown store type for sync: ${store}`)
    }
  }

  /**
   * Sync a product operation
   */
  async syncProductOperation(type, data) {
    switch (type) {
      case 'create':
        return api.post('/products/', data)
      case 'update':
        return api.put(`/products/${data.id}/`, data)
      case 'delete':
        return api.delete(`/products/${data.id}/`)
      default:
        throw new Error(`Unknown operation type: ${type}`)
    }
  }

  /**
   * Sync a scan record operation
   */
  async syncScanRecordOperation(type, data) {
    switch (type) {
      case 'create':
        return api.post('/scans/', data)
      case 'update':
        return api.put(`/scans/${data.id}/`, data)
      default:
        throw new Error(`Unknown operation type: ${type}`)
    }
  }

  /**
   * Sync a report operation
   */
  async syncReportOperation(type, data) {
    switch (type) {
      case 'create':
        return api.post('/reports/', data)
      case 'update':
        return api.put(`/reports/${data.id}/`, data)
      default:
        throw new Error(`Unknown operation type: ${type}`)
    }
  }

  /**
   * Check if online and sync automatically
   */
  startAutoSync(intervalMs = 30000) {
    // Auto-sync every 30 seconds if online
    setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.fullSync().catch((error) => console.error('Auto-sync failed:', error))
      }
    }, intervalMs)

    // Sync when connection is restored
    window.addEventListener('online', () => {
      console.log('Connection restored, syncing...')
      this.fullSync().catch((error) => console.error('Sync on reconnect failed:', error))
    })
  }
}

export const syncService = new DataSyncService()
