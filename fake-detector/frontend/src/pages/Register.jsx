import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShieldCheck, UserPlus } from 'lucide-react'

export default function Register() {
  const { register }    = useAuth()
  const navigate        = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'consumer' })
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    setLoading(true)
    try {
      const data = await register(form)
      setSuccess(data.message || 'Account created! You can now log in.')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <ShieldCheck className="mx-auto text-sky-500 mb-3" size={44} />
          <h1 className="text-2xl font-bold">Create Your Account</h1>
          <p className="text-slate-500 mt-1 text-sm">Start protecting or verifying products today.</p>
        </div>

        <div className="card space-y-4">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name / Company</label>
              <input name="name" value={form.name} onChange={handle}
                className="input" placeholder="e.g. Acme Corp or John Doe" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handle}
                className="input" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input name="password" type="password" value={form.password} onChange={handle}
                className="input" placeholder="Min 8 characters" minLength={8} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">I am a…</label>
              <select name="role" value={form.role} onChange={handle} className="input">
                <option value="consumer">Consumer (scan products)</option>
                <option value="brand">Brand / Manufacturer (protect products)</option>
              </select>
            </div>

            {error   && <p className="text-red-500   text-sm bg-red-50   px-3 py-2 rounded-lg">{error}</p>}
            {success && <p className="text-emerald-600 text-sm bg-emerald-50 px-3 py-2 rounded-lg">{success}</p>}

            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              <UserPlus size={16} /> {loading ? 'Creating…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
