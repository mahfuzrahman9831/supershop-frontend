import { useState, useEffect, useRef } from 'react'
import { Search, Plus, Trash2, Save, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'

const INIT_ROW = () => ({
  _id: Math.random(),
  product: null, product_id: '',
  warehouse_id: '',
  quantity: '', cost_price: '', notes: '',
})

const OpeningStockPage = () => {
  const [rows,       setRows]       = useState([INIT_ROW()])
  const [warehouses, setWarehouses] = useState([])
  const [saving,     setSaving]     = useState(false)

  // Per-row search state
  const [searches,   setSearches]   = useState({})
  const [results,    setResults]    = useState({})
  const [searching,  setSearching]  = useState({})
  const timers = useRef({})

  useEffect(() => {
    api.get('/warehouses?per_page=100')
      .then(({ data }) => {
        const d = data?.data
        const ws = Array.isArray(d) ? d : d?.data ?? []
        setWarehouses(ws)
        // প্রথম warehouse auto-select
        if (ws.length) {
          setRows(r => r.map(row => ({ ...row, warehouse_id: row.warehouse_id || String(ws[0].id) })))
        }
      })
  }, [])

  const searchProduct = (rowId, q) => {
    setSearches(p => ({ ...p, [rowId]: q }))
    clearTimeout(timers.current[rowId])
    if (!q.trim()) { setResults(p => ({ ...p, [rowId]: [] })); return }
    timers.current[rowId] = setTimeout(async () => {
      setSearching(p => ({ ...p, [rowId]: true }))
      try {
        const { data } = await api.get('/products', { params: { search: q, per_page: 8 } })
        const d = data?.data
        setResults(p => ({ ...p, [rowId]: Array.isArray(d) ? d : d?.data ?? [] }))
      } finally { setSearching(p => ({ ...p, [rowId]: false })) }
    }, 400)
  }

  const selectProduct = (rowId, product) => {
    setRows(p => p.map(r => r._id === rowId
      ? { ...r, product, product_id: product.id, cost_price: product.cost_price ?? '' }
      : r
    ))
    setSearches(p => ({ ...p, [rowId]: '' }))
    setResults(p => ({ ...p, [rowId]: [] }))
  }

  const updateRow = (rowId, field, value) =>
    setRows(p => p.map(r => r._id === rowId ? { ...r, [field]: value } : r))

  const removeRow = (rowId) => setRows(p => p.filter(r => r._id !== rowId))

  const addRow = () => {
    const wId = warehouses[0]?.id ? String(warehouses[0].id) : ''
    setRows(p => [...p, { ...INIT_ROW(), warehouse_id: wId }])
  }

  const onSubmit = async () => {
    // Validate
    const valid = rows.filter(r => r.product_id && r.quantity && r.warehouse_id)
    if (!valid.length) { toast.error('কমপক্ষে একটি product দিন'); return }

    setSaving(true)
    let success = 0, failed = 0

    for (const row of valid) {
      try {
        await api.post('/stock/opening', {
          product_id:   row.product_id,
          warehouse_id: row.warehouse_id,
          quantity:     Number(row.quantity),
          cost_price:   row.cost_price !== '' ? Number(row.cost_price) : undefined,
          notes:        row.notes || undefined,
        })
        success++
      } catch (err) {
        failed++
        const msg = err.response?.data?.message ?? 'Error'
        toast.error(`${row.product?.name}: ${msg}`)
      }
    }

    setSaving(false)
    if (success) {
      toast.success(`${success}টি product এর opening stock set করা হয়েছে ✓`)
      setRows([{ ...INIT_ROW(), warehouse_id: rows[0]?.warehouse_id ?? '' }])
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Opening Stock</h1>
        <p className="page-subtitle">নতুন product এর initial stock এখানে enter করুন</p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2.5 p-4 bg-blue-50 border border-blue-100 rounded-xl mb-5 text-sm text-blue-700">
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        Opening stock শুধুমাত্র একবার enter করুন — যখন প্রথম system ব্যবহার শুরু করছেন। পরবর্তীতে Purchase বা Adjustment ব্যবহার করুন।
      </div>

      <div className="card card-body">
        <div className="space-y-3">
          {rows.map((row, idx) => (
            <div key={row._id} className="grid grid-cols-12 gap-3 items-start p-3 bg-gray-50 rounded-xl">

              {/* Serial */}
              <div className="col-span-12 sm:col-span-1 flex items-center pt-2">
                <span className="text-gray-400 text-sm font-medium">{idx + 1}</span>
              </div>

              {/* Product Search */}
              <div className="col-span-12 sm:col-span-4 relative">
                <label className="label text-xs">Product <span className="text-red-500">*</span></label>
                {row.product ? (
                  <div className="flex items-center gap-2 p-2 bg-white border border-gray-300 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{row.product.name}</p>
                      {row.product.barcode && (
                        <p className="text-xs text-gray-400 font-mono">{row.product.barcode}</p>
                      )}
                    </div>
                    <button onClick={() => setRows(p => p.map(r => r._id === row._id
                      ? { ...r, product: null, product_id: '' } : r
                    ))} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={searches[row._id] ?? ''}
                      onChange={e => searchProduct(row._id, e.target.value)}
                      placeholder="Product name বা barcode..."
                      className="input pl-8 text-sm"
                    />
                    {/* Dropdown */}
                    {(results[row._id]?.length > 0 || searching[row._id]) && (
                      <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                        {searching[row._id] ? (
                          <div className="py-3 text-center text-sm text-gray-400">
                            <div className="spinner border-brand-600 mx-auto mb-1" />
                          </div>
                        ) : results[row._id].map(p => (
                          <button key={p.id} onClick={() => selectProduct(row._id, p)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-left transition-colors">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Search size={12} className="text-gray-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                              <p className="text-xs text-gray-400 font-mono">{p.barcode ?? p.sku ?? ''}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Warehouse */}
              <div className="col-span-6 sm:col-span-2">
                <label className="label text-xs">Warehouse <span className="text-red-500">*</span></label>
                <select value={row.warehouse_id}
                  onChange={e => updateRow(row._id, 'warehouse_id', e.target.value)}
                  className="input text-sm py-2">
                  <option value="">Select</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>

              {/* Quantity */}
              <div className="col-span-6 sm:col-span-2">
                <label className="label text-xs">Quantity <span className="text-red-500">*</span></label>
                <input type="number" min="0" step="0.01"
                  value={row.quantity}
                  onChange={e => updateRow(row._id, 'quantity', e.target.value)}
                  placeholder="0" className="input text-sm py-2" />
              </div>

              {/* Cost Price */}
              <div className="col-span-6 sm:col-span-2">
                <label className="label text-xs">Cost Price</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">৳</span>
                  <input type="number" min="0" step="0.01"
                    value={row.cost_price}
                    onChange={e => updateRow(row._id, 'cost_price', e.target.value)}
                    placeholder="0.00" className="input pl-6 text-sm py-2" />
                </div>
              </div>

              {/* Remove */}
              <div className="col-span-6 sm:col-span-1 flex items-end pb-0.5">
                {rows.length > 1 && (
                  <button onClick={() => removeRow(row._id)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <button onClick={addRow} className="btn-ghost btn-sm">
            <Plus size={14} /> আরো product যোগ করুন
          </button>
          <button onClick={onSubmit} disabled={saving} className="btn-primary">
            {saving
              ? <><span className="spinner" /> Saving...</>
              : <><Save size={15} /> Opening Stock Save করুন</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default OpeningStockPage