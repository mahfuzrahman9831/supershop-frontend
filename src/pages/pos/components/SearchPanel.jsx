import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Package, Barcode } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'
import usePosStore from '../../../store/posStore'

const SearchPanel = ({ disabled }) => {
  const addItem = usePosStore(s => s.addItem)

  const [query,     setQuery]     = useState('')
  const [results,   setResults]   = useState([])
  const [loading,   setLoading]   = useState(false)
  const inputRef = useRef(null)
  const timer    = useRef(null)

  // ── Auto-focus (modal না থাকলে সবসময় focused) ────────────
  useEffect(() => {
    if (!disabled) inputRef.current?.focus()
  }, [disabled])

  // ── Window click → refocus (modal content বাদে) ───────────
  const refocus = useCallback((e) => {
    if (!disabled && !e.target.closest('[data-modal]')) {
      inputRef.current?.focus()
    }
  }, [disabled])

  useEffect(() => {
    window.addEventListener('click', refocus)
    return () => window.removeEventListener('click', refocus)
  }, [refocus])

  // ── Product search ────────────────────────────────────────
  useEffect(() => {
    clearTimeout(timer.current)
    if (!query.trim()) { setResults([]); return }
    timer.current = setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/products', {
          params: { search: query, per_page: 15, is_active: 1 },
        })
        const d = data?.data
        setResults(Array.isArray(d) ? d : d?.data ?? [])
      } catch { setResults([]) }
      finally  { setLoading(false) }
    }, 280)
    return () => clearTimeout(timer.current)
  }, [query])

  const addToCart = (product) => {
  const stock = product.stock_quantity ?? product.stock ?? product.total_stock ?? 0
  if (stock <= 0) {
    toast.error(`${product.name}: Stock নেই!`, { duration: 1500 })
    return
  }
    addItem(product)
    setQuery('')
    setResults([])
    toast.success(`${product.name} যোগ হয়েছে ✓`, {
      duration: 1000,
      style: { fontSize: '12px', padding: '8px 12px' },
    })
    inputRef.current?.focus()
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && results.length) addToCart(results[0])
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="p-3 border-b border-gray-200 bg-white">
        <div className="relative">
          <Barcode size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Barcode scan করুন বা product name type করুন..."
            className="input pl-9 text-sm bg-blue-50 focus:bg-white border-blue-200 focus:border-brand-400"
            disabled={disabled}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full" />
            </div>
          )}
        </div>
        <p className="text-[10px] text-gray-400 mt-1 ml-1">
          ⌨ Enter চাপলে প্রথম product cart এ যোগ হবে
        </p>
      </div>

      {/* Product list */}
      <div className="flex-1 overflow-y-auto">
        {!results.length && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-200 select-none pointer-events-none">
            <Search size={72} className="mb-4" />
            <p className="text-sm font-medium">Product search করুন</p>
            <p className="text-xs mt-1">Name, barcode বা SKU দিয়ে</p>
          </div>
        ) : (
          <div>
            {results.map((p) => {
            const stock = p.stock_quantity ?? p.stock ?? p.total_stock ?? 0
            const isOut = stock <= 0
            const isLow = stock <= (p.low_stock_alert ?? p.min_stock ?? 5) && !isOut
              return (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  disabled={isOut}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 text-left transition-colors
                    ${isOut ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'hover:bg-brand-50 active:bg-brand-100'}`}
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package size={18} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {p.barcode && (
                        <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1 rounded">
                          {p.barcode}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400">{p.category?.name ?? ''}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 text-sm">
                      ৳ {Number(p.default_selling_price ?? 0).toLocaleString()}
                    </p>
                    <p className={`text-[10px] font-medium ${
                      isOut ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-emerald-600'
                    }`}>
                      {isOut ? 'Out of stock' : `Stock: ${stock}`}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPanel