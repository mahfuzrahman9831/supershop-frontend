import { RefreshCw, ShoppingCart, Package, TrendingUp, AlertTriangle } from 'lucide-react'
import useDashboard       from '../hooks/useDashboard'
import StatsCard          from '../components/dashboard/StatsCard'
import SalesChart         from '../components/dashboard/SalesChart'
import ShiftWidget        from '../components/dashboard/ShiftWidget'
import DueWidget          from '../components/dashboard/DueWidget'
import LowStockList       from '../components/dashboard/LowStockList'
import RecentSalesTable   from '../components/dashboard/RecentSalesTable'

// Today এর Bangla date
const todayLabel = () =>
  new Date().toLocaleDateString('bn-BD', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

const DashboardPage = () => {
  const { dashboard, recentSales, chartData, shift, loading, refetch } = useDashboard()
  const today = dashboard?.today ?? {}

  return (
    <div>
      {/* ── Page Header ─────────────────────────────────────── */}
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

      {/* ── Stats Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatsCard
          icon={ShoppingCart}
          label="Today's Sales"
          value={today.sales_amount ?? 0}
          color="bg-blue-500"
          trendLabel={today.sales_count ? `${today.sales_count}টি sale` : null}
          trend={1}
        />
        <StatsCard
          icon={Package}
          label="Today's Purchase"
          value={today.purchase_amount ?? 0}
          color="bg-purple-500"
        />
        <StatsCard
          icon={TrendingUp}
          label="Today's Profit"
          value={today.profit ?? 0}
          color="bg-emerald-500"
          trendLabel={today.profit > 0 ? 'লাভ হয়েছে' : null}
          trend={today.profit >= 0 ? 1 : -1}
        />
        <StatsCard
          icon={AlertTriangle}
          label="Low Stock Items"
          value={dashboard?.low_stock_count ?? 0}
          prefix=""
          suffix="টি product"
          color="bg-amber-500"
        />
      </div>

      {/* ── Row 2: Chart + Shift/Due ─────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">

        {/* Sales Chart — 2/3 width */}
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

        {/* Shift + Due — 1/3 width */}
        <div className="flex flex-col gap-4">
          <ShiftWidget shift={shift} loading={loading} />
          <DueWidget
            customerDue={dashboard?.customer_due ?? 0}
            supplierDue={dashboard?.supplier_due  ?? 0}
            loading={loading}
          />
        </div>
      </div>

      {/* ── Row 3: Recent Sales + Low Stock ──────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <RecentSalesTable sales={recentSales} loading={loading} />
        </div>
        <div>
          <LowStockList
            products={dashboard?.low_stock_products ?? []}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage