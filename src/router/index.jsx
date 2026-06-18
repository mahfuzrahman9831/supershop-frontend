import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout          from '../components/layout/AppLayout'
import ProtectedRoute     from './ProtectedRoute'

// Auth
import LoginPage          from '../pages/auth/LoginPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'

// Dashboard + POS
import DashboardPage      from '../pages/DashboardPage'
import PosPage            from '../pages/pos/PosPage'
import SaleReturnPage     from '../pages/pos/SaleReturnPage'

// 16A — Catalog
import BrandsPage         from '../pages/brands/BrandsPage'
import CategoriesPage     from '../pages/categories/CategoriesPage'
import UnitsPage          from '../pages/units/UnitsPage'
import SuppliersPage      from '../pages/suppliers/SuppliersPage'
import WarehousesPage     from '../pages/warehouses/WarehousesPage'

// 16B — Products
import ProductsPage       from '../pages/products/ProductsPage'
import ProductFormPage    from '../pages/products/ProductFormPage'
import ProductDetailPage  from '../pages/products/ProductDetailPage'

// 16C — Inventory + Purchase
import StockOverviewPage  from '../pages/inventory/StockOverviewPage'
import OpeningStockPage   from '../pages/inventory/OpeningStockPage'
import StockAdjustPage    from '../pages/inventory/StockAdjustPage'
import StockMovementsPage from '../pages/inventory/StockMovementsPage'
import PurchaseListPage   from '../pages/purchases/PurchaseListPage'
import PurchaseCreatePage from '../pages/purchases/PurchaseCreatePage'

// 18 — Reports + Management + Settings
import SalesListPage          from '../pages/sales/SalesListPage'
import ReportsPage            from '../pages/reports/ReportsPage'
import ExpensesPage           from '../pages/expenses/ExpensesPage'
import ExpenseCategoriesPage  from '../pages/expenses/ExpenseCategoriesPage'
import ShiftsPage             from '../pages/shifts/ShiftsPage'
import CustomersPage          from '../pages/customers/CustomersPage'
import SettingsPage           from '../pages/settings/SettingsPage'
import UsersPage              from '../pages/users/UsersPage'
import AuditLogPage           from '../pages/audit/AuditLogPage'
import EmployeesPage          from '../pages/employees/EmployeesPage'

const router = createBrowserRouter([
  // ── Public ──────────────────────────────────────────────────
  { path: '/login',           element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },

  // ── POS (full screen) ────────────────────────────────────────
  { path: '/pos', element: <ProtectedRoute><PosPage /></ProtectedRoute> },

  // ── Protected with AppLayout ─────────────────────────────────
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true,                element: <DashboardPage /> },

      // Catalog
      { path: 'brands',             element: <BrandsPage /> },
      { path: 'categories',         element: <CategoriesPage /> },
      { path: 'units',              element: <UnitsPage /> },
      { path: 'suppliers',          element: <SuppliersPage /> },
      { path: 'warehouses',         element: <WarehousesPage /> },

      // Products
      { path: 'products',           element: <ProductsPage /> },
      { path: 'products/new',       element: <ProductFormPage /> },
      { path: 'products/:id',       element: <ProductDetailPage /> },
      { path: 'products/:id/edit',  element: <ProductFormPage /> },

      // Inventory
      { path: 'stock',              element: <StockOverviewPage /> },
      { path: 'stock/opening',      element: <OpeningStockPage /> },
      { path: 'stock/adjust',       element: <StockAdjustPage /> },
      { path: 'stock/movements',    element: <StockMovementsPage /> },

      // Purchase
      { path: 'purchases',          element: <PurchaseListPage /> },
      { path: 'purchases/new',      element: <PurchaseCreatePage /> },

      // Sales
      { path: 'sales',              element: <SalesListPage /> },
      { path: 'sale-returns',       element: <SaleReturnPage /> },

      // Reports
      { path: 'reports',            element: <ReportsPage /> },

      // Customers
      { path: 'customers',          element: <CustomersPage /> },

      // Expenses
      { path: 'expenses',           element: <ExpensesPage /> },
      { path: 'expense-categories', element: <ExpenseCategoriesPage /> },

      // Shifts
      { path: 'shifts',             element: <ShiftsPage /> },

      // Employees
      { path: 'employees',          element: <EmployeesPage /> },

      // Settings
      { path: 'settings',           element: <SettingsPage /> },
      { path: 'users',              element: <UsersPage /> },
      { path: 'warehouses',         element: <WarehousesPage /> },
      { path: 'payment-methods',    element: <WarehousesPage /> },
      { path: 'audit-logs',         element: <AuditLogPage /> },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
])

export default router