import { RefreshCw, ShoppingCart, Package, TrendingUp, AlertTriangle } from 'lucide-react'
import useDashboard       from '../hooks/useDashboard'
import StatsCard          from '../components/dashboard/StatsCard'
import SalesChart         from '../components/dashboard/SalesChart'
import ShiftWidget        from '../components/dashboard/ShiftWidget'
import DueWidget          from '../components/dashboard/DueWidget'
import LowStockList       from '../components/dashboard/LowStockList'
import RecentSalesTable   from '../components/dashboard/RecentSalesTable'

const todayLabel = () =>
  new Date().toLocaleDateString('bn-BD', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

const DashboardPage = () => {
  const { dashboard, recentSales, chartData, shift, lowStockList, loading, refetch } = useDashboard()

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{todayLabel()}</p>
        </div>
        <button onClick={refetch} disabled={loading} className="btn-ghost btn-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatsCard
          icon={ShoppingCart}
          label="Today's Sales"
          value={Number(dashboard?.today_sales ?? 0)}
          color="bg-blue-500"
        />
        <StatsCard
          icon={Package}
          label="Today's Purchase"
          value={Number(dashboard?.today_purchase ?? 0)}
          color="bg-purple-500"
        />
        <StatsCard
          icon={TrendingUp}
          label="Today's Profit"
          value={Number(dashboard?.today_profit ?? 0)}
          color="bg-emerald-500"
          trendLabel={Number(dashboard?.today_profit ?? 0) > 0 ? 'লাভ হয়েছে' : null}
          trend={Number(dashboard?.today_profit ?? 0) >= 0 ? 1 : -1}
        />
        <StatsCard
          icon={AlertTriangle}
          label="Low Stock Items"
          value={dashboard?.low_stock ?? 0}
          prefix=""
          suffix="টি product"
          color="bg-amber-500"
        />
      </div>

      {/* ── Chart + Shift/Due ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <div className="xl:col-span-2 card">
          <div className="card-header flex items-center justify-between">
            <span>এই মাসের Sales Overview</span>
            <span className="text-xs text-gray-400">
              {new Date().toLocaleDateString('en-BD', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="card-body !pt-3">
            <SalesChart data={chartData} loading={loading} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <ShiftWidget shift={shift} loading={loading} />
          <DueWidget
            customerDue={dashboard?.customer_due ?? 0}
            supplierDue={dashboard?.supplier_due  ?? 0}
            loading={loading}
          />
        </div>
      </div>

      {/* ── Recent Sales + Low Stock ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <RecentSalesTable sales={recentSales} loading={loading} />
        </div>
        <div>
          <LowStockList products={lowStockList} loading={loading} />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage