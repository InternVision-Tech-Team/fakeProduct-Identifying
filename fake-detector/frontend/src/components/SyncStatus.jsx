/**
 * SyncStatus Component
 * Displays sync status and offline indicator
 */

import { useEffect, useState } from 'react'
import { syncService } from '../services/dataSync'

export function SyncStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState(
    localStorage.getItem('lastSyncTime') || null,
  )

  useEffect(() => {
    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      syncService.fullSync().then(() => {
        setLastSyncTime(new Date().toISOString())
        localStorage.setItem('lastSyncTime', new Date().toISOString())
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const formatTime = (isoString) => {
    if (!isoString) return 'Never'
    const date = new Date(isoString)
    return date.toLocaleTimeString()
  }

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-md border border-gray-200">
      {/* Online/Offline Indicator */}
      <div
        className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
        title={isOnline ? 'Online' : 'Offline'}
      />

      {/* Status Text */}
      <span className="text-xs text-gray-600">
        {isOnline ? 'Online' : 'Offline'}
      </span>

      {/* Sync Info */}
      {lastSyncTime && (
        <span className="text-xs text-gray-500 border-l border-gray-300 pl-2">
          Synced: {formatTime(lastSyncTime)}
        </span>
      )}

      {/* Syncing Indicator */}
      {isSyncing && (
        <span className="text-xs text-blue-600 animate-pulse">Syncing...</span>
      )}
    </div>
  )
}

export default SyncStatus
