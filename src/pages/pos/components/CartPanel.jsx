import { UserPlus, Clock, CreditCard, Trash2 } from 'lucide-react'
import usePosStore from '../../../store/posStore'
import CartItem from './CartItem'

const CartPanel = ({ onPay, onHold, onCustomer }) => {
  const { items, customer, discount, setDiscount, clearCart, heldSales } = usePosStore()

  const subtotal    = items.reduce((s, i) => s + Number(i.quantity) * Number(i.unit_price) * (1 - Number(i.discount_pct) / 100), 0)
  const discountAmt = subtotal * (Number(discount) / 100)
  const total       = subtotal - discountAmt

  return (
    <div className="flex flex-col h-full">

      {/* Customer */}
      <div className="p-3 border-b border-gray-200 bg-white flex-shrink-0">
        <button
          onClick={onCustomer}
          data-modal="true"
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all text-left
            ${customer ? 'border-brand-300 bg-brand-50' : 'border-gray-200 hover:border-brand-300 hover:bg-blue-50'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            customer ? 'bg-brand-600' : 'bg-gray-200'
          }`}>
            {customer
              ? <span className="text-white text-xs font-bold">{customer.name?.[0]?.toUpperCase()}</span>
              : <UserPlus size={14} className="text-gray-500" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${customer ? 'text-brand-700' : 'text-gray-400'}`}>
              {customer ? customer.name : 'Walk-in Customer'}
            </p>
            {customer?.phone && (
              <p className="text-xs text-gray-400">{customer.phone}</p>
            )}
          </div>
          {customer?.total_due > 0 && (
            <span className="text-xs text-red-500 font-medium flex-shrink-0">
              Due: ৳{Number(customer.total_due).toLocaleString()}
            </span>
          )}
        </button>
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {!items.length ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-300 select-none pointer-events-none">
            <p className="text-5xl mb-3">🛒</p>
            <p className="text-sm">Cart empty</p>
            <p className="text-xs mt-1">Left side থেকে product যোগ করুন</p>
          </div>
        ) : (
          items.map(item => <CartItem key={item._id} item={item} />)
        )}
      </div>

      {/* Totals */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 space-y-2 flex-shrink-0">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Subtotal ({items.length} items)</span>
          <span className="font-medium text-gray-700">
            ৳ {subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Discount */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <span>Discount</span>
            <div className="flex items-center gap-0.5">
              <input
                type="number" min="0" max="100" step="0.5"
                value={discount}
                onChange={e => setDiscount(Number(e.target.value))}
                data-modal="true"
                className="w-12 text-center text-xs border border-gray-300 rounded-lg py-0.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <span className="text-gray-400 text-xs">%</span>
            </div>
          </div>
          <span className={`font-medium ${discountAmt > 0 ? 'text-red-500' : 'text-gray-400'}`}>
            {discountAmt > 0 ? `- ৳ ${discountAmt.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '৳ 0'}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
          <span className="font-bold text-gray-800">Total</span>
          <span className="text-2xl font-bold text-brand-600">
            ৳ {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 bg-white border-t border-gray-200 space-y-2 flex-shrink-0">
        <div className="flex gap-2">
          <button
            onClick={clearCart}
            disabled={!items.length}
            data-modal="true"
            className="btn-ghost btn-sm flex-shrink-0 border border-gray-200 disabled:opacity-30 px-3"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={onHold}
            disabled={!items.length}
            data-modal="true"
            className="btn-secondary flex-1 disabled:opacity-30 text-sm"
          >
            <Clock size={14} />
            Hold
            {heldSales.length > 0 && (
              <span className="ml-1 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {heldSales.length}
              </span>
            )}
          </button>
        </div>
        <button
          onClick={() => onPay(total)}
          disabled={!items.length}
          data-modal="true"
          className="btn-primary w-full py-3 text-base font-bold disabled:opacity-30"
        >
          <CreditCard size={18} />
          Pay ৳ {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </button>
      </div>
    </div>
  )
}

export default CartPanel