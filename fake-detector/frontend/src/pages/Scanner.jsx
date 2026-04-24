import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import api from '../api'
import { ScanLine, Keyboard, Camera, Loader2 } from 'lucide-react'

export default function Scanner() {
  const navigate      = useNavigate()
  const scannerRef    = useRef(null)
  const html5QrRef    = useRef(null)
  const [mode, setMode]         = useState('camera')   // 'camera' | 'manual'
  const [manualCode, setManual] = useState('')
  const [scanning, setScanning] = useState(false)
  const [error, setError]       = useState('')
  const [apiLoading, setApiLoading] = useState(false)

  const onScanSuccess = async (decodedText) => {
    if (apiLoading) return
    stopScanner()
    await submitCode(decodedText)
  }

  const submitCode = async (code) => {
    setApiLoading(true)
    setError('')
    try {
      const { data } = await api.post('/scan/', { code })
      navigate('/scan/result', { state: { result: data, code } })
    } catch {
      setError('Failed to reach the server. Please try again.')
      setScanning(false)
    } finally {
      setApiLoading(false)
    }
  }

  const startScanner = async () => {
    setError('')
    setScanning(true)
    try {
      const html5Qr = new Html5Qrcode('qr-reader')
      html5QrRef.current = html5Qr
      await html5Qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        () => {},
      )
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions or use manual input.')
      setScanning(false)
    }
  }

  const stopScanner = () => {
    html5QrRef.current?.stop().catch(() => {})
    html5QrRef.current = null
    setScanning(false)
  }

  useEffect(() => () => stopScanner(), [])

  const handleManual = async (e) => {
    e.preventDefault()
    if (!manualCode.trim()) return
    await submitCode(manualCode.trim())
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <ScanLine className="mx-auto text-sky-500 mb-3" size={44} />
        <h1 className="text-2xl font-bold">Scan a Product</h1>
        <p className="text-slate-500 text-sm mt-1">
          Point your camera at the product's QR code, or enter the code manually.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-xl overflow-hidden border border-slate-200 mb-6">
        {[
          { key: 'camera', icon: <Camera size={15} />,   label: 'Camera' },
          { key: 'manual', icon: <Keyboard size={15} />, label: 'Manual Input' },
        ].map(m => (
          <button
            key={m.key}
            onClick={() => { stopScanner(); setMode(m.key); setError('') }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors
              ${mode === m.key ? 'bg-sky-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            {m.icon}{m.label}
          </button>
        ))}
      </div>

      {/* Camera scanner */}
      {mode === 'camera' && (
        <div className="card">
          <div id="qr-reader" className={`w-full rounded-xl overflow-hidden bg-slate-100 ${scanning ? 'min-h-[280px]' : 'hidden'}`} />

          {!scanning && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-24 h-24 rounded-2xl bg-sky-50 border-2 border-dashed border-sky-300 flex items-center justify-center">
                <Camera size={36} className="text-sky-400" />
              </div>
              <p className="text-slate-500 text-sm text-center">
                Click below to open your camera and scan the QR code on the product.
              </p>
              <button className="btn-primary" onClick={startScanner} disabled={apiLoading}>
                <Camera size={16} /> Start Camera
              </button>
            </div>
          )}

          {scanning && (
            <div className="mt-4 text-center">
              <p className="text-sm text-slate-500 animate-pulse">Scanning… point at a QR code</p>
              <button className="mt-3 btn-secondary text-sm" onClick={stopScanner}>Stop Camera</button>
            </div>
          )}
        </div>
      )}

      {/* Manual input */}
      {mode === 'manual' && (
        <div className="card">
          <p className="text-sm text-slate-500 mb-4">
            Enter the verification code printed on the product (usually below the QR code).
          </p>
          <form onSubmit={handleManual} className="space-y-3">
            <input
              value={manualCode} onChange={e => setManual(e.target.value)}
              className="input font-mono" placeholder="e.g. VERIFY-prod_001-ALPHA123"
            />
            <button type="submit" className="btn-primary w-full justify-center" disabled={apiLoading}>
              {apiLoading ? <><Loader2 size={16} className="animate-spin" /> Checking…</> : <><ScanLine size={16} /> Verify Code</>}
            </button>
          </form>
          <p className="text-xs text-slate-400 mt-3 text-center">
            Tip: Try <code className="bg-slate-100 px-1 rounded">VERIFY-prod_001-ALPHA123</code> for a demo.
          </p>
        </div>
      )}

      {/* API loading overlay */}
      {apiLoading && (
        <div className="mt-4 text-center text-sky-600 flex items-center justify-center gap-2">
          <Loader2 size={18} className="animate-spin" /> Contacting verification server…
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Info box */}
      <div className="mt-6 bg-sky-50 border border-sky-100 rounded-xl p-4 text-sm text-sky-700">
        <strong>How it works:</strong> Each genuine product has a unique QR code.
        The first scan marks it as verified. Any subsequent scan triggers a warning —
        helping you spot counterfeits instantly.
      </div>
    </div>
  )
}
