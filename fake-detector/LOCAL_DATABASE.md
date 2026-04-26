# Local Database Implementation Guide

## Overview

The FakeDetect application now includes a comprehensive local database system that stores data locally on the user's device. This enables:

- ✅ **Offline-first functionality** - App works without internet connection
- ✅ **Automatic data caching** - Faster load times
- ✅ **Background sync** - Automatic synchronization when connection restored
- ✅ **Offline queue** - Queue operations performed offline and sync when online
- ✅ **Service Worker** - Cache assets and enable offline browsing

---

## Architecture

### 1. **IndexedDB** (`services/indexedDB.js`)
Low-level database operations for storing:
- Products
- Scan Records
- QR Codes
- Reports
- Users
- Sync Queue

### 2. **Data Sync Service** (`services/dataSync.js`)
Handles:
- Syncing data with backend API
- Queuing offline operations
- Processing pending changes
- Auto-sync every 30 seconds
- Sync on connection restore

### 3. **Enhanced API Module** (`api.js`)
- `api.getWithCache()` - Fetch with smart caching
- `api.postWithQueue()` - POST with offline support
- Automatic cache validation
- Fallback to local data when offline

### 4. **useLocalData Hook** (`hooks/useLocalData.js`)
React hook for components:
```javascript
const { data, loading, error, isFromCache, isOffline } = useLocalData('/products/')
```

### 5. **Service Worker** (`public/sw.js`)
Provides:
- Static asset caching
- Network request handling
- Background sync capability

---

## Usage Examples

### Fetching Data with Caching

```javascript
import useLocalData from './hooks/useLocalData'

function ProductList() {
  const { data, loading, error, isFromCache, isOffline } = useLocalData('/products/')

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {isOffline && <p className="text-yellow-600">📡 Offline mode - showing cached data</p>}
      {isFromCache && <p className="text-blue-600">💾 Using cached data</p>}
      
      {data.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
```

### Posting Data with Offline Support

```javascript
import api from './api'
import { syncService } from './services/dataSync'

async function createProduct(productData) {
  try {
    const response = await api.postWithQueue('/products/', productData)
    if (response.queued) {
      console.log('Offline: Operation queued for sync')
    }
  } catch (error) {
    console.error('Failed:', error)
  }
}
```

### Manual Sync

```javascript
import { syncService } from './services/dataSync'

async function manualSync() {
  const result = await syncService.fullSync()
  console.log('Sync completed:', result)
}
```

### Get Pending Operations

```javascript
const pending = await syncService.getPendingOperations()
console.log(`${pending.length} operations waiting to sync`)
```

---

## Cache Configuration

Configured in `api.js`:

```javascript
const CACHE_CONFIG = {
  '/products/': { ttl: 5 * 60 * 1000, store: STORES_ENUM.PRODUCTS },      // 5 minutes
  '/scans/': { ttl: 3 * 60 * 1000, store: STORES_ENUM.SCAN_RECORDS },      // 3 minutes
  '/qr-codes/': { ttl: 10 * 60 * 1000, store: STORES_ENUM.QR_CODES },      // 10 minutes
  '/reports/': { ttl: 5 * 60 * 1000, store: STORES_ENUM.REPORTS },         // 5 minutes
}
```

Adjust TTL (time-to-live) values based on your needs.

---

## Key Features

### 1. Automatic Sync
- Syncs every 30 seconds when online
- Syncs automatically when connection is restored
- Shows "Offline" indicator in SyncStatus component

### 2. Smart Caching
- Cache timestamps are tracked in localStorage
- Stale cache is automatically refreshed
- Offline mode uses cached data as fallback

### 3. Offline Queue
- Operations performed offline are queued
- Queue is processed when connection restored
- Each queued operation includes timestamp and type

### 4. Data Persistence
- Data survives browser refresh
- User data cleared on logout
- IndexedDB provides ~50MB storage per domain

### 5. Conflict Resolution
- Server data takes priority during sync
- Offline changes are merged with server updates

---

## Component Integration

### SyncStatus Component
Shows online/offline status and sync information:
```javascript
import SyncStatus from './components/SyncStatus'

<SyncStatus />  // Add to your app
```

Displays:
- Online/Offline indicator (green/red dot)
- Last sync time
- Sync in progress indicator

---

## LocalStorage Keys Used

```
access_token              - JWT token
user                      - User information
lastSyncTime              - Last sync timestamp
cache_[endpoint]_timestamp - Cache timestamps for each endpoint
```

---

## IndexedDB Databases

Database: `FakeDetectDB`

**Object Stores:**
- `products` - Indexed by: brand, sku, createdAt
- `scanRecords` - Indexed by: qrCode, scannedAt, status
- `qrCodes` - Indexed by: codeHash, product
- `reports` - Indexed by: status, reportedAt
- `users` - Simple key-value store
- `syncQueue` - Auto-incrementing queue for pending operations

---

## Troubleshooting

### Check IndexedDB
```javascript
// In browser console
// List all products
const db = window.indexedDB
db.open('FakeDetectDB').onsuccess = (e) => {
  const products = e.target.result.transaction(['products']).objectStore('products').getAll()
}
```

### Clear All Local Data
```javascript
// In browser console
import { db } from './services/indexedDB'
await db.clearAll()
localStorage.clear()
```

### Check Pending Operations
```javascript
// In browser console
import { syncService } from './services/dataSync'
const pending = await syncService.getPendingOperations()
console.log(pending)
```

### View Service Worker
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs)
})
```

---

## Best Practices

1. **Use `useLocalData` hook** for all product/data fetching
2. **Use `api.postWithQueue()`** for offline-safe POST requests
3. **Call `syncService.fullSync()`** after important operations
4. **Handle `isOffline` state** to show appropriate UI messages
5. **Test offline mode** using DevTools → Network → Offline
6. **Monitor cache size** in DevTools → Application → IndexedDB

---

## Performance Notes

- First load caches data for ~5-10 minutes
- Subsequent loads use cached data (faster)
- Stale data automatically refreshed
- IndexedDB queries are async but fast
- Service Worker caches static assets (~2MB)

---

## Browser Support

- ✅ Chrome 24+
- ✅ Firefox 16+
- ✅ Safari 15.1+
- ✅ Edge 79+
- ⚠️ IE 11 (no IndexedDB, limited offline support)

---

## Future Enhancements

- [ ] Compression for larger datasets
- [ ] Delta sync (only sync changed data)
- [ ] Conflict resolution UI
- [ ] Export/Import local data
- [ ] P2P sync between devices
- [ ] Scheduled background sync

---

## API Reference

### IndexedDB Service (`services/indexedDB.js`)

```javascript
import { db, STORES_ENUM } from './services/indexedDB'

// Basic operations
await db.put(STORES_ENUM.PRODUCTS, productData)
await db.putMany(STORES_ENUM.PRODUCTS, [prod1, prod2])
await db.get(STORES_ENUM.PRODUCTS, productId)
await db.getAll(STORES_ENUM.PRODUCTS)
await db.queryByIndex(STORES_ENUM.PRODUCTS, 'sku', 'SKU123')
await db.delete(STORES_ENUM.PRODUCTS, productId)
await db.clear(STORES_ENUM.PRODUCTS)
await db.clearAll()
```

### Sync Service (`services/dataSync.js`)

```javascript
import { syncService } from './services/dataSync'

// Sync operations
await syncService.fullSync()
await syncService.syncProducts()
await syncService.syncScanRecords()
await syncService.queueOperation('create', STORES_ENUM.PRODUCTS, data)
await syncService.getPendingOperations()
await syncService.removeSyncedOperation(operationId)
syncService.startAutoSync(intervalMs)
```

---

## Security Considerations

1. ⚠️ **Token Storage**: Access tokens stored in localStorage
   - Consider: Token refresh on app start
   - Consider: Secure HttpOnly cookies for tokens

2. ⚠️ **Data Privacy**: Local data visible to browser extensions
   - Clear data on logout (✅ implemented)
   - Consider: Encryption for sensitive data

3. ⚠️ **Service Worker Cache**: Static assets cached indefinitely
   - Manual cache invalidation required
   - Consider: Versioning strategy

---

## Support

For issues or questions:
1. Check browser console for errors
2. Verify network connectivity
3. Check DevTools → Application → IndexedDB
4. Clear cache: `await db.clearAll()`
5. Restart browser

