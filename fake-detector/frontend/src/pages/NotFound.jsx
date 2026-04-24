import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <ShieldCheck size={56} className="text-slate-200 mb-4" />
      <h1 className="text-6xl font-black text-slate-200 mb-2">404</h1>
      <p className="text-xl font-bold text-slate-700 mb-1">Page not found</p>
      <p className="text-slate-500 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary">Go Home</Link>
    </div>
  )
}
