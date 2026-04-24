import { useEffect, useState } from 'react'
import api from '../api'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { LayoutDashboard, Package, QrCode, ScanLine, AlertTriangle, Loader2 } from 'lucide-react'

const PIE_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Dashboard() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    api.get('/dashboard/stats/')
      .then(r => setStats(r.data))
      .catch(() => setError('Could not load dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-sky-500" size={36} /></div>
  if (error)   return <div className="max-w-xl mx-auto mt-12 bg-red-50 text-red-600 rounded-xl p-6 text-sm">{error}</div>

  const ov = stats.overview

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="text-sky-500" size={28} />
        <div>
          <h1 className="text-2xl font-bold">Brand Dashboard</h1>
          <p className="text-slate-500 text-sm">Real-time anti-counterfeit analytics</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Package size={22} />}    label="Total Products" value={ov.total_products} color="sky"     sub="in your catalog" />
        <StatCard icon={<QrCode size={22} />}     label="QR Codes"       value={ov.total_qr_codes} color="emerald" sub="generated total" />
        <StatCard icon={<ScanLine size={22} />}   label="Total Scans"    value={ov.total_scans}    color="sky"     sub="all-time" />
        <StatCard icon={<AlertTriangle size={22} />} label="Fake Alerts" value={ov.fake_alerts}    color="amber"   sub="duplicate detections" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Weekly area chart */}
        <div className="card lg:col-span-2">
          <h2 className="font-semibold mb-4 text-slate-700">Scans – Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.weekly_data}>
              <defs>
                <linearGradient id="gradScans"  x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradAlerts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="scans"  stroke="#0ea5e9" fill="url(#gradScans)"  name="Scans" />
              <Area type="monotone" dataKey="alerts" stroke="#f59e0b" fill="url(#gradAlerts)" name="Alerts" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie */}
        <div className="card">
          <h2 className="font-semibold mb-4 text-slate-700">Products by Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.category_breakdown} dataKey="count" nameKey="category"
                cx="50%" cy="50%" outerRadius={75} label={({ category }) => category}>
                {stats.category_breakdown.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent alerts table */}
      <div className="card">
        <h2 className="font-semibold mb-4 text-slate-700 flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500" /> Recent Fake Alerts
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-400 text-xs uppercase">
                <th className="pb-3 pr-4">Product</th>
                <th className="pb-3 pr-4">Code</th>
                <th className="pb-3 pr-4">Location</th>
                <th className="pb-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats.recent_alerts.map((a, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-4 font-medium text-slate-700">{a.product}</td>
                  <td className="py-3 pr-4">
                    <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">{a.code}</code>
                  </td>
                  <td className="py-3 pr-4 text-slate-500">{a.location}</td>
                  <td className="py-3 text-slate-500">{new Date(a.time).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
