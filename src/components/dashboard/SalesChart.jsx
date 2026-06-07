import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

// Custom tooltip
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-bold text-brand-600">
        ৳ {Number(payload[0]?.value ?? 0).toLocaleString()}
      </p>
      {payload[1] && (
        <p className="text-xs text-purple-500">
          Purchase: ৳ {Number(payload[1]?.value ?? 0).toLocaleString()}
        </p>
      )}
    </div>
  )
}

const SalesChart = ({ data, loading }) => {
  if (loading) return (
    <div className="h-56 flex items-center justify-center">
      <div className="animate-spin w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full" />
    </div>
  )

  if (!data?.length) return (
    <div className="h-56 flex flex-col items-center justify-center text-gray-400">
      <p className="text-3xl mb-2">📊</p>
      <p className="text-sm">এই মাসে কোন sales data নেই</p>
    </div>
  )

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}    />
          </linearGradient>
          <linearGradient id="purchaseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#9333ea" stopOpacity={0.1}  />
            <stop offset="95%" stopColor="#9333ea" stopOpacity={0}    />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickFormatter={(v) => {
            // "2026-06-15" → "15"
            const parts = v?.split('-')
            return parts?.[2] ?? v
          }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
          axisLine={false} tickLine={false}
        />

        <Tooltip content={<ChartTooltip />} />

        {/* Sales area */}
        <Area
          type="monotone" dataKey="total"
          stroke="#2563eb" strokeWidth={2}
          fill="url(#salesGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
        />
        {/* Purchase area (optional — যদি API দেয়) */}
        <Area
          type="monotone" dataKey="purchase_total"
          stroke="#9333ea" strokeWidth={1.5}
          fill="url(#purchaseGrad)"
          dot={false}
          activeDot={{ r: 3, fill: '#9333ea' }}
          strokeDasharray="4 2"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default SalesChart