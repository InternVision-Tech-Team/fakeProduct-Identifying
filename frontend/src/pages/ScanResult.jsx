import { useLocation, Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, AlertTriangle, XCircle, ScanLine, Package, Calendar, Hash, Tag, ArrowLeft } from 'lucide-react'

const STATUS_CONFIG = {
  VERIFIED: {
    bg:      'bg-emerald-50 border-emerald-200',
    icon:    <CheckCircle2 size={48} className="text-emerald-500" />,
    title:   'Product Verified!',
    titleCls:'text-emerald-700',
    badge:   'badge-verified',
  },
  WARNING: {
    bg:      'bg-amber-50 border-amber-200',
    icon:    <AlertTriangle size={48} className="text-amber-500" />,
    title:   'Warning – Possible Fake!',
    titleCls:'text-amber-700',
    badge:   'badge-warning',
  },
  INVALID: {
    bg:      'bg-red-50 border-red-200',
    icon:    <XCircle size={48} className="text-red-500" />,
    title:   'Code Not Found',
    titleCls:'text-red-700',
    badge:   'badge-invalid',
  },
}

function Field({ icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <span className="text-slate-400 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm text-slate-700 font-semibold">{value}</p>
      </div>
    </div>
  )
}

export default function ScanResult() {
  const location = useLocation()
  const navigate = useNavigate()
  const { result, code } = location.state || {}

  if (!result) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-slate-500 mb-4">No scan result found.</p>
        <Link to="/scan" className="btn-primary">Go to Scanner</Link>
      </div>
    )
  }

  const cfg     = STATUS_CONFIG[result.status] || STATUS_CONFIG.INVALID
  const product = result.product || {}
  const info    = result.scan_info || {}

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ArrowLeft size={15} /> Back
      </button>

      {/* Status card */}
      <div className={`card border-2 text-center mb-6 ${cfg.bg}`}>
        <div className="flex justify-center mb-3">{cfg.icon}</div>
        <h1 className={`text-2xl font-extrabold mb-2 ${cfg.titleCls}`}>{cfg.title}</h1>
        <p className="text-sm text-slate-600 mb-4">{result.message}</p>

        {info.first_scan && (
          <div className="text-xs text-slate-500 bg-white/70 rounded-lg px-3 py-2 inline-block">
            First scanned: <strong>{new Date(info.first_scan).toLocaleString()}</strong>
            {info.total_scans > 1 && <span className="ml-2 text-amber-600 font-bold">({info.total_scans} total scans)</span>}
          </div>
        )}
      </div>

      {/* Product details */}
      {product.name && (
        <div className="card mb-6">
          <h2 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Package size={18} className="text-sky-500" /> Product Details
          </h2>
          {product.image_url && (
            <img src={product.image_url} alt={product.name}
              className="w-24 h-24 object-cover rounded-xl border mb-3" />
          )}
          <Field icon={<Tag size={15} />}      label="Product Name"       value={product.name} />
          <Field icon={<Tag size={15} />}      label="Brand"              value={product.brand} />
          <Field icon={<Hash size={15} />}     label="SKU"                value={product.sku} />
          <Field icon={<Hash size={15} />}     label="Batch Number"       value={product.batch_number} />
          <Field icon={<Calendar size={15} />} label="Manufacturing Date" value={product.manufacturing_date} />
          <Field icon={<Calendar size={15} />} label="Expiry Date"        value={product.expiry_date} />
          <Field icon={<Tag size={15} />}      label="Category"           value={product.category} />
          {product.description && (
            <p className="text-sm text-slate-500 mt-3 pt-3 border-t border-slate-100">{product.description}</p>
          )}
        </div>
      )}

      {/* Code */}
      <div className="card mb-6">
        <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">Scanned Code</p>
        <code className="text-xs bg-slate-100 px-3 py-2 rounded-lg block break-all text-slate-600">{code}</code>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/scan" className="btn-primary flex-1 justify-center">
          <ScanLine size={16} /> Scan Another
        </Link>
        {result.status === 'WARNING' && (
          <button className="btn-secondary flex-1 justify-center text-red-600 border-red-200 hover:bg-red-50">
            Report Suspicious Product
          </button>
        )}
      </div>
    </div>
  )
}
