import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingCart, Package, Boxes,
  Truck, Receipt, Users, Wallet, Clock,
  BarChart3, Settings, ChevronDown, ChevronRight,
  Store,
} from 'lucide-react'

// ──────────────────────────────────────────────────────────────
// Navigation structure — Phase বাড়লে এখানে route যোগ করুন
// ──────────────────────────────────────────────────────────────
const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',  path: '/' },
  { icon: ShoppingCart,    label: 'POS',        path: '/pos', hot: true },
  {
    icon: Package, label: 'Products',
    sub: [
      { label: 'সব Product',  path: '/products' },
      { label: 'Categories',  path: '/categories' },
      { label: 'Brands',      path: '/brands' },
      { label: 'Units',       path: '/units' },
    ],
  },
  {
    icon: Boxes, label: 'Inventory',
    sub: [
      { label: 'Overview',      path: '/stock' },
      { label: 'Opening Stock', path: '/stock/opening' },
      { label: 'Adjustment',    path: '/stock/adjust' },
      { label: 'Movements',     path: '/stock/movements' },
      { label: 'Transfers',     path: '/stock/transfers' },
    ],
  },
  {
    icon: Truck, label: 'Purchase',
    sub: [
      { label: 'Purchase List',   path: '/purchases' },
      { label: 'New Purchase',    path: '/purchases/new' },
      { label: 'Suppliers',       path: '/suppliers' },
      { label: 'Purchase Return', path: '/purchase-returns' },
    ],
  },
  {
    icon: Receipt, label: 'Sales',
    sub: [
      { label: 'Sale List',   path: '/sales' },
      { label: 'Sale Return', path: '/sale-returns' },
    ],
  },
  { icon: Users,    label: 'Customers', path: '/customers' },
  {
    icon: Wallet, label: 'Expenses',
    sub: [
      { label: 'Expense List', path: '/expenses' },
      { label: 'Categories',   path: '/expense-categories' },
    ],
  },
  { icon: Clock,    label: 'Shifts',  path: '/shifts' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  {
    icon: Settings, label: 'Settings',
    sub: [
      { label: 'Shop Settings',   path: '/settings' },
      { label: 'Users',           path: '/users' },
      { label: 'Warehouses',      path: '/warehouses' },
      { label: 'Payment Methods', path: '/payment-methods' },
      { label: 'Audit Logs',      path: '/audit-logs' },
    ],
  },
]

// ── Sub-menu item ──────────────────────────────────────────────
const SubItem = ({ item }) => (
  <NavLink
    to={item.path}
    className={({ isActive }) =>
      `flex items-center gap-2 pl-10 pr-4 py-1.5 text-sm rounded-lg transition-colors ${
        isActive
          ? 'text-white bg-brand-600'
          : 'text-sidebar-text hover:text-white hover:bg-sidebar-hover'
      }`
    }
  >
    <span className="w-1 h-1 rounded-full bg-current opacity-60 flex-shrink-0" />
    {item.label}
  </NavLink>
)

// ── Single nav item (no children) ─────────────────────────────
const NavItem = ({ item }) => (
  <NavLink
    to={item.path}
    end={item.path === '/'}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-brand-600 text-white'
          : 'text-sidebar-text hover:text-white hover:bg-sidebar-hover'
      }`
    }
  >
    <item.icon size={17} className="flex-shrink-0" />
    <span className="flex-1">{item.label}</span>
    {item.hot && (
      <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold tracking-wide">
        HOT
      </span>
    )}
  </NavLink>
)

// ── Collapsible group ──────────────────────────────────────────
const NavGroup = ({ item }) => {
  const location = useLocation()
  const anyActive = item.sub.some((s) => location.pathname.startsWith(s.path))
  const [open, setOpen] = useState(anyActive)

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          anyActive
            ? 'text-white bg-sidebar-hover'
            : 'text-sidebar-text hover:text-white hover:bg-sidebar-hover'
        }`}
      >
        <item.icon size={17} className="flex-shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        {open
          ? <ChevronDown size={13} className="flex-shrink-0" />
          : <ChevronRight size={13} className="flex-shrink-0" />
        }
      </button>

      {open && (
        <div className="mt-0.5 space-y-0.5">
          {item.sub.map((s) => <SubItem key={s.path} item={s} />)}
        </div>
      )}
    </div>
  )
}

// ── Main Sidebar ───────────────────────────────────────────────
const Sidebar = () => (
  <aside className="w-60 flex-shrink-0 bg-sidebar-bg flex flex-col overflow-hidden">

    {/* Logo */}
    <div className="flex items-center gap-2.5 px-4 py-4 border-b border-sidebar-border">
      <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
        <Store size={17} className="text-white" />
      </div>
      <div>
        <p className="text-white font-bold text-sm leading-tight">SuperShop</p>
        <p className="text-gray-600 text-[10px] leading-tight">ERP System</p>
      </div>
    </div>

    {/* Navigation */}
    <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
      {NAV.map((item) =>
        item.sub
          ? <NavGroup key={item.label} item={item} />
          : <NavItem  key={item.path}  item={item} />,
      )}
    </nav>

    {/* Footer */}
    <div className="px-4 py-3 border-t border-sidebar-border">
      <p className="text-gray-600 text-[10px]">SuperShop ERP · v1.0.0</p>
    </div>
  </aside>
)

export default Sidebar