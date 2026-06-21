import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Printer, Undo } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import { ReceiptContent } from '../pos/components/ReceiptModal'

const fmtDateTime = (d) => d
  ? new Date(d).toLocaleString('en-BD', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—'

const STATUS_CLASS = {
  paid:    'badge-success',
  partial: 'badge-warning',
  unpaid:  'badge-danger',
}

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
    <p className="text-sm font-medium text-gray-800">
      {value ?? <span className="text-gray-300 font-normal">—</span>}
    </p>
  </div>
)

const SaleDetailPage = () => {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [sale,    setSale]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/sales/${id}`)
      .then(({ data }) => setSale(data?.data))
      .catch(() => { toast.error('Sale পাওয়া যায়নি'); navigate('/sales') })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" />
    </div>
  )
  if (!sale) return null

  const items    = sale.items ?? []
  const payments = sale.payments ?? []

  return (
    <div>
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/sales')}
            className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title font-mono">{sale.invoice_no}</h1>
            <p className="page-subtitle">{fmtDateTime(sale.created_at)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/sale-returns?invoice=${sale.invoice_no}`)} className="btn-secondary">
            <Undo size={14} /> Return
          </button>
          <button onClick={() => window.print()} className="btn-primary">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* ── Left ── */}
        <div className="xl:col-span-2 space-y-4">
          <div className="card card-body">
            <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
              Sale Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Customer"  value={sale.customer?.name ?? 'Walk-in'} />
              <Field label="Phone"     value={sale.customer?.phone} />
              <Field label="Sold By"   value={sale.user?.name} />
              <Field label="Warehouse" value={sale.warehouse?.name} />
            </div>
          </div>

          <div className="card">
            <div className="card-header">Items ({items.length})</div>
            <div className="table-wrapper rounded-none border-x-0 border-b-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Discount</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td>
                        <p className="font-medium text-gray-900 text-sm">{item.product?.name}</p>
                        {item.product?.barcode && (
                          <p className="font-mono text-xs text-gray-400">{item.product.barcode}</p>
                        )}
                      </td>
                      <td className="text-right text-sm">{Number(item.quantity).toLocaleString()}</td>
                      <td className="text-right text-sm">৳ {Number(item.selling_price).toLocaleString()}</td>
                      <td className="text-right text-sm text-red-500">
                        {Number(item.discount) > 0 ? `-৳ ${Number(item.discount).toLocaleString()}` : '—'}
                      </td>
                      <td className="text-right font-semibold text-gray-900">৳ {Number(item.total).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {payments.length > 0 && (
            <div className="card">
              <div className="card-header">Payments</div>
              <div className="table-wrapper rounded-none border-x-0 border-b-0">
                <table className="table">
                  <thead>
                    <tr><th>Method</th><th>Date</th><th className="text-right">Amount</th></tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id}>
                        <td className="text-sm text-gray-700">{p.payment_method?.name ?? '—'}</td>
                        <td className="text-sm text-gray-500">{fmtDateTime(p.paid_at)}</td>
                        <td className="text-right font-semibold">৳ {Number(p.amount).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Summary + hidden print receipt ── */}
        <div className="space-y-4">
          <div className="card card-body">
            <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>৳ {Number(sale.subtotal).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="text-red-500">-৳ {Number(sale.discount).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>৳ {Number(sale.tax).toLocaleString()}</span></div>
              <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>৳ {Number(sale.total_amount).toLocaleString()}</span></div>
              <div className="flex justify-between text-emerald-600"><span>Paid</span><span>৳ {Number(sale.paid_amount).toLocaleString()}</span></div>
              <div className="flex justify-between font-bold">
                <span>Due</span>
                <span className={Number(sale.due_amount) > 0 ? 'text-red-600' : 'text-emerald-600'}>
                  ৳ {Number(sale.due_amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600 pt-2 border-t">
                <span>Profit</span><span>৳ {Number(sale.profit).toLocaleString()}</span>
              </div>
            </div>
            <span className={`badge ${STATUS_CLASS[sale.payment_status] ?? 'badge-gray'} mt-3`}>
              {sale.payment_status}
            </span>
          </div>
        </div>
      </div>

      {/* Hidden — শুধু print করার সময় visible হবে */}
      <div id="pos-receipt" className="hidden">
        <ReceiptContent sale={sale} />
      </div>
    </div>
  )
}

export default SaleDetailPage