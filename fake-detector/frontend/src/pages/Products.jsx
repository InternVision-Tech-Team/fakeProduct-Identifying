import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { Package, Plus, Pencil, Trash2, QrCode, Loader2, X, Save } from 'lucide-react'

const EMPTY = {
  name: '', brand: '', sku: '', batch_number: '',
  manufacturing_date: '', expiry_date: '', description: '', category: 'Electronics',
}

const CATEGORIES = ['Electronics', 'Food & Beverage', 'Cosmetics', 'Pharmaceuticals', 'Clothing', 'General']

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/products/').then(r => setProducts(r.data.results)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit   = (p)  => { setEditing(p.id); setForm({ ...p }); setModal(true) }

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) {
        const { data } = await api.put(`/products/${editing}/`, form)
        setProducts(ps => ps.map(p => p.id === editing ? data : p))
      } else {
        const { data } = await api.post('/products/', form)
        setProducts(ps => [data, ...ps])
      }
      setModal(false)
    } finally { setSaving(false) }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this product?')) return
    setDeleting(id)
    await api.delete(`/products/${id}/`).catch(() => {})
    setProducts(ps => ps.filter(p => p.id !== id))
    setDeleting(null)
  }

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Package className="text-sky-500" size={28} />
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-slate-500 text-sm">{products.length} products in catalog</p>
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-sky-500" size={32} /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map(p => (
            <div key={p.id} className="card hover:shadow-md transition-shadow flex flex-col">
              <img src={p.image_url} alt={p.name} className="w-full h-36 object-cover rounded-xl border border-slate-100 mb-3" />
              <span className="text-xs bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full self-start mb-2">{p.category}</span>
              <h3 className="font-bold text-slate-800 text-sm mb-0.5">{p.name}</h3>
              <p className="text-xs text-slate-400 mb-0.5">{p.brand} · SKU: {p.sku}</p>
              <p className="text-xs text-slate-400 mb-3">Expires: {p.expiry_date}</p>
              <p className="text-xs text-slate-500 line-clamp-2 flex-1 mb-4">{p.description}</p>
              <div className="flex gap-2 mt-auto">
                <Link to="/qr-generator" state={{ product_id: p.id }} className="btn-secondary text-xs flex-1 justify-center py-2">
                  <QrCode size={13} /> QR
                </Link>
                <button onClick={() => openEdit(p)} className="btn-secondary text-xs flex-1 justify-center py-2">
                  <Pencil size={13} /> Edit
                </button>
                <button onClick={() => remove(p.id)} disabled={deleting === p.id}
                  className="btn-secondary text-xs px-3 py-2 text-red-500 border-red-100 hover:bg-red-50">
                  {deleting === p.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-bold text-lg">{editing ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              {[
                { name: 'name',               label: 'Product Name',       placeholder: 'e.g. Premium Headphones' },
                { name: 'brand',              label: 'Brand',              placeholder: 'e.g. SoundTech' },
                { name: 'sku',                label: 'SKU',                placeholder: 'e.g. ST-WH-2024' },
                { name: 'batch_number',       label: 'Batch Number',       placeholder: 'e.g. BT20240301' },
                { name: 'manufacturing_date', label: 'Manufacturing Date', type: 'date' },
                { name: 'expiry_date',        label: 'Expiry Date',        type: 'date' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium mb-1">{f.label}</label>
                  <input name={f.name} type={f.type || 'text'} value={form[f.name]}
                    onChange={handle} className="input" placeholder={f.placeholder} required />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select name="category" value={form.category} onChange={handle} className="input">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handle}
                  className="input resize-none" rows={3} placeholder="Short product description…" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" className="btn-primary flex-1 justify-center" disabled={saving}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {editing ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
