import { X, Printer, ShoppingBag } from 'lucide-react'

const fmt = (str) => str
  ? new Date(str).toLocaleString('en-BD', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  : new Date().toLocaleString('en-BD')

// ── Receipt Content (screen + print) ──────────────────────────
export const ReceiptContent = ({ sale }) => {
  if (!sale) return null
  const items    = sale.items ?? sale.sale_items ?? []
  const payments = sale.payments ?? []
  const total    = Number(sale.total_amount ?? sale.grand_total ?? 0)
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount ?? 0), 0)
  const change   = totalPaid - total

  return (
    <div style={{ fontFamily: "'Courier New', monospace", fontSize: '12px', lineHeight: '1.5', color: '#000' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>SuperShop</div>
        <div>ERP System</div>
        <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>{fmt(sale.created_at ?? sale.sale_date)}</div>
      </div>

      <div style={{ borderTop: '1px dashed #999', margin: '6px 0' }} />

      {/* Invoice + Customer */}
      <div style={{ marginBottom: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Invoice:</span>
          <strong>{sale.invoice_number ?? `#${sale.id}`}</strong>
        </div>
        {sale.customer && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Customer:</span>
            <span>{sale.customer.name}</span>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px dashed #999', margin: '6px 0' }} />

      {/* Items */}
      <div style={{ marginBottom: '6px' }}>
        {items.map((item, i) => {
          const price = Number(item.unit_price ?? item.sale_price ?? 0)
          const qty   = Number(item.quantity ?? 1)
          const disc  = Number(item.discount ?? 0)
          const line  = qty * price * (1 - disc / 100)
          return (
            <div key={i} style={{ marginBottom: '4px' }}>
              <div style={{ fontWeight: 'bold' }}>{item.product?.name ?? item.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                <span>{qty} × ৳{price.toLocaleString()}{disc > 0 ? ` (-${disc}%)` : ''}</span>
                <span>৳{line.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ borderTop: '1px dashed #999', margin: '6px 0' }} />

      {/* Totals */}
      <div style={{ marginBottom: '6px' }}>
        {Number(sale.discount ?? 0) > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Discount ({sale.discount}%)</span>
            <span>-৳{(items.reduce((s, i) => s + Number(i.quantity ?? 1) * Number(i.unit_price ?? 0), 0) * sale.discount / 100).toLocaleString()}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
          <span>TOTAL</span>
          <span>৳{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Payments */}
      {payments.length > 0 && (
        <>
          <div style={{ borderTop: '1px dashed #999', margin: '6px 0' }} />
          <div style={{ marginBottom: '6px' }}>
            {payments.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{p.payment_method?.name ?? p.method_name ?? 'Payment'}</span>
                <span>৳{Number(p.amount).toLocaleString()}</span>
              </div>
            ))}
            {change > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Change (ফেরত)</span>
                <span>৳{change.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>
        </>
      )}

      <div style={{ borderTop: '1px dashed #999', margin: '6px 0' }} />

      {/* Footer */}
      <div style={{ textAlign: 'center', color: '#555', fontSize: '11px' }}>
        <div>ধন্যবাদ আমাদের দোকানে আসার জন্য!</div>
        <div>আবার আসবেন 🙏</div>
      </div>
    </div>
  )
}

// ── Modal ──────────────────────────────────────────────────────
const ReceiptModal = ({ open, sale, onClose, onNewSale }) => {
  if (!open || !sale) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-modal="true">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden">

        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div>
            <h2 className="font-semibold text-gray-800">Sale Complete! 🎉</h2>
            <p className="text-xs text-gray-400">{sale.invoice_number ?? `#${sale.id}`}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>

        {/* Receipt preview */}
        <div id="pos-receipt" className="p-4 overflow-y-auto max-h-64">
          <ReceiptContent sale={sale} />
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button onClick={() => window.print()} className="btn-secondary w-full py-2.5">
            <Printer size={15} /> Print Receipt (80mm)
          </button>
          <button onClick={onNewSale} className="btn-primary w-full py-2.5">
            <ShoppingBag size={15} /> New Sale শুরু করুন
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReceiptModal