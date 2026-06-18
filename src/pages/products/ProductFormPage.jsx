import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import api          from '../../lib/axios'
import useSelectData from '../../hooks/useSelectData'

const SELECT_ENDPOINTS = [
  { key: 'categories', url: '/categories?per_page=500' },
  { key: 'brands',     url: '/brands?per_page=500' },
  { key: 'units',      url: '/units?per_page=500' },
  { key: 'tax_rates',  url: '/tax-rates?per_page=100' },
]

const INIT = {
  name: '', barcode: '', sku: '', description: '',
  category_id: '', brand_id: '', unit_id: '', tax_rate_id: '',
  last_purchase_price: '', default_selling_price: '',
  low_stock_alert: '0', costing_method: 'fifo',
  is_active: true, has_batch: false, has_serial: false,
}

const genBarcode = () => Date.now().toString().slice(-10)

// ── Section wrapper ────────────────────────────────────────────
const Section = ({ title, children }) => (
  <div className="card card-body">
    <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">{title}</h3>
    {children}
  </div>
)

const ProductFormPage = () => {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const isEdit     = Boolean(id)

  const [form,           setForm]           = useState({ ...INIT })
  const [errors,         setErrors]         = useState({})
  const [saving,         setSaving]         = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(isEdit)

  const { data: sd, loading: selectLoading } = useSelectData(SELECT_ENDPOINTS)

  // ── Load existing product for edit ────────────────────────
  useEffect(() => {
    if (!isEdit) return
    api.get(`/products/${id}`)
      .then(({ data }) => {
        const p = data?.data
        if (!p) return
        setForm({
          name:        p.name        ?? '',
          barcode:     p.barcode     ?? '',
          sku:         p.sku         ?? '',
          description: p.description ?? '',
          category_id: p.category_id ?? '',
          brand_id:    p.brand_id    ?? '',
          unit_id:     p.unit_id     ?? '',
          tax_rate_id: p.tax_rate_id ?? '',
          cost_price:  p.cost_price  ?? '',
          sale_price:  p.sale_price  ?? '',
          min_stock:   p.min_stock   ?? '0',
          type:        p.type        ?? 'simple',
          is_active:   p.is_active   ?? true,
          has_batch:   p.has_batch   ?? false,
          has_expiry:  p.has_expiry  ?? false,
        })
      })
      .catch(() => { toast.error('Product লোড হয়নি'); navigate('/products') })
      .finally(() => setLoadingProduct(false))
  }, [id, isEdit])

  const onChange = ({ target: { name, value, type, checked } }) => {
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
    setErrors(p => ({ ...p, [name]: '' }))
  }

  // ── Markup calculation ────────────────────────────────────
  const cost = Number(form.last_purchase_price)
  const sale = Number(form.default_selling_price)
  const markup = cost > 0 && sale > 0
    ? ((sale - cost) / cost * 100).toFixed(1) : null
  const profitAmt = cost > 0 && sale > 0 ? (sale - cost).toFixed(2) : null

  // ── Submit ────────────────────────────────────────────────
  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
      name:                  form.name,
      barcode:               form.barcode     || undefined,
      sku:                   form.sku         || undefined,
      description:           form.description || undefined,
      category_id:           form.category_id || undefined,
      brand_id:              form.brand_id    || undefined,
      unit_id:               form.unit_id     || undefined,
      tax_rate_id:           form.tax_rate_id || undefined,
      last_purchase_price:   form.last_purchase_price   !== '' ? Number(form.last_purchase_price)   : undefined,
      default_selling_price: form.default_selling_price !== '' ? Number(form.default_selling_price) : undefined,
      low_stock_alert:       Number(form.low_stock_alert ?? 0),
      costing_method:        form.costing_method || 'fifo',
      is_active:             form.is_active,
      has_batch:             form.has_batch,
      has_serial:            form.has_serial,
}

      isEdit
        ? await api.put(`/products/${id}`, payload)
        : await api.post('/products', payload)

      toast.success(isEdit ? 'Product update হয়েছে ✓' : 'Product তৈরি হয়েছে ✓')
      navigate('/products')
    } catch (err) {
      const { errors: errs, message } = err.response?.data ?? {}
      if (errs) setErrors(errs)
      else toast.error(message ?? 'Error হয়েছে')
    } finally { setSaving(false) }
  }

  if (loadingProduct || selectLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="page-header flex items-center gap-3">
        <button onClick={() => navigate('/products')}
          className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title">{isEdit ? 'Product Edit করুন' : 'নতুন Product যোগ করুন'}</h1>
          <p className="page-subtitle">
            {isEdit ? 'Product এর তথ্য update করুন' : 'নতুন product এর তথ্য দিন'}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* ── Left: 2/3 ──────────────────────────────────── */}
          <div className="xl:col-span-2 space-y-4">

            {/* Basic Info */}
            <Section title="Basic Information">
              <div className="space-y-4">
                <div>
                  <label className="label">Product Name <span className="text-red-500">*</span></label>
                  <input name="name" value={form.name} onChange={onChange} autoFocus
                    placeholder="Product এর পূর্ণ নাম লিখুন"
                    className={`input ${errors.name ? 'input-error' : ''}`} />
                  {errors.name && <p className="form-error">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Barcode</label>
                    <div className="flex gap-2">
                      <input name="barcode" value={form.barcode} onChange={onChange}
                        placeholder="Scan করুন বা generate করুন"
                        className={`input font-mono text-sm ${errors.barcode ? 'input-error' : ''}`} />
                      <button type="button" title="Auto-generate barcode"
                        onClick={() => setForm(p => ({ ...p, barcode: genBarcode() }))}
                        className="btn-ghost px-2.5 border border-gray-300 flex-shrink-0 rounded-lg">
                        <RefreshCw size={14} />
                      </button>
                    </div>
                    {errors.barcode && <p className="form-error">{errors.barcode}</p>}
                  </div>
                  <div>
                    <label className="label">SKU</label>
                    <input name="sku" value={form.sku} onChange={onChange}
                      placeholder="Stock keeping unit (optional)" className="input text-sm" />
                  </div>
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea name="description" value={form.description} onChange={onChange}
                    rows={3} className="input resize-none"
                    placeholder="Product সম্পর্কে বিস্তারিত তথ্য (optional)" />
                </div>
              </div>
            </Section>

            {/* Classification */}
            <Section title="Classification">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category <span className="text-red-500">*</span></label>
                  <select name="category_id" value={form.category_id} onChange={onChange}
                    className={`input ${errors.category_id ? 'input-error' : ''}`}>
                    <option value="">— Category select করুন —</option>
                    {(sd.categories ?? []).map(c => (
                      <option key={c.id} value={c.id}>
                        {c.parent_id ? `    ↳ ${c.name}` : c.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && <p className="form-error">{errors.category_id}</p>}
                </div>
                <div>
                  <label className="label">Brand</label>
                  <select name="brand_id" value={form.brand_id} onChange={onChange} className="input">
                    <option value="">— Brand (optional) —</option>
                    {(sd.brands ?? []).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Unit <span className="text-red-500">*</span></label>
                  <select name="unit_id" value={form.unit_id} onChange={onChange}
                    className={`input ${errors.unit_id ? 'input-error' : ''}`}>
                    <option value="">— Unit select করুন —</option>
                    {(sd.units ?? []).map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name}{u.short_name ? ` (${u.short_name})` : ''}
                      </option>
                    ))}
                  </select>
                  {errors.unit_id && <p className="form-error">{errors.unit_id}</p>}
                </div>
                <div>
                  <label className="label">Tax Rate</label>
                  <select name="tax_rate_id" value={form.tax_rate_id} onChange={onChange} className="input">
                    <option value="">— Tax নেই —</option>
                    {(sd.tax_rates ?? []).map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.rate}%)</option>
                    ))}
                  </select>
                </div>
              </div>
            </Section>

            {/* Pricing */}
            <Section title="Pricing">
              <div className="grid grid-cols-2 gap-4">
               {/* Cost Price */}
