import { useState, useEffect } from 'react'
import { X, Printer, ShoppingBag } from 'lucide-react'
import api from '../../../lib/axios'

const fmt = (str) => str
  ? new Date(str).toLocaleString('en-BD', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  : new Date().toLocaleString('en-BD')

// ── Receipt Content (screen + print) ──────────────────────────
export const ReceiptContent = ({ sale, shopName = 'আস্থা সুপার শপ' }) => {
  if (!sale) return null
  const items    = sale.items ?? sale.sale_items ?? []
  const payments = sale.payments ?? []
  const total    = Number(sale.total_amount ?? sale.grand_total ?? 0)
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount ?? 0), 0)
  const change   = totalPaid - total

  // ── Subtotal সঠিক field থেকে (selling_price = backend field) ──
  const subtotal = items.reduce((s, i) => {
    const price = Number(i.selling_price ?? i.unit_price ?? i.sale_price ?? 0)
    const qty   = Number(i.quantity ?? 1)
    return s + qty * price
  }, 0)

  // sale.discount = টাকার পরিমাণ (percentage না!)
  const discountAmt = Number(sale.discount ?? 0)
  const discountPct = subtotal > 0 ? (discountAmt / subtotal) * 100 : 0

  return (
    <div style={{ fontFamily: "'Courier New', monospace", fontSize: '12px', lineHeight: '1.5', color: '#000' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{shopName}</div>
        <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>{fmt(sale.created_at ?? sale.sale_date)}</div>
      </div>

      <div style={{ borderTop: '1px dashed #999', margin: '6px 0' }} />

      {/* Invoice + Customer */}
      <div style={{ marginBottom: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Invoice:</span>
          <strong>{sale.invoice_no ?? sale.invoice_number ?? `#${sale.id}`}</strong>
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
          const price = Number(item.selling_price ?? item.unit_price ?? item.sale_price ?? 0)
          const qty   = Number(item.quantity ?? 1)
          const lineDiscount = Number(item.discount ?? 0)
          const line  = qty * price - lineDiscount
          return (
            <div key={i} style={{ marginBottom: '4px' }}>
              <div style={{ fontWeight: 'bold' }}>{item.product?.name ?? item.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                <span>{qty} × ৳{price.toLocaleString()}</span>
                <span>৳{line.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ borderTop: '1px dashed #999', margin: '6px 0' }} />

      {/* Totals */}
      <div style={{ marginBottom: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal</span>
          <span>৳{subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
        {discountAmt > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Discount ({discountPct.toFixed(1)}%)</span>
            <span>-৳{discountAmt.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
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
        <div>ধন্যবাদ আবার আসবেন!</div>
      </div>
    </div>
  )
}

// ── Modal ──────────────────────────────────────────────────────
const ReceiptModal = ({ open, sale, onClose, onNewSale }) => {
  const [shopName, setShopName] = useState('আস্থা সুপার শপ')

  useEffect(() => {
    if (!open) return
    api.get('/settings').then(({ data }) => {
      const raw = data?.data
      let name
      if (Array.isArray(raw)) {
        name = raw.find(s => s.key === 'shop_name')?.value
      } else {
        name = raw?.shop_name
      }
      if (name) setShopName(name)
    }).catch(() => {})
  }, [open])

  if (!open || !sale) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-modal="true">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden">

        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div>
            <h2 className="font-semibold text-gray-800">Sale Complete! 🎉</h2>
            <p className="text-xs text-gray-400">{sale.invoice_no ?? sale.invoice_number ?? `#${sale.id}`}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>

        <div id="pos-receipt" className="p-4 overflow-y-auto max-h-64">
          <ReceiptContent sale={sale} shopName={shopName} />
        </div>

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