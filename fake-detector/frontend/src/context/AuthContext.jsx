import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'
import { db } from '../services/indexedDB'
import { syncService } from '../services/dataSync'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
    setLoading(false)

    // Start auto-sync when provider mounts
    syncService.startAutoSync()
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login/', { email, password })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)

    // Sync data after login
    try {
      await syncService.fullSync()
    } catch (error) {
      console.error('Failed to sync after login:', error)
    }

    return data.user
  }

  const logout = async () => {
    localStorage.clear()
    // Clear all local data
    await db.clearAll()
    setUser(null)
  }

  const register = async (payload) => {
    const { data } = await api.post('/auth/register/', payload)
    return data
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
