import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShieldCheck, Menu, X, ScanLine, LayoutDashboard, Package, QrCode, History, LogOut, LogIn } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const location         = useLocation()
  const [open, setOpen]  = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  const navLinks = [
    { to: '/scan',       label: 'Scan',       icon: <ScanLine size={16} />,       always: true },
    { to: '/demo-codes', label: 'Demo Codes',  icon: <QrCode size={16} />,         always: true },
    { to: '/dashboard',  label: 'Dashboard',   icon: <LayoutDashboard size={16} />, auth: true, role: 'brand' },
    { to: '/products',   label: 'Products',    icon: <Package size={16} />,         auth: true, role: 'brand' },
    { to: '/qr-generator', label: 'QR Codes', icon: <QrCode size={16} />,          auth: true, role: 'brand' },
    { to: '/history',    label: 'History',     icon: <History size={16} />,         auth: true },
  ]

  const visible = navLinks.filter(l => {
    if (l.always) return true
    if (l.auth && !user) return false
    if (l.role && user?.role !== l.role && user?.role !== 'admin') return false
    return true
  })

  const isActive = (to) => location.pathname === to

  return (
    <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-sky-700">
            <ShieldCheck className="text-sky-500" size={26} />
            FakeDetect
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {visible.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive(l.to)
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                {l.icon}{l.label}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">
                  <span className="font-medium text-slate-700">{user.name}</span>
                  <span className="ml-1 text-xs px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full capitalize">{user.role}</span>
                </span>
                <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-3">
                  <LogOut size={15} /> Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login"    className="btn-secondary text-sm py-2">
                  <LogIn size={15} /> Login
                </Link>
                <Link to="/register" className="btn-primary  text-sm py-2">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pb-4 space-y-1">
          {visible.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium
                ${isActive(l.to) ? 'bg-sky-50 text-sky-700' : 'text-slate-600'}`}
            >
              {l.icon}{l.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <button onClick={() => { handleLogout(); setOpen(false) }} className="btn-secondary w-full justify-center">
                <LogOut size={15} /> Logout
              </button>
            ) : (
              <>
                <Link to="/login"    className="btn-secondary text-center" onClick={() => setOpen(false)}>Login</Link>
                <Link to="/register" className="btn-primary  text-center" onClick={() => setOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
