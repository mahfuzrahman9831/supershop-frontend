import { Clock, Play, Trash2, X } from 'lucide-react'
import usePosStore from '../../../store/posStore'

const fmt = (str) => str ? new Date(str).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' }) : ''

const HeldSalesModal = ({ open, onClose }) => {
  const { heldSales, resumeSale, deleteHeld } = usePosStore()

  const resume = (id) => { resumeSale(id); onClose() }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Clock size={16} className="text-amber-500" />
            Held Sales ({heldSales.length})
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>

        <div className="max-h-80 overflow-y-auto p-4 space-y-2">
          {!heldSales.length ? (
            <div className="text-center py-10 text-gray-400">
              <Clock size={36} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">কোন held sale নেই</p>
            </div>
          ) : heldSales.map(sale => {
            const total = sale.items.reduce((s, i) => s + Number(i.quantity) * Number(i.unit_price), 0)
            return (
              <div key={sale.id} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {sale.customer?.name ?? 'Walk-in'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {sale.items.length} items · ৳{total.toLocaleString()} · {fmt(sale.created_at)}
                  </p>
                </div>
                <button onClick={() => resume(sale.id)}
                  className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                  title="Resume">
                  <Play size={13} />
                </button>
                <button onClick={() => deleteHeld(sale.id)}
                  className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete">
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default HeldSalesModal