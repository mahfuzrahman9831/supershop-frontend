import { Link } from 'react-router-dom'
import { Users, Truck, ArrowRight } from 'lucide-react'

const DueWidget = ({ customerDue = 0, supplierDue = 0, loading }) => {
  if (loading) return (
    <div className="card card-body h-32 flex items-center justify-center">
      <div className="animate-spin w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="card card-body">
      <h3 className="font-semibold text-gray-800 text-sm mb-3">Due Summary</h3>
      <div className="space-y-2.5">

        <Link to="/customers" className="flex items-center justify-between group hover:bg-red-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users size={13} className="text-red-600" />
            </div>
            <span className="text-sm text-gray-600">Customer Due</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-red-600">৳ {Number(customerDue).toLocaleString()}</span>
            <ArrowRight size={12} className="text-gray-300 group-hover:text-red-400 transition-colors" />
          </div>
        </Link>

        <div className="border-t border-gray-100" />

        <Link to="/suppliers" className="flex items-center justify-between group hover:bg-amber-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Truck size={13} className="text-amber-600" />
            </div>
            <span className="text-sm text-gray-600">Supplier Due</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-amber-600">৳ {Number(supplierDue).toLocaleString()}</span>
            <ArrowRight size={12} className="text-gray-300 group-hover:text-amber-400 transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  )
}

export default DueWidget