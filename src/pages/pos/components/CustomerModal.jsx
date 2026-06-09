import { useState, useEffect, useRef } from 'react'
import { Search, User, X, CheckCircle } from 'lucide-react'
import api from '../../../lib/axios'
import usePosStore from '../../../store/posStore'

const CustomerModal = ({ open, onClose }) => {
  const { customer, setCustomer } = usePosStore()

  const [search,   setSearch]   = useState('')
  const [results,  setResults]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const inputRef = useRef(null)
  const timer    = useRef(null)

  useEffect(() => {
    if (open) {
      setSearch('')
      setResults([])
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [open])

  useEffect(() => {
    clearTimeout(timer.current)
    if (!search.trim()) { setResults([]); return }
    timer.current = setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/customers', { params: { search, per_page: 10 } })
        const d = data?.data
        setResults(Array.isArray(d) ? d : d?.data ?? [])
      } catch { setResults([]) }
      finally  { setLoading(false) }
    }, 300)
  }, [search])

  const select = (c) => { setCustomer(c); onClose() }
  const walkIn = ()  => { setCustomer(null); onClose() }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Customer Select করুন</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Customer name বা phone..."
              className="input pl-9"
            />
          </div>

          {/* Walk-in option */}
          <button onClick={walkIn}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
              ${!customer ? 'border-brand-300 bg-brand-50' : 'border-gray-200 hover:bg-gray-50'}`}>
            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-gray-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-gray-800">Walk-in Customer</p>
              <p className="text-xs text-gray-400">Account ছাড়া sale</p>
            </div>
            {!customer && <CheckCircle size={16} className="text-brand-600" />}
          </button>

          {/* Search results */}
          {loading && (
            <div className="text-center py-3">
              <div className="animate-spin w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full mx-auto" />
            </div>
          )}
          <div className="max-h-52 overflow-y-auto space-y-1">
            {results.map(c => (
              <button key={c.id} onClick={() => select(c)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all
                  ${customer?.id === c.id ? 'border-brand-300 bg-brand-50' : 'border-transparent hover:bg-gray-50'}`}>
                <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-700 font-bold text-sm">{c.name?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-gray-800 truncate">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.phone ?? c.email ?? '—'}</p>
                </div>
                {c.total_due > 0 && (
                  <span className="text-xs text-red-500 font-medium flex-shrink-0">
                    Due ৳{Number(c.total_due).toLocaleString()}
                  </span>
                )}
                {customer?.id === c.id && <CheckCircle size={14} className="text-brand-600" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerModal