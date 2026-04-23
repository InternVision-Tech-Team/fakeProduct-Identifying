import { Link } from 'react-router-dom'
import { ShieldCheck, ScanLine, AlertTriangle, BarChart3, QrCode, CheckCircle2, XCircle } from 'lucide-react'

const features = [
  { icon: <ScanLine size={28} className="text-sky-500" />,     title: 'Instant QR Scanning',  desc: 'Scan any QR code with your phone camera — works in the browser, no app needed.' },
  { icon: <ShieldCheck size={28} className="text-emerald-500" />, title: 'Real-time Verification', desc: 'Our system checks each code against the brand registry in milliseconds.' },
  { icon: <AlertTriangle size={28} className="text-amber-500" />, title: 'Duplicate Detection', desc: 'Second scans trigger automatic warnings — protecting consumers from counterfeits.' },
  { icon: <BarChart3 size={28} className="text-purple-500" />, title: 'Brand Analytics',     desc: 'Brands get full dashboards: scan locations, fake alerts, product stats.' },
  { icon: <QrCode size={28} className="text-sky-500" />,       title: 'Bulk QR Generation',  desc: 'Generate thousands of unique, cryptographically secure QR codes in one click.' },
  { icon: <CheckCircle2 size={28} className="text-rose-500" />, title: 'Report Counterfeits', desc: 'Consumers can flag suspicious products directly to the brand and our team.' },
]

const steps = [
  { step: '01', title: 'Brand registers & adds products', desc: 'Create an account, add product details, and generate unique QR codes per batch.' },
  { step: '02', title: 'Print & attach codes to products', desc: 'Download QR codes as PNG or PDF and attach them to your packaging.' },
  { step: '03', title: 'Consumer scans the code',         desc: 'Any consumer opens FakeDetect and scans the code on their mobile browser.' },
  { step: '04', title: 'Instant verification result',     desc: 'See ✅ Verified, ⚠️ Warning (duplicate), or ❌ Invalid in seconds.' },
]

export default function Home() {
  return (
    <div className="w-full">

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-sky-900 via-sky-800 to-cyan-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white,transparent_60%)]" />
        <div className="max-w-5xl mx-auto px-6 py-24 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6 backdrop-blur-sm">
            <ShieldCheck size={16} className="text-cyan-300" />
            Anti-Counterfeit Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Stop Fake Products<br />
            <span className="text-cyan-300">Before They Reach Consumers</span>
          </h1>
          <p className="text-sky-100 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            FakeDetect lets brands embed unique QR codes in their products and lets consumers
            verify authenticity instantly — right from their mobile browser.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/scan"     className="btn-primary   text-base px-8 py-3 shadow-lg shadow-sky-900/40">
              <ScanLine size={20} /> Scan a Product
            </Link>
            <Link to="/register" className="btn-secondary text-base px-8 py-3 bg-white/10 border-white/30 text-white hover:bg-white/20">
              Register Your Brand →
            </Link>
          </div>
        </div>
      </section>

      {/* Status demo strip */}
      <section className="bg-white border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {[
            { icon: <CheckCircle2 className="text-emerald-500 mx-auto" size={32} />, label: 'VERIFIED', sub: 'First scan — Genuine product', bg: 'bg-emerald-50' },
            { icon: <AlertTriangle className="text-amber-500  mx-auto" size={32} />, label: 'WARNING',  sub: 'Already scanned — Possible fake', bg: 'bg-amber-50' },
            { icon: <XCircle      className="text-red-500    mx-auto" size={32} />, label: 'INVALID',  sub: 'Code not found — Counterfeit', bg: 'bg-red-50' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl p-5 ${s.bg}`}>
              {s.icon}
              <p className="font-bold text-lg mt-2">{s.label}</p>
              <p className="text-sm text-slate-500 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-2">Everything You Need</h2>
        <p className="text-slate-500 text-center mb-12">For brands and consumers alike</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="card hover:shadow-md transition-shadow">
              <div className="mb-3">{f.icon}</div>
              <h3 className="font-bold text-slate-800 mb-1">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {steps.map(s => (
              <div key={s.step} className="flex gap-4">
                <span className="text-4xl font-black text-sky-500 leading-none">{s.step}</span>
                <div>
                  <h3 className="font-bold text-lg mb-1">{s.title}</h3>
                  <p className="text-slate-400 text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sky-600 text-white text-center py-16 px-6">
        <h2 className="text-3xl font-bold mb-4">Ready to Protect Your Products?</h2>
        <p className="text-sky-100 mb-8 max-w-xl mx-auto">
          Join brands already using FakeDetect to safeguard their customers and reputation.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/demo-codes" className="btn-secondary bg-white text-sky-700 border-white hover:bg-sky-50">
            Try Demo Scanner
          </Link>
          <Link to="/register"   className="btn-primary bg-sky-800 hover:bg-sky-900 border border-sky-700">
            Get Started Free
          </Link>
        </div>
      </section>

    </div>
  )
}
