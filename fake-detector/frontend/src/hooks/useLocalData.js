/**
 * useLocalData Hook
 * Fetches data from API with automatic local caching
 */

import { useState, useEffect } from 'react'
import api from '../api'

export function useLocalData(endpoint, options = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFromCache, setIsFromCache] = useState(false)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Use cached fetch method if available
        if (api.getWithCache) {
          const response = await api.getWithCache(endpoint, options)
          setData(response.data.results || [])
          setIsFromCache(response.fromCache || false)
          setIsOffline(response.offline || false)
        } else {
          // Fallback to regular API call
          const response = await api.get(endpoint, options)
          setData(response.data.results || [])
          setIsFromCache(false)
        }

        setError(null)
      } catch (err) {
        console.error(`Failed to fetch ${endpoint}:`, err)
        setError(err.message || 'Failed to fetch data')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [endpoint, options])

  return {
    data,
    loading,
    error,
    isFromCache,
    isOffline,
  }
}

export default useLocalData
