import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Clock, Undo, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import usePosStore from '../../store/posStore'
import SearchPanel from './components/SearchPanel'
import CartPanel from './components/CartPanel'
import CustomerModal from './components/CustomerModal'
import PaymentModal from './components/PaymentModal'
import HeldSalesModal from './components/HeldSalesModal'
import ReceiptModal from './components/ReceiptModal'

const PosPage = () => {
  const { items, heldSales, holdSale, discount } = usePosStore()

  const [showCustomer, setShowCustomer] = useState(false)
  const [showPayment,  setShowPayment]  = useState(false)
  const [showHeld,     setShowHeld]     = useState(false)
  const [showReceipt,  setShowReceipt]  = useState(false)
  const [lastSale,     setLastSale]     = useState(null)

  const anyModal = showCustomer || showPayment || showHeld || showReceipt

  const handleHold = () => {
    holdSale() ? toast.success('Sale hold করা হয়েছে ⏸') : toast.error('Cart empty!')
  }

  const handlePaySuccess = (saleData) => {
    setLastSale(saleData)
    setShowPayment(false)
    setShowReceipt(true)
  }

  const handleNewSale = () => {
    setShowReceipt(false)
    setLastSale(null)
  }

  // Grand total (cart total × overall discount)
  const subtotal   = items.reduce((s, i) => s + Number(i.quantity) * Number(i.unit_price) * (1 - Number(i.discount_pct) / 100), 0)
  const grandTotal = subtotal * (1 - Number(discount) / 100)

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">

      {/* ── POS Header ──────────────────────────────────────── */}
      <header className="h-11 bg-sidebar-bg flex items-center px-4 gap-3 flex-shrink-0">
        <Link to="/"
          className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-xs">
          <ArrowLeft size={14} /> Dashboard
        </Link>

        <div className="w-px h-4 bg-gray-700" />

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-brand-600 rounded flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">POS</span>
          </div>
          <span className="text-white font-bold text-sm tracking-wide">Point of Sale</span>
        </div>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-3">
          <button onClick={() => setShowHeld(true)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs transition-colors">
            <Clock size={13} />
            Held
            {heldSales.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {heldSales.length}
              </span>
            )}
          </button>

          <Link to="/sale-returns"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs transition-colors">
            <Undo size={13} /> Return
          </Link>
        </div>
      </header>

      {/* ── Main Layout ─────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left — Product Search (58%) */}
        <div className="w-[58%] border-r border-gray-200 bg-white flex flex-col overflow-hidden">
          <SearchPanel disabled={anyModal} />
        </div>

        {/* Right — Cart (42%) */}
        <div className="w-[42%] flex flex-col overflow-hidden">
          <CartPanel
            onPay={() => items.length && setShowPayment(true)}
            onHold={handleHold}
            onCustomer={() => setShowCustomer(true)}
          />
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────── */}
      <CustomerModal   open={showCustomer} onClose={() => setShowCustomer(false)} />
      <HeldSalesModal  open={showHeld}     onClose={() => setShowHeld(false)} />
      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        total={grandTotal}
        onSuccess={handlePaySuccess}
      />
      <ReceiptModal
        open={showReceipt}
        sale={lastSale}
        onClose={() => setShowReceipt(false)}
        onNewSale={handleNewSale}
      />
    </div>
  )
}

export default PosPage