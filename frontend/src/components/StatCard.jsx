export default function StatCard({ icon, label, value, color = 'sky', sub }) {
  const colors = {
    sky:     'bg-sky-50     text-sky-600     border-sky-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber:   'bg-amber-50   text-amber-600   border-amber-100',
    rose:    'bg-rose-50    text-rose-600    border-rose-100',
  }
  return (
    <div className={`card flex items-center gap-4 border ${colors[color]}`}>
      <div className={`p-3 rounded-xl text-2xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
