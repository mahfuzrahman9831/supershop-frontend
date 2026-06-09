import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, CreditCard, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import Pagination    from '../../components/ui/Pagination'
import Modal         from '../../components/ui/Modal'

const STATUS_CLASS = {
  paid:     'badge-success',
  partial:  'badge-warning',
  unpaid:   'badge-danger',
  draft:    'badge-gray',
  received: 'badge-info',
}

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-BD', { day:'2-digit', month:'short', year:'numeric' }) : '—'

const PurchaseListPage = () => {
  const navigate  = useNavigate()
  const [items,   setItems]   = useState([])
  const [meta,    setMeta]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [page,    setPage]    = useState(1)

  // Payment modal
  const [payModal,  setPayModal]  = useState(false)
  const [payTarget, setPayTarget] = useState(null)
  const [payMethods, setPayMethods] = useState([])
  const [payForm,   setPayForm]   = useState({ payment_method_id: '', amount: '' })
  const [paying,    setPaying]    = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/purchases', {
        params: { page, per_page: 15, search: search || undefined },
      })
      const d = data?.data
      setItems(Array.isArray(d) ? d : d?.data ?? [])
      setMeta(d?.meta ?? (d?.last_page ? d : null))
    } catch { toast.error('Purchases লোড হয়নি') }
    finally  { setLoading(false) }
  }, [page, search])

  useEffect(() => { load() }, [load])
  useEffect(() => { const t = setTimeout(() => setPage(1), 400); return () => clearTimeout(t) }, [search])

  const openPayModal = async (purchase) => {
    setPayTarget(purchase)
    setPayForm({ payment_method_id: '', amount: String(purchase.due_amount ?? purchase.total_amount ?? '') })
    if (!payMethods.length) {
      const { data } = await api.get('/payment-methods?per_page=100')
      const d = data?.data
      setPayMethods(Array.isArray(d) ? d : d?.data ?? [])
    }
    setPayModal(true)
  }

  const doPayment = async () => {
    if (!payForm.payment_method_id) { toast.error('Payment method select করুন'); return }
    if (!payForm.amount)            { toast.error('Amount দিন'); return }
    setPaying(true)
    try {
      await api.post(`/purchases/${payTarget.id}/payment`, {
        payment_method_id: payForm.payment_method_id,
        amount: Number(payForm.amount),
      })
      toast.success('Payment সফল হয়েছে ✓')
      setPayModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Payment হয়নি')
    } finally { setPaying(false) }
  }

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Purchase List</h1>
          <p className="page-subtitle">সব purchase এর record</p>
        </div>
        <button onClick={() => navigate('/purchases/new')} className="btn-primary">
          <Plus size={16} /> New Purchase
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Invoice বা supplier search..." className="input pl-9" />
          </div>
        </div>

        <div className="table-wrapper rounded-none border-x-0 border-b-0">
          <table className="table">
            <thead>
              <tr>
                <th className="w-10">#</th>
                <th>Invoice</th>
                <th>Supplier</th>
                <th>Date</th>
                <th className="text-right">Total</th>
                <th className="text-right">Paid</th>
                <th className="text-right">Due</th>
                <th className="w-24">Status</th>
                <th className="w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="py-14 text-center">
                  <div className="spinner border-brand-600 mx-auto" />
                </td></tr>
              ) : !items.length ? (
                <tr><td colSpan={9} className="py-14 text-center text-gray-400">
                  <p className="text-sm">কোন purchase নেই — New Purchase click করুন</p>
                </td></tr>
              ) : items.map((p, i) => {
                const due = Number(p.due_amount ?? 0)
                return (
                  <tr key={p.id}>
                    <td className="text-gray-400 text-xs">{(page-1)*15+i+1}</td>
                    <td>
                      <span className="font-mono text-sm font-semibold text-brand-600">
                        {p.invoice_number ?? `#${p.id}`}
                      </span>
                    </td>
                    <td>
                      <p className="text-sm font-medium text-gray-800">{p.supplier?.name ?? 'N/A'}</p>
                      {p.supplier?.company && <p className="text-xs text-gray-400">{p.supplier.company}</p>}
                    </td>
                    <td className="text-sm text-gray-600">{fmtDate(p.purchase_date ?? p.created_at)}</td>
                    <td className="text-right font-semibold text-gray-900">
                      ৳ {Number(p.total_amount ?? 0).toLocaleString()}
                    </td>
                    <td className="text-right text-sm text-emerald-600 font-medium">
                      ৳ {Number(p.paid_amount ?? 0).toLocaleString()}
                    </td>
                    <td className="text-right">
                      {due > 0
                        ? <span className="text-red-600 font-bold text-sm">৳ {due.toLocaleString()}</span>
                        : <span className="text-emerald-600 text-sm">Clear</span>
                      }
                    </td>
                    <td>
                      <span className={`badge ${STATUS_CLASS[p.status] ?? 'badge-gray'}`}>
                        {p.status ?? 'N/A'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => navigate(`/purchases/${p.id}`)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                          title="View details">
                          <Eye size={14} />
                        </button>
                        {due > 0 && (
                          <button onClick={() => openPayModal(p)}
                            className="p-1.5 rounded-lg hover:bg-green-50 text-emerald-600 transition-colors"
                            title="Add payment">
                            <CreditCard size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Pagination meta={meta} onPageChange={setPage} />
      </div>

      {/* Quick Payment Modal */}
      <Modal open={payModal} onClose={() => setPayModal(false)}
        title={`Payment — ${payTarget?.invoice_number ?? ''}`} size="sm">
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total</span>
              <span className="font-bold">৳ {Number(payTarget?.total_amount ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-gray-500">Already Paid</span>
              <span className="text-emerald-600 font-medium">৳ {Number(payTarget?.paid_amount ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between mt-1 pt-1 border-t border-gray-200">
              <span className="font-medium">Due</span>
              <span className="text-red-600 font-bold">৳ {Number(payTarget?.due_amount ?? 0).toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="label">Payment Method <span className="text-red-500">*</span></label>
            <select value={payForm.payment_method_id}
              onChange={e => setPayForm(p => ({ ...p, payment_method_id: e.target.value }))}
              className="input">
              <option value="">— Select —</option>
              {payMethods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Amount <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">৳</span>
              <input type="number" min="0" step="0.01"
                value={payForm.amount}
                onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))}
                className="input pl-7" />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => setPayModal(false)} className="btn-secondary">বাতিল</button>
            <button onClick={doPayment} disabled={paying} className="btn-success">
              {paying ? <><span className="spinner" /> Processing...</> : '✓ Payment করুন'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PurchaseListPage