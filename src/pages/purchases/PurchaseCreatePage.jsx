import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Plus, Trash2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import api          from '../../lib/axios'
import useSelectData from '../../hooks/useSelectData'

const SELECT_EP = [
  { key: 'suppliers',       url: '/suppliers?per_page=500' },
  { key: 'warehouses',      url: '/warehouses?per_page=100' },
  { key: 'payment_methods', url: '/payment-methods?per_page=100' },
]

const today = () => new Date().toISOString().slice(0, 10)

const mkItem = (p) => ({
  _id: Math.random(),
  product_id:    p.id,
  product:       p,
  quantity:      1,
  cost_price:    Number(p.cost_price ?? 0),
  discount_pct:  0,
})

const PurchaseCreatePage = () => {
  const navigate = useNavigate()
  const { data: sd, loading: sdLoading } = useSelectData(SELECT_EP)

  const [form, setForm] = useState({
    supplier_id: '', warehouse_id: '',
    purchase_date: today(), reference: '', notes: '',
  })

  const [items,    setItems]    = useState([])
  const [payments, setPayments] = useState([{ _id: 1, payment_method_id: '', amount: '' }])

  const [search,   setSearch]   = useState('')
  const [results,  setResults]  = useState([])
  const [searching,setSearching]= useState(false)
  const [saving,   setSaving]   = useState(false)
  const [errors,   setErrors]   = useState({})
  const searchTimer = useRef(null)

  // Auto-select first warehouse
  useEffect(() => {
    if (sd.warehouses?.length && !form.warehouse_id) {
      setForm(p => ({ ...p, warehouse_id: String(sd.warehouses[0].id) }))
    }
  }, [sd.warehouses])

  // Product search
  useEffect(() => {
    clearTimeout(searchTimer.current)
    if (!search.trim()) { setResults([]); return }
    searchTimer.current = setTimeout(async () => {
      setSearching(true)
      try {
        const { data } = await api.get('/products', { params: { search, per_page: 8, is_active: 1 } })
        const d = data?.data
        setResults(Array.isArray(d) ? d : d?.data ?? [])
      } finally { setSearching(false) }
    }, 350)
  }, [search])

  const addItem = (product) => {
    setSearch('')
    setResults([])
    // ইতিমধ্যে আছে কিনা check
    const exists = items.find(i => i.product_id === product.id)
    if (exists) {
      setItems(p => p.map(i => i.product_id === product.id
        ? { ...i, quantity: i.quantity + 1 }
        : i
      ))
    } else {
      setItems(p => [...p, mkItem(product)])
    }
  }

  const updateItem = (id, field, value) =>
    setItems(p => p.map(i => i._id === id ? { ...i, [field]: value } : i))

  const removeItem = (id) => setItems(p => p.filter(i => i._id !== id))

  // ── Totals ─────────────────────────────────────────────────
  const subtotal = items.reduce((s, i) => {
    return s + Number(i.quantity) * Number(i.cost_price)
  }, 0)

  const totalDiscount = items.reduce((s, i) => {
    const lineTotal = Number(i.quantity) * Number(i.cost_price)
    return s + lineTotal * (Number(i.discount_pct) / 100)
  }, 0)

  const grandTotal   = subtotal - totalDiscount
  const totalPaid    = payments.reduce((s, p) => s + Number(p.amount || 0), 0)
  const due          = grandTotal - totalPaid

  // Auto-fill payment amount when grandTotal changes
  const prevGrandRef = useRef(0)
  useEffect(() => {
    if (grandTotal !== prevGrandRef.current && payments.length === 1 && !payments[0].amount) {
      setPayments(p => p.map((pm, idx) => idx === 0 ? { ...pm, amount: grandTotal.toFixed(2) } : pm))
    }
    prevGrandRef.current = grandTotal
  }, [grandTotal])

  const updatePayment = (id, field, value) =>
    setPayments(p => p.map(pm => pm._id === id ? { ...pm, [field]: value } : pm))

  const addPayment = () =>
    setPayments(p => [...p, { _id: Math.random(), payment_method_id: '', amount: '' }])

  const removePayment = (id) => setPayments(p => p.filter(pm => pm._id !== id))

  // ── Submit ─────────────────────────────────────────────────
  const onSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.supplier_id)  errs.supplier_id  = 'Supplier select করুন'
    if (!form.warehouse_id) errs.warehouse_id = 'Warehouse select করুন'
    if (!items.length)      errs.items        = 'কমপক্ষে একটি product দিন'
    if (Object.keys(errs).length) { setErrors(errs); toast.error('সব required field পূরণ করুন'); return }

    setSaving(true)
    try {
      await api.post('/purchases', {
        supplier_id:   Number(form.supplier_id),
        warehouse_id:  Number(form.warehouse_id),
        purchase_date: form.purchase_date,
        reference:     form.reference || undefined,
        notes:         form.notes     || undefined,
        items: items.map(i => ({
          product_id:    i.product_id,
          quantity:      Number(i.quantity),
          cost_price:    Number(i.cost_price),
          discount:      Number(i.discount_pct) || 0,
        })),
        payments: payments
          .filter(p => p.payment_method_id && Number(p.amount) > 0)
          .map(p => ({
            payment_method_id: Number(p.payment_method_id),
            amount:            Number(p.amount),
          })),
      })
      toast.success('Purchase সফলভাবে তৈরি হয়েছে ✓')
      navigate('/purchases')
    } catch (err) {
      const { errors: errs2, message } = err.response?.data ?? {}
      if (errs2) setErrors(errs2)
      else toast.error(message ?? 'Error হয়েছে')
    } finally {
      setSaving(false)
    }
  }

  if (sdLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div>
      <div className="page-header flex items-center gap-3">
        <button onClick={() => navigate('/purchases')}
          className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title">New Purchase</h1>
          <p className="page-subtitle">নতুন purchase তৈরি করুন</p>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* ── Main Column (2/3) ─────────────────────────── */}
          <div className="xl:col-span-2 space-y-4">

            {/* Header Info */}
            <div className="card card-body">
              <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                Purchase Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Supplier <span className="text-red-500">*</span></label>
                  <select name="supplier_id" value={form.supplier_id}
                    onChange={e => { setForm(p => ({ ...p, supplier_id: e.target.value })); setErrors(p => ({ ...p, supplier_id: '' })) }}
                    className={`input ${errors.supplier_id ? 'input-error' : ''}`}>
                    <option value="">— Supplier select করুন —</option>
                    {(sd.suppliers ?? []).map(s => (
                      <option key={s.id} value={s.id}>{s.name}{s.company ? ` (${s.company})` : ''}</option>
                    ))}
                  </select>
                  {errors.supplier_id && <p className="form-error">{errors.supplier_id}</p>}
                </div>
                <div>
                  <label className="label">Warehouse <span className="text-red-500">*</span></label>
                  <select name="warehouse_id" value={form.warehouse_id}
                    onChange={e => setForm(p => ({ ...p, warehouse_id: e.target.value }))}
                    className="input">
                    {(sd.warehouses ?? []).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Purchase Date <span className="text-red-500">*</span></label>
                  <input type="date" value={form.purchase_date}
                    onChange={e => setForm(p => ({ ...p, purchase_date: e.target.value }))}
                    className="input" />
                </div>
                <div>
                  <label className="label">Reference / Invoice #</label>
                  <input value={form.reference}
                    onChange={e => setForm(p => ({ ...p, reference: e.target.value }))}
                    placeholder="Supplier এর invoice number (optional)"
                    className="input" />
                </div>
              </div>
              <div className="mt-4">
                <label className="label">Notes</label>
                <textarea value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={2} className="input resize-none" placeholder="(optional)" />
              </div>
            </div>

            {/* Items */}
            <div className="card card-body">
              <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                Purchase Items
                {errors.items && <span className="text-red-500 text-xs font-normal ml-2">{errors.items}</span>}
              </h3>

              {/* Product search */}
              <div className="relative mb-4">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Product name বা barcode দিয়ে search করুন..."
                  className="input pl-9" />
                {(results.length > 0 || searching) && (
                  <div className="absolute z-40 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
                    {searching ? (
                      <div className="py-4 text-center"><div className="spinner border-brand-600 mx-auto" /></div>
                    ) : results.map(p => (
                      <button key={p.id} type="button" onClick={() => addItem(p)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-left transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">{p.name}</p>
                          <p className="text-xs text-gray-400">
                            {p.barcode ? <span className="font-mono">{p.barcode}</span> : ''}
                            {p.barcode && p.cost_price ? ' · ' : ''}
                            {p.cost_price ? `Cost: ৳${p.cost_price}` : ''}
                          </p>
                        </div>
                        <Plus size={14} className="text-brand-600 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Items table */}
              {items.length > 0 ? (
                <div className="table-wrapper">
                  <table className="table text-xs">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th className="w-20 text-right">Qty</th>
                        <th className="w-28 text-right">Cost Price</th>
                        <th className="w-20 text-right">Disc %</th>
                        <th className="w-28 text-right">Total</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => {
                        const lineTotal = Number(item.quantity) * Number(item.cost_price)
                        const discAmt   = lineTotal * (Number(item.discount_pct) / 100)
                        const net       = lineTotal - discAmt

                        return (
                          <tr key={item._id}>
                            <td className="text-gray-400">{idx + 1}</td>
                            <td>
                              <p className="font-medium text-gray-800">{item.product.name}</p>
                              {item.product.barcode && (
                                <p className="font-mono text-gray-400">{item.product.barcode}</p>
                              )}
                            </td>
                            <td className="text-right">
                              <input type="number" min="0.01" step="0.01"
                                value={item.quantity}
                                onChange={e => updateItem(item._id, 'quantity', e.target.value)}
                                className="w-16 text-right border border-gray-300 rounded px-1.5 py-1 text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none" />
                            </td>
                            <td className="text-right">
                              <div className="flex items-center justify-end gap-0.5">
                                <span className="text-gray-400 text-[10px]">৳</span>
                                <input type="number" min="0" step="0.01"
                                  value={item.cost_price}
                                  onChange={e => updateItem(item._id, 'cost_price', e.target.value)}
                                  className="w-20 text-right border border-gray-300 rounded px-1.5 py-1 text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none" />
                              </div>
                            </td>
                            <td className="text-right">
                              <div className="flex items-center justify-end gap-0.5">
                                <input type="number" min="0" max="100" step="0.1"
                                  value={item.discount_pct}
                                  onChange={e => updateItem(item._id, 'discount_pct', e.target.value)}
                                  className="w-12 text-right border border-gray-300 rounded px-1.5 py-1 text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none" />
                                <span className="text-gray-400 text-[10px]">%</span>
                              </div>
                            </td>
                            <td className="text-right font-semibold text-gray-800">
                              ৳ {net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td>
                              <button type="button" onClick={() => removeItem(item._id)}
                                className="p-1 text-red-400 hover:text-red-600 transition-colors">
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  <Search size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">উপরের search box এ product search করে যোগ করুন</p>
                </div>
              )}
            </div>

            {/* Payment Section */}
            <div className="card card-body">
              <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                Payment
              </h3>

              <div className="space-y-3">
                {payments.map((pm, idx) => (
                  <div key={pm._id} className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm w-4">{idx + 1}</span>
                    <select value={pm.payment_method_id}
                      onChange={e => updatePayment(pm._id, 'payment_method_id', e.target.value)}
                      className="input flex-1 py-2 text-sm">
                      <option value="">— Method select করুন —</option>
                      {(sd.payment_methods ?? []).map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <div className="relative max-w-36">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">৳</span>
                      <input type="number" min="0" step="0.01"
                        value={pm.amount}
                        onChange={e => updatePayment(pm._id, 'amount', e.target.value)}
                        placeholder="0.00" className="input pl-6 py-2 text-sm" />
                    </div>
                    {payments.length > 1 && (
                      <button type="button" onClick={() => removePayment(pm._id)}
                        className="p-1.5 text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button type="button" onClick={addPayment}
                className="btn-ghost btn-sm mt-3">
                <Plus size={13} /> আরো payment method যোগ করুন
              </button>
            </div>
          </div>

          {/* ── Right Column: Summary ─────────────────────── */}
          <div className="space-y-4">
            <div className="card card-body sticky top-4">
              <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                Summary
              </h3>

              <div className="space-y-2 text-sm">
                {[
                  { label: 'Subtotal',  value: `৳ ${subtotal.toLocaleString(undefined, {minimumFractionDigits:2})}`, color: '' },
                  { label: 'Discount',  value: `৳ ${totalDiscount.toLocaleString(undefined, {minimumFractionDigits:2})}`, color: 'text-red-500' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className={`font-medium ${color}`}>{value}</span>
                  </div>
                ))}

                <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold">
                  <span>Grand Total</span>
                  <span className="text-brand-600">৳ {grandTotal.toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                </div>

                <div className="border-t border-gray-200 pt-2 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Paid</span>
                    <span className="text-emerald-600 font-semibold">
                      ৳ {totalPaid.toLocaleString(undefined, {minimumFractionDigits:2})}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Due</span>
                    <span className={`font-bold ${due > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      ৳ {Math.abs(due).toLocaleString(undefined, {minimumFractionDigits:2})}
                      {due < 0 && <span className="text-xs font-normal ml-1">(excess)</span>}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items count */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Total Items: <strong>{items.length}</strong> products ·{' '}
                  <strong>{items.reduce((s, i) => s + Number(i.quantity), 0)}</strong> qty
                </p>
              </div>

              <button type="submit" disabled={saving || !items.length}
                className="btn-primary w-full py-3 mt-4 text-base">
                {saving
                  ? <><span className="spinner" /> Saving...</>
                  : <><Save size={16} /> Purchase Save করুন</>
                }
              </button>

              <button type="button" onClick={() => navigate('/purchases')}
                className="btn-ghost w-full mt-2">
                বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default PurchaseCreatePage