import { TrendingUp, TrendingDown } from 'lucide-react'

const StatsCard = ({
  icon: Icon, label, value,
  color = 'bg-blue-500',
  prefix = '৳', suffix = '',
  trend, trendLabel,
}) => {
  const isUp = trend >= 0

  return (
    <div className="card card-body flex items-center gap-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5 truncate">
          {prefix && <span className="text-base">{prefix} </span>}
          {typeof value === 'number' ? value.toLocaleString() : value}
          {suffix && <span className="text-sm font-normal text-gray-500"> {suffix}</span>}
        </p>
        {trendLabel && (
          <p className={`flex items-center gap-1 text-xs mt-1 ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
            {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trendLabel}
          </p>
        )}
      </div>
    </div>
  )
}

export default StatsCard