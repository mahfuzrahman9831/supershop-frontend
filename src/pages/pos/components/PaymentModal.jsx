import { useState, useEffect } from 'react'
import { X, Plus, Trash2, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'
import usePosStore from '../../../store/posStore'

const PaymentModal = ({ open, onClose, total, onSuccess }) => {
  const { items, customer, discount, clearCart, setLastSale } = usePosStore()

  const [payMethods,  setPayMethods]  = useState([])
  const [warehouses,  setWarehouses]  = useState([])
  const [warehouseId, setWarehouseId] = useState('')
  const [payments,    setPayments]    = useState([{ _id: 1, method_id: '', amount: '' }])
  const [saving,      setSaving]      = useState(false)

  useEffect(() => {
    if (!open) return
    // Auto-fill amount
    setPayments([{ _id: Date.now(), method_id: '', amount: total.toFixed(2) }])

    const fetchData = async () => {
      const [pm, wh] = await Promise.allSettled([
        api.get('/payment-methods?per_page=100'),
        api.get('/warehouses?per_page=100'),
      ])
      if (pm.status === 'fulfilled') {
        const d = pm.value.data?.data
        setPayMethods(Array.isArray(d) ? d : d?.data ?? [])
      }
      if (wh.status === 'fulfilled') {
        const d = wh.value.data?.data
        const ws = Array.isArray(d) ? d : d?.data ?? []
        setWarehouses(ws)
        if (ws.length) setWarehouseId(String(ws[0].id))
      }
    }
    fetchData()
  }, [open, total])

  if (!open) return null

  const totalPaid = payments.reduce((s, p) => s + Number(p.amount || 0), 0)
  const change    = totalPaid - total
  const remaining = total - totalPaid

  const updatePayment = (id, field, value) =>
    setPayments(p => p.map(pm => pm._id === id ? { ...pm, [field]: value } : pm))
  const addPayment    = () =>
    setPayments(p => [...p, { _id: Date.now(), method_id: '', amount: '' }])
  const removePayment = (id) =>
    setPayments(p => p.filter(pm => pm._id !== id))

  const onSubmit = async () => {
    if (!warehouseId) { toast.error('Warehouse select করুন'); return }
    const valid = payments.filter(p => p.method_id && Number(p.amount) > 0)
    if (!valid.length) { toast.error('Payment method ও amount দিন'); return }
    if (remaining > 0.01) { toast.error(`আরো ৳${remaining.toFixed(2)} দিতে হবে`); return }

    setSaving(true)
    try {
      const { data } = await api.post('/sales', {
          customer_id:     customer?.id ?? null,
          warehouse_id:    Number(warehouseId),
          sale_date:       new Date().toISOString().slice(0, 10),
          discount_amount: subtotalRaw * (Number(discount) / 100),
          items: items.map(i => ({
            product_id:      i.product_id,
            quantity:        Number(i.quantity),
            unit_price:      Number(i.unit_price),
            cost_price:      Number(i.cost_price ?? 0),
            discount_amount: Number(i.unit_price) * Number(i.quantity) * (Number(i.discount_pct ?? 0) / 100),
            tax_amount:      0,
          })),
          payments: valid.map(p => ({
            payment_method_id: Number(p.method_id),
            amount:            Number(p.amount),
          })),
        })

      setLastSale(data?.data ?? null)
      clearCart()
      toast.success('Sale সম্পন্ন হয়েছে! ✓')
      onSuccess(data?.data)
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Sale হয়নি')
    } finally {
      setSaving(false)
    }
  }

  const subtotalRaw = items.reduce((s, i) => s + Number(i.quantity) * Number(i.unit_price), 0)
  const discAmt     = subtotalRaw * (Number(discount) / 100)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-modal="true">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <CreditCard size={18} className="text-brand-600" /> Payment
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal ({items.length} items)</span>
              <span>৳ {subtotalRaw.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            {Number(discount) > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Discount ({discount}%)</span>
                <span>- ৳ {discAmt.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            )}
            {customer && (
              <div className="flex justify-between text-gray-500">
                <span>Customer</span>
                <span className="font-medium text-gray-700">{customer.name}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
              <span>Total</span>
              <span className="text-brand-600">৳ {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Warehouse */}
          <div>
            <label className="label">Warehouse</label>
            <select value={warehouseId} onChange={e => setWarehouseId(e.target.value)} className="input">
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          {/* Payment methods */}
          <div>
            <label className="label">Payment</label>
            <div className="space-y-2">
              {payments.map((pm) => (
                <div key={pm._id} className="flex gap-2 items-center">
                  <select value={pm.method_id}
                    onChange={e => updatePayment(pm._id, 'method_id', e.target.value)}
                    className="input flex-1 py-2 text-sm">
                    <option value="">— Method —</option>
                    {payMethods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <div className="relative w-32">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">৳</span>
                    <input type="number" min="0" step="0.01"
                      value={pm.amount}
                      onChange={e => updatePayment(pm._id, 'amount', e.target.value)}
                      placeholder="0.00"
                      className="input pl-6 py-2 text-sm" />
                  </div>
                  {payments.length > 1 && (
                    <button onClick={() => removePayment(pm._id)}
                      className="p-2 text-red-400 hover:text-red-600">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addPayment} className="btn-ghost btn-sm mt-2">
              <Plus size={12} /> Split payment
            </button>
          </div>

          {/* Change / Remaining */}
          <div className={`rounded-xl p-4 border text-sm ${
            change >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
          }`}>
            <div className="flex justify-between mb-1 text-gray-600">
              <span>Total Paid</span>
              <span className="font-medium">৳ {totalPaid.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className={change >= 0 ? 'text-emerald-700' : 'text-red-700'}>
                {change >= 0 ? '💵 Change (ফেরত)' : '⚠ Remaining (বাকি)'}
              </span>
              <span className={`text-lg ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                ৳ {Math.abs(change).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="px-6 pb-6">
          <button onClick={onSubmit} disabled={saving || remaining > 0.01}
            className="btn-primary w-full py-3.5 text-base font-bold disabled:opacity-40">
            {saving
              ? <><span className="spinner" /> Processing...</>
              : '✓ Confirm Sale করুন'
            }
          </button>
          {remaining > 0.01 && (
            <p className="text-center text-xs text-red-500 mt-2">
              আরো ৳ {remaining.toFixed(2)} payment দরকার
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentModal