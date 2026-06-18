import { useState, useEffect, useRef } from 'react'
import { Search, Save, Trash2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'

const TYPES = [
  { value: 'add',    label: '+ Add (stock বাড়ান)',       color: 'text-emerald-700 bg-emerald-50' },
  { value: 'reduce', label: '− Reduce (stock কমান)',      color: 'text-red-700 bg-red-50' },
  { value: 'set',    label: '= Set (exact quantity দিন)', color: 'text-blue-700 bg-blue-50' },
]

const REASONS = [
  'Physical count correction',
  'Damaged goods',
  'Theft/loss',
  'Stock found',
  'System correction',
  'Expired goods',
  'Other',
]

const StockAdjustPage = () => {
  const [form, setForm] = useState({
    product: null, product_id: '',
    warehouse_id: '',
    type: 'add', quantity: '',
    reason: REASONS[0], notes: '',
  })
  const [warehouses, setWarehouses] = useState([])
  const [search,     setSearch]     = useState('')
  const [results,    setResults]    = useState([])
  const [searching,  setSearching]  = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [currentStock, setCurrentStock] = useState(null)
  const timer = useRef(null)

  useEffect(() => {
    api.get('/warehouses?per_page=100').then(({ data }) => {
      const d = data?.data
      const ws = Array.isArray(d) ? d : d?.data ?? []
      setWarehouses(ws)
      if (ws.length) setForm(p => ({ ...p, warehouse_id: String(ws[0].id) }))
    })
  }, [])

  // Product search
  useEffect(() => {
    clearTimeout(timer.current)
    if (!search.trim()) { setResults([]); return }
    timer.current = setTimeout(async () => {
      setSearching(true)
      try {
        const { data } = await api.get('/products', { params: { search, per_page: 8 } })
        const d = data?.data
        setResults(Array.isArray(d) ? d : d?.data ?? [])
      } finally { setSearching(false) }
    }, 400)
  }, [search])

  const selectProduct = (p) => {
    setForm(prev => ({ ...prev, product: p, product_id: p.id }))
    setSearch('')
    setResults([])
    setCurrentStock(p.stock ?? p.total_stock ?? 0)
  }

  const onChange = ({ target: { name, value } }) =>
    setForm(p => ({ ...p, [name]: value }))

  // Preview calculation
  const preview = () => {
    if (currentStock === null || !form.quantity) return null
    const qty = Number(form.quantity)
    if (form.type === 'add')    return { new: currentStock + qty, diff: `+${qty}` }
    if (form.type === 'reduce') return { new: Math.max(0, currentStock - qty), diff: `-${qty}` }
    if (form.type === 'set')    return { new: qty, diff: qty - currentStock >= 0 ? `+${qty - currentStock}` : `${qty - currentStock}` }
    return null
  }
  const prev = preview()

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.product_id) { toast.error('Product select করুন'); return }
    if (!form.quantity)   { toast.error('Quantity দিন');        return }
    if (!form.warehouse_id) { toast.error('Warehouse select করুন'); return }

    setSaving(true)
    try {
      await api.post('/stock/adjust', {
        product_id:   form.product_id,
        warehouse_id: form.warehouse_id,
        new_quantity: Number(form.quantity),
        note:         form.reason + (form.notes ? ` — ${form.notes}` : ''),
      })
      toast.success('Stock adjustment সফল হয়েছে ✓')
      setForm(p => ({ ...p, product: null, product_id: '', quantity: '', notes: '' }))
      setCurrentStock(null)
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Error হয়েছে')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Stock Adjustment</h1>
        <p className="page-subtitle">Product এর stock manually adjust করুন</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <form onSubmit={onSubmit} className="card card-body space-y-5">

            {/* Product Search */}
            <div>
              <label className="label">Product <span className="text-red-500">*</span></label>
              {form.product ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-800">{form.product.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {form.product.barcode && (
                        <span className="font-mono text-xs text-gray-400">{form.product.barcode}</span>
                      )}
                      {currentStock !== null && (
                        <span className="text-xs text-gray-500">
                          Current stock: <strong>{currentStock}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                  <button type="button" onClick={() => { setForm(p => ({ ...p, product: null, product_id: '' })); setCurrentStock(null) }}
                    className="text-gray-400 hover:text-red-500 p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Product name বা barcode দিন..."
                    className="input pl-9" autoFocus />
                  {(results.length > 0 || searching) && (
                    <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                      {searching ? (
                        <div className="py-4 text-center"><div className="spinner border-brand-600 mx-auto" /></div>
                      ) : results.map(p => (
                        <button key={p.id} type="button" onClick={() => selectProduct(p)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">{p.name}</p>
                            <p className="text-xs text-gray-400">
                              {p.barcode ?? ''} · Stock: {p.stock ?? p.total_stock ?? 0}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Warehouse + Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Warehouse <span className="text-red-500">*</span></label>
                <select name="warehouse_id" value={form.warehouse_id} onChange={onChange} className="input">
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Adjustment Type <span className="text-red-500">*</span></label>
                <select name="type" value={form.type} onChange={onChange} className="input">
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="label">Quantity <span className="text-red-500">*</span></label>
              <input name="quantity" type="number" min="0" step="0.01"
                value={form.quantity} onChange={onChange} placeholder="0"
                className="input text-lg font-semibold" />
            </div>

            {/* Reason */}
            <div>
              <label className="label">Reason</label>
              <select name="reason" value={form.reason} onChange={onChange} className="input">
                {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="label">Notes</label>
              <textarea name="notes" value={form.notes} onChange={onChange}
                rows={2} className="input resize-none"
                placeholder="বাড়তি তথ্য (optional)" />
            </div>

            <button type="submit" disabled={saving} className="btn-primary w-full py-2.5">
              {saving
                ? <><span className="spinner" /> Saving...</>
                : <><Save size={15} /> Adjustment Save করুন</>
              }
            </button>
          </form>
        </div>

        {/* Preview card */}
        <div className="space-y-4">
          <div className="card card-body">
            <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
              Adjustment Preview
            </h3>
            {!form.product ? (
              <p className="text-gray-400 text-sm text-center py-6">Product select করুন</p>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Current Stock</span>
                  <span className="font-bold text-gray-800">{currentStock ?? '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Adjustment</span>
                  <span className={`font-bold ${form.type === 'reduce' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {prev?.diff ?? '—'}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-gray-700 font-medium">New Stock</span>
                  <span className="text-xl font-bold text-brand-600">
                    {prev?.new ?? '—'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {form.type === 'reduce' && prev && prev.new === 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
              <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
              Stock শূন্য হয়ে যাবে!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StockAdjustPage