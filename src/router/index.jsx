import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout          from '../components/layout/AppLayout'
import ProtectedRoute     from './ProtectedRoute'

// Auth
import LoginPage          from '../pages/auth/LoginPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'

// Dashboard
import DashboardPage      from '../pages/DashboardPage'

// Phase 16A — Catalog
import BrandsPage         from '../pages/brands/BrandsPage'
import CategoriesPage     from '../pages/categories/CategoriesPage'
import UnitsPage          from '../pages/units/UnitsPage'
import SuppliersPage      from '../pages/suppliers/SuppliersPage'
import WarehousesPage     from '../pages/warehouses/WarehousesPage'

// Phase 16B/C — আসছে
// import ProductsPage    from '../pages/products/ProductsPage'
// import StockPage       from '../pages/inventory/StockOverviewPage'
// import PurchasesPage   from '../pages/purchases/PurchaseListPage'

const router = createBrowserRouter([
  // ── Public ──────────────────────────────────────────────────
  { path: '/login',           element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },

  // ── Protected ────────────────────────────────────────────────
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true,              element: <DashboardPage /> },

      // Catalog
      { path: 'brands',           element: <BrandsPage /> },
      { path: 'categories',       element: <CategoriesPage /> },
      { path: 'units',            element: <UnitsPage /> },
      { path: 'suppliers',        element: <SuppliersPage /> },
      { path: 'warehouses',       element: <WarehousesPage /> },

      // Phase 16B/C এ যোগ হবে
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
])

export default router