import { useState, useEffect, useRef } from 'react'
import { Search, User, X, CheckCircle, UserPlus, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'
import usePosStore from '../../../store/posStore'

const CustomerModal = ({ open, onClose }) => {
  const { customer, setCustomer } = usePosStore()

  const [mode,      setMode]      = useState('search') // 'search' | 'create'
  const [search,    setSearch]    = useState('')
  const [results,   setResults]   = useState([])
  const [loading,   setLoading]   = useState(false)

  // New customer form
  const [form,    setForm]    = useState({ name: '', phone: '', email: '', address: '' })
  const [errors,  setErrors]  = useState({})
  const [saving,  setSaving]  = useState(false)

  const inputRef = useRef(null)
  const timer    = useRef(null)

  useEffect(() => {
    if (open) {
      setMode('search')
      setSearch('')
      setResults([])
      setForm({ name: '', phone: '', email: '', address: '' })
      setErrors({})
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

  const onFormChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  const createCustomer = async () => {
    if (!form.name.trim()) { setErrors({ name: 'Name দিন' }); return }
    setSaving(true)
    try {
      const { data } = await api.post('/customers', {
        name:    form.name,
        phone:   form.phone   || undefined,
        email:   form.email   || undefined,
        address: form.address || undefined,
      })
      const newCustomer = data?.data
      toast.success('Customer তৈরি হয়েছে ✓')
      setCustomer(newCustomer)
      onClose()
    } catch (err) {
      const { errors: errs, message } = err.response?.data ?? {}
      if (errs) setErrors(errs)
      else toast.error(message ?? 'Customer তৈরি হয়নি')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            {mode === 'create' && (
              <button onClick={() => setMode('search')} className="p-1 -ml-1 rounded hover:bg-gray-100">
                <ArrowLeft size={16} />
              </button>
            )}
            {mode === 'search' ? 'Customer Select করুন' : 'নতুন Customer যোগ করুন'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {mode === 'search' ? (
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

            {/* Add new customer button */}
            <button onClick={() => setMode('create')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50 hover:bg-brand-100 transition-all text-left">
              <div className="w-9 h-9 bg-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
                <UserPlus size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-700">নতুন Customer যোগ করুন</p>
                <p className="text-xs text-brand-500">নাম ও ফোন নম্বর দিয়ে দ্রুত তৈরি করুন</p>
              </div>
            </button>

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
            <div className="max-h-44 overflow-y-auto space-y-1">
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
        ) : (
          /* ── Create New Customer Form ──────────────────────── */
          <div className="p-4 space-y-4">
            <div>
              <label className="label">Name <span className="text-red-500">*</span></label>
              <input name="name" value={form.name} onChange={onFormChange}
                placeholder="Customer এর নাম"
                className={`input ${errors.name ? 'input-error' : ''}`} autoFocus />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>
            <div>
              <label className="label">Phone</label>
              <input name="phone" value={form.phone} onChange={onFormChange}
                placeholder="01XXXXXXXXX"
                className={`input ${errors.phone ? 'input-error' : ''}`} />
              {errors.phone && <p className="form-error">{errors.phone}</p>}
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" value={form.email} onChange={onFormChange}
                placeholder="email@example.com (optional)" className="input" />
            </div>
            <div>
              <label className="label">Address</label>
              <textarea name="address" value={form.address} onChange={onFormChange}
                rows={2} className="input resize-none" placeholder="(optional)" />
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setMode('search')} className="btn-secondary flex-1">
                বাতিল
              </button>
              <button onClick={createCustomer} disabled={saving} className="btn-primary flex-1">
                {saving
                  ? <><span className="spinner" /> Saving...</>
                  : <><UserPlus size={14} /> তৈরি করুন</>
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerModal