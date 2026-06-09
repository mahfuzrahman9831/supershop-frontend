import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout          from '../components/layout/AppLayout'
import ProtectedRoute     from './ProtectedRoute'

// Auth
import LoginPage          from '../pages/auth/LoginPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'

// Dashboard
import DashboardPage      from '../pages/DashboardPage'

// POS (AppLayout ছাড়া — full screen)
import PosPage            from '../pages/pos/PosPage'
import SaleReturnPage     from '../pages/pos/SaleReturnPage'

// 16A
import BrandsPage         from '../pages/brands/BrandsPage'
import CategoriesPage     from '../pages/categories/CategoriesPage'
import UnitsPage          from '../pages/units/UnitsPage'
import SuppliersPage      from '../pages/suppliers/SuppliersPage'
import WarehousesPage     from '../pages/warehouses/WarehousesPage'

// 16B
import ProductsPage       from '../pages/products/ProductsPage'
import ProductFormPage    from '../pages/products/ProductFormPage'
import ProductDetailPage  from '../pages/products/ProductDetailPage'

// 16C
import StockOverviewPage  from '../pages/inventory/StockOverviewPage'
import OpeningStockPage   from '../pages/inventory/OpeningStockPage'
import StockAdjustPage    from '../pages/inventory/StockAdjustPage'
import StockMovementsPage from '../pages/inventory/StockMovementsPage'
import PurchaseListPage   from '../pages/purchases/PurchaseListPage'
import PurchaseCreatePage from '../pages/purchases/PurchaseCreatePage'

const router = createBrowserRouter([
  // ── Public ──────────────────────────────────────────────────
  { path: '/login',           element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },

  // ── POS (full screen, no sidebar) ───────────────────────────
  {
    path: '/pos',
    element: <ProtectedRoute><PosPage /></ProtectedRoute>,
  },

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

      // Sale Return (AppLayout এর ভেতরে)
      { path: 'sale-returns',       element: <SaleReturnPage /> },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
])

export default router