import { useEffect, useState } from 'react'
import api from '../api'
import StatusBadge from '../components/StatusBadge'
import { History, Loader2, Search } from 'lucide-react'

export default function ScanHistory() {
  const [scans, setScans]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    api.get('/scans/history/')
      .then(r => setScans(r.data.results))
      .finally(() => setLoading(false))
  }, [])

  const filtered = scans.filter(s =>
    s.product.toLowerCase().includes(filter.toLowerCase()) ||
    s.status.toLowerCase().includes(filter.toLowerCase()) ||
    s.brand.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <History className="text-sky-500" size={28} />
        <div>
          <h1 className="text-2xl font-bold">Scan History</h1>
          <p className="text-slate-500 text-sm">All products you've verified</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={filter} onChange={e => setFilter(e.target.value)}
          className="input pl-9" placeholder="Search by product, brand, or status…" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-sky-500" size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16 text-slate-400">
          <History size={40} className="mx-auto mb-3 opacity-30" />
          <p>No scan records found.</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-left text-slate-400 text-xs uppercase">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Brand</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Scanned At</th>
                  <th className="px-6 py-4">Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{s.product}</td>
                    <td className="px-6 py-4 text-slate-500">{s.brand}</td>
                    <td className="px-6 py-4"><StatusBadge status={s.status} /></td>
                    <td className="px-6 py-4 text-slate-500">{new Date(s.scanned_at).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">{s.code}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
