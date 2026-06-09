import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search, Eye, Package, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import api          from '../../lib/axios'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Pagination    from '../../components/ui/Pagination'
import useSelectData from '../../hooks/useSelectData'

const SELECT_ENDPOINTS = [
  { key: 'categories', url: '/categories?per_page=500' },
  { key: 'brands',     url: '/brands?per_page=500' },
]

const ProductsPage = () => {
  const navigate = useNavigate()

  const [products,   setProducts]   = useState([])
  const [meta,       setMeta]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [page,       setPage]       = useState(1)
  const [filters,    setFilters]    = useState({ category_id: '', brand_id: '' })
  const [showFilter, setShowFilter] = useState(false)
  const [delTarget,  setDelTarget]  = useState(null)
  const [delLoading, setDelLoading] = useState(false)

  const { data: selectData } = useSelectData(SELECT_ENDPOINTS)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/products', {
        params: {
          page, per_page: 15,
          search:      search || undefined,
          category_id: filters.category_id || undefined,
          brand_id:    filters.brand_id    || undefined,
        },
      })
      const d = data?.data
      setProducts(Array.isArray(d) ? d : (d?.data ?? []))
      setMeta(d?.meta ?? (d?.last_page ? d : null))
    } catch { toast.error('Products লোড হয়নি') }
    finally  { setLoading(false) }
  }, [page, search, filters])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 400)
    return () => clearTimeout(t)
  }, [search, filters])

  const doDelete = async () => {
    setDelLoading(true)
    try {
      await api.delete(`/products/${delTarget.id}`)
      toast.success('Delete সফল হয়েছে')
      setDelTarget(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Delete হয়নি')
    } finally { setDelLoading(false) }
  }

  const hasFilter = filters.category_id || filters.brand_id

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">সব product এখানে manage করুন</p>
        </div>
        <button onClick={() => navigate('/products/new')} className="btn-primary">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="card">
        {/* Search + Filter row */}
        <div className="p-4 border-b border-gray-200 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Product name বা barcode search করুন..." className="input pl-9" />
          </div>

          <button onClick={() => setShowFilter(s => !s)}
            className={`btn-ghost btn-sm ${showFilter ? 'bg-gray-100' : ''}`}>
            <Filter size={14} />
            Filter
            {hasFilter && <span className="w-1.5 h-1.5 bg-brand-600 rounded-full" />}
          </button>

          {hasFilter && (
            <button onClick={() => setFilters({ category_id: '', brand_id: '' })}
              className="text-xs text-red-500 hover:underline">
              Clear
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        {showFilter && (
          <div className="px-4 pb-3 pt-2 flex flex-wrap gap-3 border-b border-gray-100 bg-gray-50">
            <select value={filters.category_id}
              onChange={e => setFilters(p => ({ ...p, category_id: e.target.value }))}
              className="input max-w-44 py-1.5 text-sm">
              <option value="">সব Category</option>
              {(selectData.categories ?? []).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select value={filters.brand_id}
              onChange={e => setFilters(p => ({ ...p, brand_id: e.target.value }))}
              className="input max-w-44 py-1.5 text-sm">
              <option value="">সব Brand</option>
              {(selectData.brands ?? []).map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Table */}
        <div className="table-wrapper rounded-none border-x-0 border-b-0">
          <table className="table">
            <thead>
              <tr>
                <th className="w-10">#</th>
                <th>Product Name</th>
                <th>Barcode / SKU</th>
                <th>Category</th>
                <th className="text-right">Cost</th>
                <th className="text-right">Sale Price</th>
                <th className="text-right">Stock</th>
                <th className="w-24">Status</th>
                <th className="w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="py-14 text-center">
                  <div className="spinner border-brand-600 mx-auto" />
                </td></tr>
              ) : !products.length ? (
                <tr><td colSpan={9} className="py-14 text-center text-gray-400">
                  <Package size={40} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">কোন product নেই — Add Product click করুন</p>
                </td></tr>
              ) : products.map((p, i) => {
                const stock = p.stock ?? p.total_stock ?? 0
                const isLow = stock <= (p.min_stock ?? 5)
                return (
                  <tr key={p.id}>
                    <td className="text-gray-400 text-xs">{(page-1)*15+i+1}</td>
                    <td>
                      <p className="font-medium text-gray-900">{p.name}</p>
                      {p.brand && <p className="text-xs text-gray-400">{p.brand.name}</p>}
                    </td>
                    <td>
                      <div className="space-y-0.5">
                        {p.barcode && (
                          <span className="font-mono text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded block w-fit">
                            {p.barcode}
                          </span>
                        )}
                        {p.sku && <p className="text-xs text-gray-400">{p.sku}</p>}
                      </div>
                    </td>
                    <td className="text-sm text-gray-600">{p.category?.name ?? '—'}</td>
                    <td className="text-right text-sm text-gray-600">
                      {p.cost_price ? `৳ ${Number(p.cost_price).toLocaleString()}` : '—'}
                    </td>
                    <td className="text-right font-semibold text-gray-900">
                      ৳ {Number(p.sale_price ?? 0).toLocaleString()}
                    </td>
                    <td className="text-right">
                      <span className={`font-semibold text-sm ${isLow ? 'text-red-600' : 'text-gray-700'}`}>
                        {stock}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">{p.unit?.short_name ?? ''}</span>
                      {isLow && <p className="text-xs text-red-400 leading-none">low!</p>}
                    </td>
                    <td>
                      <span className={`badge ${p.is_active ? 'badge-success' : 'badge-gray'}`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => navigate(`/products/${p.id}`)}
                          title="Details"
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => navigate(`/products/${p.id}/edit`)}
                          title="Edit"
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDelTarget(p)}
                          title="Delete"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Pagination meta={meta} onPageChange={setPage} />
      </div>

      <ConfirmDialog
        open={!!delTarget} onClose={() => setDelTarget(null)}
        onConfirm={doDelete} loading={delLoading}
        title="Product Delete করুন"
        message={`"${delTarget?.name}" permanently delete হবে। সকল stock data মুছে যাবে। নিশ্চিত?`}
      />
    </div>
  )
}

export default ProductsPage