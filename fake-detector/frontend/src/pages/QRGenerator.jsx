import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../api'
import { QrCode, Download, Loader2, RefreshCw, ChevronDown } from 'lucide-react'

export default function QRGenerator() {
  const location      = useLocation()
  const prefill       = location.state?.product_id || ''

  const [products, setProducts] = useState([])
  const [productId, setProductId] = useState(prefill)
  const [count, setCount]       = useState(1)
  const [loading, setLoading]   = useState(false)
  const [loadingProds, setLoadingProds] = useState(true)
  const [results, setResults]   = useState([])
  const [error, setError]       = useState('')

  useEffect(() => {
    api.get('/products/').then(r => setProducts(r.data.results)).finally(() => setLoadingProds(false))
  }, [])

  const generate = async (e) => {
    e.preventDefault()
    if (!productId) return
    setLoading(true); setError(''); setResults([])
    try {
      const { data } = await api.post('/qrcodes/generate/', { product_id: productId, count })
      setResults(data.qr_codes)
    } catch {
      setError('Failed to generate QR codes. Check the backend is running.')
    } finally { setLoading(false) }
  }

  const download = (qrImage, code) => {
    const link    = document.createElement('a')
    link.href     = qrImage
    link.download = `${code}.png`
    link.click()
  }

  const downloadAll = () => results.forEach(r => download(r.qr_image, r.code))

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <QrCode className="text-sky-500" size={28} />
        <div>
          <h1 className="text-2xl font-bold">QR Code Generator</h1>
          <p className="text-slate-500 text-sm">Generate unique anti-counterfeit QR codes for your products.</p>
        </div>
      </div>

      {/* Form */}
      <div className="card mb-8">
        <form onSubmit={generate} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Select Product</label>
            {loadingProds ? (
              <div className="input flex items-center gap-2 text-slate-400">
                <Loader2 size={14} className="animate-spin" /> Loading products…
              </div>
            ) : (
              <select value={productId} onChange={e => setProductId(e.target.value)} className="input" required>
                <option value="">-- Choose a product --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            )}
          </div>
          <div className="w-36">
            <label className="block text-sm font-medium mb-1">Quantity (max 10)</label>
            <input type="number" min={1} max={10} value={count}
              onChange={e => setCount(Math.min(10, Math.max(1, +e.target.value)))}
              className="input" />
          </div>
          <button type="submit" className="btn-primary whitespace-nowrap" disabled={loading || loadingProds}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />}
            {loading ? 'Generating…' : 'Generate'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-700">
              {results.length} QR Code{results.length > 1 ? 's' : ''} Generated
            </h2>
            {results.length > 1 && (
              <button onClick={downloadAll} className="btn-secondary text-sm">
                <Download size={15} /> Download All
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {results.map((r, i) => (
              <div key={i} className="card flex flex-col items-center gap-3 hover:shadow-md transition-shadow">
                <img src={r.qr_image} alt={r.code}
                  className="w-40 h-40 object-contain rounded-xl border border-slate-100" />
                <code className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg break-all text-center w-full">
                  {r.code}
                </code>
                <button onClick={() => download(r.qr_image, r.code)}
                  className="btn-secondary text-xs w-full justify-center py-2">
                  <Download size={13} /> Download PNG
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
            <strong>⚠️ Important:</strong> Each QR code is unique and cryptographically secure.
            Once a code is scanned for the first time, it is marked as verified.
            Any subsequent scan will trigger a counterfeit warning.
            Print and attach these codes to your products before distribution.
          </div>
        </div>
      )}
    </div>
  )
}
