import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useEffect } from 'react'

import Navbar        from './components/Navbar'
import Footer        from './components/Footer'
import SyncStatus    from './components/SyncStatus'
import Home          from './pages/Home'
import Login         from './pages/Login'
import Register      from './pages/Register'
import Scanner       from './pages/Scanner'
import ScanResult    from './pages/ScanResult'
import Dashboard     from './pages/Dashboard'
import Products      from './pages/Products'
import QRGenerator   from './pages/QRGenerator'
import ScanHistory   from './pages/ScanHistory'
import DemoCodes     from './pages/DemoCodes'
import NotFound      from './pages/NotFound'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-sky-600 text-lg">Loading…</div>
  if (!user)   return <Navigate to="/login" replace />
  if (role && user.role !== role && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function AppContent() {
  useEffect(() => {
    // Register service worker for offline support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Service Worker registered successfully', reg)
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/login"       element={<Login />} />
            <Route path="/register"    element={<Register />} />
            <Route path="/scan"        element={<Scanner />} />
            <Route path="/scan/result" element={<ScanResult />} />
            <Route path="/demo-codes"  element={<DemoCodes />} />

            <Route path="/dashboard" element={
              <ProtectedRoute role="brand">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute role="brand">
                <Products />
              </ProtectedRoute>
            } />
            <Route path="/qr-generator" element={
              <ProtectedRoute role="brand">
                <QRGenerator />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <ScanHistory />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <SyncStatus />
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
