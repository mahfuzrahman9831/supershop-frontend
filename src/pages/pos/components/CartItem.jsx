import { Trash2, Minus, Plus } from 'lucide-react'
import usePosStore from '../../../store/posStore'

const CartItem = ({ item }) => {
  const { updateItem, removeItem } = usePosStore()

  const qty   = Number(item.quantity)
  const price = Number(item.unit_price)
  const disc  = Number(item.discount_pct)
  const line  = qty * price * (1 - disc / 100)

  return (
    <div className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
      {/* Name + price */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
          {item.product.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400">
            ৳{price.toLocaleString()}
          </span>
          {disc > 0 && (
            <span className="text-[10px] text-red-500 bg-red-50 px-1 rounded">-{disc}%</span>
          )}
        </div>
      </div>

      {/* Qty control */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => qty > 1 ? updateItem(item._id, 'quantity', qty - 1) : removeItem(item._id)}
          data-modal="true"
          className="w-6 h-6 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 hover:text-red-600 transition-colors"
        >
          <Minus size={10} />
        </button>
        <input
          type="number" min="0.01" step="any"
          value={item.quantity}
          onChange={e => updateItem(item._id, 'quantity', Number(e.target.value) || 1)}
          data-modal="true"
          className="w-11 text-center text-sm font-medium border border-gray-200 rounded-lg py-0.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <button
          onClick={() => updateItem(item._id, 'quantity', qty + 1)}
          data-modal="true"
          className="w-6 h-6 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-brand-100 hover:text-brand-600 transition-colors"
        >
          <Plus size={10} />
        </button>
      </div>

      {/* Line total */}
      <div className="text-right w-16 flex-shrink-0">
        <p className="text-sm font-bold text-gray-900">
          ৳{line.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      </div>

      {/* Remove */}
      <button
        onClick={() => removeItem(item._id)}
        data-modal="true"
        className="text-gray-300 hover:text-red-500 transition-colors p-0.5 flex-shrink-0"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}

export default CartItem