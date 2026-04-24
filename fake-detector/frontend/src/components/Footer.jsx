import { ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <ShieldCheck className="text-sky-400" size={22} />
          FakeDetect
        </div>
        <p className="text-sm text-center">
          Fighting counterfeits, one scan at a time. &copy; {new Date().getFullYear()} FakeDetect.
        </p>
        <div className="flex gap-4 text-sm">
          <Link to="/scan"       className="hover:text-white transition-colors">Scan</Link>
          <Link to="/demo-codes" className="hover:text-white transition-colors">Demo</Link>
          <Link to="/login"      className="hover:text-white transition-colors">Login</Link>
        </div>
      </div>
    </footer>
  )
}
