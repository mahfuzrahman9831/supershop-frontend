import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Package, Tag, Boxes, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'

const Field = ({ label, value, mono = false }) => (
  <div>
    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
    <p className={`text-sm font-medium text-gray-800 ${mono ? 'font-mono' : ''}`}>
      {value ?? <span className="text-gray-300 font-normal">—</span>}
    </p>
  </div>
)

const ProductDetailPage = () => {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(({ data }) => setProduct(data?.data))
      .catch(() => { toast.error('Product লোড হয়নি'); navigate('/products') })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" />
    </div>
  )
  if (!product) return null

  const stock     = product.stock ?? product.total_stock ?? 0
  const isLow     = stock <= (product.min_stock ?? 5)
  const cost      = Number(product.cost_price ?? 0)
  const sale      = Number(product.sale_price ?? 0)
  const profit    = cost > 0 ? sale - cost : null
  const markup    = profit !== null && cost > 0
    ? ((profit / cost) * 100).toFixed(1) : null

  return (
    <div>
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/products')}
            className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`badge ${product.is_active ? 'badge-success' : 'badge-gray'}`}>
                {product.is_active ? 'Active' : 'Inactive'}
              </span>
              {product.type && product.type !== 'simple' && (
                <span className="badge badge-info capitalize">{product.type}</span>
              )}
              {product.has_batch  && <span className="badge badge-info">Batch Tracked</span>}
              {product.has_expiry && <span className="badge badge-warning">Expiry Tracked</span>}
            </div>
          </div>
        </div>
        <button onClick={() => navigate(`/products/${id}/edit`)} className="btn-primary">
          <Pencil size={15} /> Edit
        </button>
      </div>

      {/* ── Summary Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="card card-body">
          <p className="text-gray-500 text-sm">Current Stock</p>
          <p className={`text-2xl font-bold mt-0.5 ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
            {stock}
            <span className="text-sm font-normal text-gray-400 ml-1">
              {product.unit?.short_name ?? ''}
            </span>
          </p>
          {isLow && <p className="text-xs text-red-500 mt-1">⚠ Low Stock</p>}
        </div>
        <div className="card card-body">
          <p className="text-gray-500 text-sm">Sale Price</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">
            ৳ {sale.toLocaleString()}
          </p>
        </div>
        <div className="card card-body">
          <p className="text-gray-500 text-sm">Cost Price</p>
          <p className="text-2xl font-bold text-gray-700 mt-0.5">
            {cost > 0 ? `৳ ${cost.toLocaleString()}` : '—'}
          </p>
        </div>
        <div className="card card-body">
          <p className="text-gray-500 text-sm">Profit / Markup</p>
          {profit !== null ? (
            <p className={`text-2xl font-bold mt-0.5 ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              ৳ {Math.abs(profit).toLocaleString()}
              {markup && <span className="text-sm font-normal ml-1">({markup}%)</span>}
            </p>
          ) : <p className="text-xl text-gray-400 mt-0.5">—</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* ── Left: Info ─────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-4">
          <div className="card card-body">
            <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <Package size={15} /> Product Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Product Name" value={product.name} />
              <Field label="Product Type" value={product.type ?? 'simple'} />
              <Field label="Barcode" value={product.barcode} mono />
              <Field label="SKU" value={product.sku} mono />
            </div>
            {product.description && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>

          <div className="card card-body">
            <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <Tag size={15} /> Classification
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category" value={product.category?.name} />
              <Field label="Brand"    value={product.brand?.name} />
              <Field label="Unit"     value={product.unit
                ? `${product.unit.name}${product.unit.short_name ? ` (${product.unit.short_name})` : ''}` : null} />
              <Field label="Tax Rate" value={product.tax_rate
                ? `${product.tax_rate.name} (${product.tax_rate.rate}%)` : 'Tax নেই'} />
            </div>
          </div>
        </div>

        {/* ── Right: Stock + Quick Actions ──────────────── */}
        <div className="space-y-4">
          <div className="card card-body">
            <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <Boxes size={15} /> Stock Info
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Current Stock',     value: `${stock} ${product.unit?.short_name ?? ''}` },
                { label: 'Min Stock Alert',   value: `${product.min_stock ?? 0}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-800">{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Batch Tracking</span>
                <span className={`badge ${product.has_batch ? 'badge-info' : 'badge-gray'}`}>
                  {product.has_batch ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Expiry Tracking</span>
                <span className={`badge ${product.has_expiry ? 'badge-warning' : 'badge-gray'}`}>
                  {product.has_expiry ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          <div className="card card-body">
            <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <TrendingUp size={15} /> Quick Actions
            </h3>
            <div className="space-y-2">
              {[
                { label: '📦 Stock Adjustment', path: `/stock/adjust?product_id=${id}` },
                { label: '📊 Movement History',  path: `/stock/movements?product_id=${id}` },
                { label: '🛒 New Purchase',       path: `/purchases/new?product_id=${id}` },
              ].map(({ label, path }) => (
                <button key={label} onClick={() => navigate(path)}
                  className="btn-secondary w-full justify-start text-sm font-normal">
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage