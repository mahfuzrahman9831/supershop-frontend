import { useState, useEffect, useCallback } from 'react'
import { Search, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import api from '../../lib/axios'
import Pagination from '../../components/ui/Pagination'

const TYPE_CONFIG = {
  purchase:         { label: 'Purchase',        color: 'badge-success', dir: '+' },
  sale:             { label: 'Sale',             color: 'badge-info',    dir: '−' },
  sale_return:      { label: 'Sale Return',      color: 'badge-warning', dir: '+' },
  purchase_return:  { label: 'Purchase Return',  color: 'badge-warning', dir: '−' },
  opening_stock:    { label: 'Opening Stock',    color: 'badge-gray',    dir: '+' },
  adjustment:       { label: 'Adjustment',       color: 'badge-warning', dir: '±' },
  damage:           { label: 'Damage',           color: 'badge-danger',  dir: '−' },
  expired:          { label: 'Expired',          color: 'badge-danger',  dir: '−' },
  wastage:          { label: 'Wastage',          color: 'badge-danger',  dir: '−' },
  transfer_in:      { label: 'Transfer In',      color: 'badge-info',    dir: '+' },
  transfer_out:     { label: 'Transfer Out',     color: 'badge-info',    dir: '−' },
}

const fmtDate = (str) => {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-BD', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const StockMovementsPage = () => {
  const [items,  setItems]  = useState([])
  const [meta,   setMeta]   = useState(null)
  const [loading,setLoading]= useState(true)
  const [search, setSearch] = useState('')
  const [page,   setPage]   = useState(1)
  const [type,   setType]   = useState('')
  const [from,   setFrom]   = useState('')
  const [to,     setTo]     = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/stock/movements', {
        params: {
          page, per_page: 20,
          search: search || undefined,
          type:   type   || undefined,
          from:   from   || undefined,
          to:     to     || undefined,
        },
      })
      const d = data?.data
      setItems(Array.isArray(d) ? d : d?.data ?? [])
      setMeta(d?.meta ?? (d?.last_page ? d : null))
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [page, search, type, from, to])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 400)
    return () => clearTimeout(t)
  }, [search, type, from, to])

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Stock Movements</h1>
        <p className="page-subtitle">সব stock এর in/out history</p>
      </div>

      <div className="card">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Product search..." className="input pl-9" />
          </div>
          <select value={type} onChange={e => setType(e.target.value)}
            className="input max-w-44 py-2 text-sm">
            <option value="">সব Type</option>
            {Object.entries(TYPE_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="input py-2 text-sm max-w-36" />
          <span className="text-gray-400 text-sm">—</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="input py-2 text-sm max-w-36" />
          {(type || from || to) && (
            <button onClick={() => { setType(''); setFrom(''); setTo('') }}
              className="text-xs text-red-500 hover:underline">Clear</button>
          )}
        </div>

        <div className="table-wrapper rounded-none border-x-0 border-b-0">
          <table className="table">
            <thead>
              <tr>
                <th className="w-10">#</th>
                <th>Product</th>
                <th>Type</th>
                <th>Warehouse</th>
                <th className="text-right">Quantity</th>
                <th>Reference</th>
                <th>Date</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-14 text-center">
                  <div className="spinner border-brand-600 mx-auto" />
                </td></tr>
              ) : !items.length ? (
                <tr><td colSpan={8} className="py-14 text-center text-gray-400">
                  <p className="text-sm">কোন movement নেই</p>
                </td></tr>
              ) : items.map((m, i) => {
                const conf   = TYPE_CONFIG[m.type] ?? { label: m.type, color: 'badge-gray', dir: '?' }
                const isIn   = ['+'].includes(conf.dir)
                const qty    = Number(m.quantity ?? 0)

                return (
                  <tr key={m.id}>
                    <td className="text-gray-400 text-xs">{(page-1)*20+i+1}</td>
                    <td>
                      <p className="font-medium text-gray-900 text-sm">{m.product?.name ?? '—'}</p>
                      {m.product?.barcode && (
                        <p className="text-xs font-mono text-gray-400">{m.product.barcode}</p>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${conf.color}`}>{conf.label}</span>
                    </td>
                    <td className="text-sm text-gray-600">{m.warehouse?.name ?? '—'}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isIn
                          ? <ArrowUpCircle size={13} className="text-emerald-500" />
                          : <ArrowDownCircle size={13} className="text-red-500" />
                        }
                        <span className={`font-bold text-sm ${isIn ? 'text-emerald-600' : 'text-red-600'}`}>
                          {conf.dir}{qty}
                        </span>
                      </div>
                    </td>
                    <td className="font-mono text-xs text-gray-500">
                      {m.reference ?? m.invoice_number ?? '—'}
                    </td>
                    <td className="text-xs text-gray-500 whitespace-nowrap">{fmtDate(m.created_at)}</td>
                    <td className="text-xs text-gray-400 max-w-xs truncate">{m.notes ?? '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Pagination meta={meta} onPageChange={setPage} />
      </div>
    </div>
  )
}

export default StockMovementsPage