import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import StatusBadge from '../components/StatusBadge'
import { QrCode, ScanLine, Loader2, Info } from 'lucide-react'

export default function DemoCodes() {
  const [codes, setCodes]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.get('/demo/codes/')
      .then(r => setCodes(r.data))
      .catch(() => setError('Could not load demo codes. Make sure the backend is running.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <QrCode className="mx-auto text-sky-500 mb-3" size={44} />
        <h1 className="text-2xl font-bold">Demo QR Codes</h1>
        <p className="text-slate-500 text-sm mt-1 max-w-xl mx-auto">
          These are real QR codes connected to the backend. Scan them with the scanner or
          copy the code text for manual entry. Each shows a different verification result.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex gap-3 bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 mb-8 text-sm text-sky-700">
        <Info size={18} className="shrink-0 mt-0.5" />
        <div>
          <strong>How to test:</strong> Print or display any QR code below and scan it with the{' '}
          <Link to="/scan" className="underline">Scanner page</Link>, or copy the code text and use Manual Input.
          Codes marked "will warn" have already been scanned once.
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-sky-500" size={32} />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {codes.map((demo, i) => (
          <div key={i} className="card flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow">
            <img src={demo.qr_image} alt={demo.code} className="w-44 h-44 object-contain rounded-xl border border-slate-100" />
            <div className="w-full">
              <p className="font-semibold text-slate-800 text-sm mb-1">{demo.product}</p>
              <code className="block text-xs bg-slate-100 rounded-lg px-2 py-1.5 break-all text-slate-500 mb-2">
                {demo.code}
              </code>
              <div className="flex items-center justify-center gap-2">
                <StatusBadge status={demo.expected_result} />
                <span className="text-xs text-slate-400">({demo.scans_so_far} prior scans)</span>
              </div>
            </div>
            <Link
              to="/scan"
              state={{ prefill: demo.code }}
              className="btn-secondary text-sm w-full justify-center"
            >
              <ScanLine size={14} /> Test This Code
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-10 card bg-slate-800 text-white border-0">
        <h2 className="font-bold mb-2">Manual Test Codes</h2>
        <p className="text-slate-400 text-sm mb-3">Copy any of these into the Manual Input on the Scanner page:</p>
        <div className="space-y-1.5">
          {[
            { code: 'VERIFY-prod_001-ALPHA123', desc: '→ Will return VERIFIED ✅' },
            { code: 'VERIFY-prod_001-BETA456',  desc: '→ Will return WARNING ⚠️ (already scanned)' },
            { code: 'FAKE-CODE-XYZ',            desc: '→ Will return INVALID ❌' },
          ].map(t => (
            <div key={t.code} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <code className="text-cyan-300 text-xs bg-slate-900 px-2 py-1 rounded-md">{t.code}</code>
              <span className="text-slate-400 text-xs">{t.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
