import { useState, useEffect, useCallback } from 'react'
import { Search, RefreshCw, Boxes } from 'lucide-react'
import api from '../../lib/axios'
import Pagination from '../../components/ui/Pagination'

const StockOverviewPage = () => {
  const [items,      setItems]      = useState([])
  const [meta,       setMeta]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [page,       setPage]       = useState(1)
  const [warehouseId, setWarehouseId] = useState('')
  const [warehouses, setWarehouses] = useState([])

  useEffect(() => {
    api.get('/warehouses?per_page=100')
      .then(({ data }) => {
        const d = data?.data
        setWarehouses(Array.isArray(d) ? d : d?.data ?? [])
      })
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/stock/valuation', {
        params: {
          page, per_page: 20,
          search: search || undefined,
          warehouse_id: warehouseId || undefined,
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
  }, [page, search, warehouseId])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 400)
    return () => clearTimeout(t)
  }, [search, warehouseId])

  // Client-side valuation total
  const totalValue = items.reduce((s, i) => {
    const qty  = Number(i.quantity_on_hand ?? i.stock ?? 0)
    const cost = Number(i.cost_price ?? i.product?.cost_price ?? 0)
    return s + qty * cost
  }, 0)

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Stock Overview</h1>
          <p className="page-subtitle">সব product এর current stock</p>
        </div>
        <button onClick={load} disabled={loading} className="btn-ghost btn-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Summary */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Total Products',    value: meta?.total ?? items.length, prefix: '' },
            { label: 'Total Stock Value', value: `৳ ${totalValue.toLocaleString()}`, prefix: '' },
            {
              label: 'Low Stock',
              value: items.filter(i => {
                const qty = Number(i.quantity_on_hand ?? i.stock ?? 0)
                return qty <= (i.min_stock ?? i.product?.min_stock ?? 5)
              }).length + ' items',
              prefix: '', color: 'text-amber-600',
            },
          ].map(s => (
            <div key={s.label} className="card card-body">
              <p className="text-gray-500 text-sm">{s.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${s.color ?? 'text-gray-900'}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Product search করুন..." className="input pl-9" />
          </div>
          <select value={warehouseId} onChange={e => setWarehouseId(e.target.value)}
            className="input max-w-44 py-2 text-sm">
            <option value="">সব Warehouse</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>

        <div className="table-wrapper rounded-none border-x-0 border-b-0">
          <table className="table">
            <thead>
              <tr>
                <th className="w-10">#</th>
                <th>Product</th>
                <th>Barcode</th>
                <th>Warehouse</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Cost</th>
                <th className="text-right">Value</th>
                <th className="w-20">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-14 text-center">
                  <div className="spinner border-brand-600 mx-auto" />
                </td></tr>
              ) : !items.length ? (
                <tr><td colSpan={8} className="py-14 text-center text-gray-400">
                  <Boxes size={40} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">কোন stock নেই — Opening Stock এ যান</p>
                </td></tr>
              ) : items.map((item, i) => {
                const product  = item.product ?? item
                const qty      = Number(item.quantity_on_hand ?? item.stock_quantity ?? item.stock ?? 0)
                const cost     = Number(item.cost_price ?? product.last_purchase_price ?? 0)
                const minStock = Number(item.low_stock_alert ?? item.min_stock ?? product.low_stock_alert ?? 5)
                const isLow    = qty <= minStock

                return (
                  <tr key={`${item.id}-${i}`}>
                    <td className="text-gray-400 text-xs">{(page-1)*20+i+1}</td>
                    <td>
                      <p className="font-medium text-gray-900">{product.name ?? item.name}</p>
                      <p className="text-xs text-gray-400">{product.category?.name ?? ''}</p>
                    </td>
                    <td className="font-mono text-xs text-gray-500">{product.barcode ?? '—'}</td>
                    <td className="text-sm text-gray-600">{item.warehouse?.name ?? 'Main Store'}</td>
                    <td className="text-right">
                      <span className={`font-bold text-sm ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                        {qty}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">{product.unit?.short_name ?? ''}</span>
                      {isLow && <p className="text-[10px] text-red-400 leading-none">low!</p>}
                    </td>
                    <td className="text-right text-sm text-gray-600">
                      {cost > 0 ? `৳ ${cost.toLocaleString()}` : '—'}
                    </td>
                    <td className="text-right text-sm font-medium text-gray-700">
                      {cost > 0 ? `৳ ${(qty * cost).toLocaleString()}` : '—'}
                    </td>
                    <td>
                      <span className={`badge ${isLow ? 'badge-danger' : 'badge-success'}`}>
                        {isLow ? 'Low' : 'OK'}
                      </span>
                    </td>
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

export default StockOverviewPage