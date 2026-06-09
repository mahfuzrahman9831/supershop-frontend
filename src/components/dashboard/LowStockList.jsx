import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react'

const LowStockList = ({ products = [], loading }) => (
  <div className="card h-full flex flex-col">
    <div className="card-header flex items-center justify-between">
      <span className="flex items-center gap-1.5">
        <AlertTriangle size={14} className="text-amber-500" />
        Low Stock Alert
        {products.length > 0 && (
          <span className="badge badge-danger ml-1">{products.length}</span>
        )}
      </span>
      <Link to="/stock" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
        সব দেখুন <ArrowRight size={11} />
      </Link>
    </div>

    <div className="flex-1 overflow-y-auto">
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full" />
        </div>
      ) : !products.length ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
          <CheckCircle size={32} className="text-emerald-400 mb-2" />
          <p className="text-sm">সব product এর stock ঠিক আছে</p>
        </div>
      ) : (
        products.slice(0, 8).map((p) => (
          <div key={p.id} className="flex items-center justify-between px-6 py-3 border-t border-gray-100 hover:bg-amber-50 transition-colors">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
              <p className="text-xs text-gray-400">{p.sku ?? p.barcode ?? '—'}</p>
            </div>
            <span className="badge badge-danger ml-3 flex-shrink-0">
              {p.stock ?? p.total_stock ?? 0} {p.unit?.name ?? 'pcs'}
            </span>
          </div>
        ))
      )}
    </div>
  </div>
)

export default LowStockList