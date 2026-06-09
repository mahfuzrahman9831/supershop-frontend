import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Minus, Plus, Save, Receipt } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'

const REASONS = ['Customer request', 'Wrong product', 'Damaged product', 'Quality issue', 'Other']

const SaleReturnPage = () => {
  const navigate = useNavigate()

  const [invoice,     setInvoice]     = useState('')
  const [sale,        setSale]        = useState(null)
  const [searching,   setSearching]   = useState(false)
  const [returnItems, setReturnItems] = useState([])
  const [reason,      setReason]      = useState(REASONS[0])
  const [saving,      setSaving]      = useState(false)

  const searchSale = async () => {
    if (!invoice.trim()) return
    setSearching(true)
    setSale(null)
    setReturnItems([])
    try {
      // First search by invoice number
      const { data } = await api.get('/sales', { params: { search: invoice, per_page: 1 } })
      const d = data?.data
      const results = Array.isArray(d) ? d : d?.data ?? []
      if (!results.length) { toast.error('Sale পাওয়া যায়নি'); return }

      // Get full details
      const { data: detail } = await api.get(`/sales/${results[0].id}`)
      const saleData = detail?.data
      setSale(saleData)

      const saleItems = saleData?.items ?? saleData?.sale_items ?? []
      setReturnItems(saleItems.map(i => ({
        ...i,
        return_qty: 0,
        max_qty: Number(i.quantity),
      })))
    } catch {
      toast.error('Sale খুঁজে পাওয়া যায়নি')
    } finally {
      setSearching(false)
    }
  }

  const updateQty = (id, qty) =>
    setReturnItems(p => p.map(i =>
      i.id === id ? { ...i, return_qty: Math.max(0, Math.min(qty, i.max_qty)) } : i
    ))

  const totalReturn = returnItems.reduce((s, i) =>
    s + i.return_qty * Number(i.unit_price ?? i.sale_price ?? 0), 0)

  const onSubmit = async () => {
    const items = returnItems.filter(i => i.return_qty > 0)
    if (!items.length) { toast.error('Return quantity দিন'); return }

    setSaving(true)
    try {
      await api.post('/sale-returns', {
        sale_id: sale.id,
        reason,
        items: items.map(i => ({
          sale_item_id: i.id,
          product_id:   i.product_id,
          quantity:     i.return_qty,
          unit_price:   Number(i.unit_price ?? i.sale_price ?? 0),
        })),
      })
      toast.success('Sale return সফল হয়েছে ✓')
      navigate('/sales')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Return হয়নি')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-header flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title">Sale Return</h1>
          <p className="page-subtitle">Invoice দিয়ে sale খুঁজুন এবং return করুন</p>
        </div>
      </div>

      {/* Search */}
      <div className="card card-body mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Receipt size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={invoice} onChange={e => setInvoice(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchSale()}
              placeholder="Invoice number দিন (যেমন: SALE-0001)"
              className="input pl-9" autoFocus />
          </div>
          <button onClick={searchSale} disabled={searching} className="btn-primary px-6">
            {searching ? <><span className="spinner" /> Searching...</> : <><Search size={14} /> Search</>}
          </button>
        </div>
      </div>

      {/* Sale details */}
      {sale && (
        <>
          {/* Sale info */}
          <div className="card card-body mb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-xl text-gray-900">{sale.invoice_number ?? `#${sale.id}`}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {sale.customer?.name ?? 'Walk-in'} ·{' '}
                  {new Date(sale.sale_date ?? sale.created_at).toLocaleDateString('en-BD')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  ৳ {Number(sale.total_amount ?? 0).toLocaleString()}
                </p>
                <span className={`badge ${sale.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                  {sale.status}
                </span>
              </div>
            </div>
          </div>

          {/* Return items */}
          <div className="card card-body mb-4">
            <h3 className="font-semibold text-gray-800 mb-4">
              Return করার Items নির্বাচন করুন
            </h3>
            <div className="space-y-2">
              {returnItems.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {item.product?.name ?? item.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Sold: {item.max_qty} pcs · ৳{Number(item.unit_price ?? 0).toLocaleString()} each
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => updateQty(item.id, item.return_qty - 1)}
                      className="w-7 h-7 bg-gray-200 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors">
                      <Minus size={11} />
                    </button>
                    <input type="number" min="0" max={item.max_qty}
                      value={item.return_qty}
                      onChange={e => updateQty(item.id, Number(e.target.value))}
                      className="w-12 text-center border border-gray-300 rounded-lg py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500" />
                    <button onClick={() => updateQty(item.id, item.return_qty + 1)}
                      className="w-7 h-7 bg-gray-200 hover:bg-brand-100 rounded-lg flex items-center justify-center transition-colors">
                      <Plus size={11} />
                    </button>
                  </div>

                  <div className="w-20 text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${item.return_qty > 0 ? 'text-red-600' : 'text-gray-300'}`}>
                      {item.return_qty > 0
                        ? `৳ ${(item.return_qty * Number(item.unit_price ?? 0)).toLocaleString()}`
                        : '—'
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 card card-body">
              <label className="label">Return Reason</label>
              <select value={reason} onChange={e => setReason(e.target.value)} className="input">
                {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="card card-body">
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-500">
                  <span>Return Items</span>
                  <span className="font-medium text-gray-700">
                    {returnItems.filter(i => i.return_qty > 0).length} pcs
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Refund Amount</span>
                  <span className="text-red-600">৳ {totalReturn.toLocaleString()}</span>
                </div>
              </div>
              <button onClick={onSubmit} disabled={saving || totalReturn === 0}
                className="btn-danger w-full py-2.5 disabled:opacity-40">
                {saving
                  ? <><span className="spinner" /> Processing...</>
                  : <><Save size={14} /> Return Confirm করুন</>
                }
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default SaleReturnPage