<div>
  <label className="label">Last Purchase Price</label>
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">৳</span>
    <input name="last_purchase_price" type="number" step="0.01" min="0"
      value={form.last_purchase_price} onChange={onChange}
      placeholder="0.00" className="input pl-7" />
  </div>
</div>

{/* Sale Price */}
<div>
  <label className="label">Default Selling Price <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">৳</span>
                  <input name="default_selling_price" type="number" step="0.01" min="0"
                    value={form.default_selling_price} onChange={onChange}
                    placeholder="0.00"
                    className={`input pl-7 ${errors.default_selling_price ? 'input-error' : ''}`} />
                </div>
                {errors.default_selling_price && <p className="form-error">{errors.default_selling_price}</p>}
              </div>
                <div>
                  <label className="label">Sale Price <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">৳</span>
                    <input name="sale_price" type="number" step="0.01" min="0"
                      value={form.sale_price} onChange={onChange}
                      placeholder="0.00"
                      className={`input pl-7 ${errors.sale_price ? 'input-error' : ''}`} />
                  </div>
                  {errors.sale_price && <p className="form-error">{errors.sale_price}</p>}
                </div>
              </div>

              {/* Markup indicator */}
              {markup !== null && (
                <div className={`mt-3 flex items-center gap-4 p-3 rounded-lg border text-sm ${
                  Number(markup) >= 0
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                    : 'bg-red-50 border-red-100 text-red-700'
                }`}>
                  <span>
                    Markup: <strong>{markup}%</strong>
                  </span>
                  <span>
                    Profit/unit: <strong>৳ {profitAmt}</strong>
                  </span>
                  {Number(markup) < 0 && (
                    <span className="font-semibold">⚠ Loss হচ্ছে!</span>
                  )}
                </div>
              )}
            </Section>
          </div>

          {/* ── Right: 1/3 ─────────────────────────────────── */}
          <div className="space-y-4">

            {/* Stock Settings */}
            <Section title="Stock Settings">
              <div className="space-y-4">
                <div>
                  <label className="label">Low Stock Alert Level</label>
                  <input name="low_stock_alert" type="number" min="0"
                    value={form.low_stock_alert} onChange={onChange} className="input" />
                  <p className="text-xs text-gray-400 mt-1">
                    Stock এর কম হলে Dashboard এ alert আসবে
                  </p>
                </div>
                <div>
                  <label className="label">Costing Method</label>
                  <select name="costing_method" value={form.costing_method} onChange={onChange} className="input">
                    <option value="fifo">FIFO (First In First Out)</option>
                    <option value="lifo">LIFO (Last In First Out)</option>
                    <option value="avg">Average Cost</option>
                  </select>
                </div>
              </div>
            </Section>

            {/* Options */}
            <Section title="Options">
              <div className="space-y-4">
                {[
                  { name: 'is_active',  label: 'Active',          sub: 'POS এ দেখাবে এবং বিক্রি করা যাবে'  },
                  { name: 'has_batch',  label: 'Batch Tracking',  sub: 'Purchase এ batch number রাখবে'       },
                  { name: 'has_serial', label: 'Serial Tracking', sub: 'প্রতিটি item এর serial number রাখবে' },
                ].map(opt => (
                  <label key={opt.name} className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" name={opt.name}
                      checked={form[opt.name]} onChange={onChange}
                      className="mt-0.5 w-4 h-4 accent-brand-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        {opt.label}
                      </p>
                      <p className="text-xs text-gray-400">{opt.sub}</p>
                    </div>
                  </label>
                ))}
              </div>
            </Section>

            {/* Action Buttons */}
            <div className="card card-body space-y-2">
              <button type="submit" disabled={saving} className="btn-primary w-full py-2.5">
                {saving
                  ? <><span className="spinner" /> Saving...</>
                  : <><Save size={16} /> {isEdit ? 'Update Product' : 'Save Product'}</>
                }
              </button>
              <button type="button" onClick={() => navigate('/products')}
                className="btn-ghost w-full">
                বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ProductFormPage