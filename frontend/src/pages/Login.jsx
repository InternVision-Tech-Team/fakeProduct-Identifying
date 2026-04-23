import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShieldCheck, LogIn, Eye, EyeOff } from 'lucide-react'

const DEMO_ACCOUNTS = [
  { email: 'brand@demo.com', password: 'demo1234', role: 'Brand User' },
  { email: 'admin@demo.com', password: 'admin123', role: 'Admin' },
  { email: 'user@demo.com',  password: 'user1234', role: 'Consumer' },
]

export default function Login() {
  const { login }       = useAuth()
  const navigate        = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      navigate(user.role === 'brand' || user.role === 'admin' ? '/dashboard' : '/')
    } catch {
      setError('Invalid email or password. Try a demo account below.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (acc) => setForm({ email: acc.email, password: acc.password })

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <ShieldCheck className="mx-auto text-sky-500 mb-3" size={44} />
          <h1 className="text-2xl font-bold">Sign in to FakeDetect</h1>
          <p className="text-slate-500 mt-1 text-sm">Welcome back — let's protect products.</p>
        </div>

        <div className="card">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handle}
                className="input" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handle}
                  className="input pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              <LogIn size={16} /> {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-sky-600 font-medium hover:underline">Register</Link>
          </p>
        </div>

        {/* Demo accounts */}
        <div className="mt-6">
          <p className="text-xs text-slate-400 text-center mb-3 uppercase tracking-wide">Quick demo accounts</p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map(a => (
              <button key={a.email} onClick={() => fillDemo(a)}
                className="text-xs p-2 rounded-xl border border-slate-200 bg-white hover:border-sky-400 hover:bg-sky-50 transition-colors text-center">
                <span className="block font-semibold text-slate-700">{a.role}</span>
                <span className="text-slate-400">{a.email}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 text-center mt-2">Click a role to auto-fill credentials</p>
        </div>
      </div>
    </div>
  )
}
