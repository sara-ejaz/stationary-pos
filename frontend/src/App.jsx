import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import { AppLayout } from './components/layout/AppLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SessionExpiredPage } from './pages/auth/SessionExpiredPage';
import { AccessDeniedPage } from './pages/auth/AccessDeniedPage';

// Module Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { CategoriesPage } from './pages/catalog/CategoriesPage';
import { BooksPage } from './pages/catalog/BooksPage';
import { StationeryPage } from './pages/catalog/StationeryPage';
import { BarcodeLookupPage } from './pages/catalog/BarcodeLookupPage';
import { SuppliersPage } from './pages/purchasing/SuppliersPage';
import { PurchasesPage } from './pages/purchasing/PurchasesPage';
import { PurchaseReturnsPage } from './pages/purchasing/PurchaseReturnsPage';
import { InventoryPage } from './pages/inventory/InventoryPage';
import { StockAlertsPage } from './pages/inventory/StockAlertsPage';
import { StockHistoryPage } from './pages/stock-history/StockHistoryPage';
import { PosPage } from './pages/pos/PosPage';
import { SalesReturnsPage } from './pages/returns/SalesReturnsPage';
import { TransactionsPage } from './pages/transactions/TransactionsPage';
import { SalesReportsPage } from './pages/reports/SalesReportsPage';
import { InventoryReportsPage } from './pages/reports/InventoryReportsPage';
import { PurchaseReportsPage } from './pages/reports/PurchaseReportsPage';
import { StaffPage } from './pages/admin/StaffPage';
import { BackupPage } from './pages/admin/BackupPage';
import { AuditPage } from './pages/admin/AuditPage';
import { SettingsPage } from './pages/settings/SettingsPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isSessionExpired, role } = useAuth();

  if (isSessionExpired) {
    return <Navigate to="/session-expired" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};

export const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <StoreProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/session-expired" element={<SessionExpiredPage />} />
                <Route path="/access-denied" element={<AccessDeniedPage />} />

                {/* Main Authenticated Layout */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Module A: Overview Dashboard */}
                  <Route index element={<DashboardPage />} />

                  {/* Module J & K: Point of Sale Counter */}
                  <Route
                    path="pos"
                    element={
                      <ProtectedRoute allowedRoles={['Admin', 'Cashier']}>
                        <PosPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catalog Modules */}
                  <Route path="catalog">
                    <Route
                      path="categories"
                      element={
                        <ProtectedRoute allowedRoles={['Admin', 'Inventory Staff']}>
                          <CategoriesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="books" element={<BooksPage />} />
                    <Route path="stationery" element={<StationeryPage />} />
                    <Route path="barcode-lookup" element={<BarcodeLookupPage />} />
                  </Route>

                  {/* Inventory Modules */}
                  <Route path="inventory">
                    <Route
                      index
                      element={
                        <ProtectedRoute allowedRoles={['Admin', 'Inventory Staff']}>
                          <InventoryPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="alerts"
                      element={
                        <ProtectedRoute allowedRoles={['Admin', 'Inventory Staff']}>
                          <StockAlertsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="history"
                      element={
                        <ProtectedRoute allowedRoles={['Admin', 'Inventory Staff']}>
                          <StockHistoryPage />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  {/* Purchasing Modules */}
                  <Route path="purchasing">
                    <Route
                      path="orders"
                      element={
                        <ProtectedRoute allowedRoles={['Admin', 'Inventory Staff']}>
                          <PurchasesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="suppliers"
                      element={
                        <ProtectedRoute allowedRoles={['Admin', 'Inventory Staff']}>
                          <SuppliersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="returns"
                      element={
                        <ProtectedRoute allowedRoles={['Admin', 'Inventory Staff']}>
                          <PurchaseReturnsPage />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  {/* Sales & Returns */}
                  <Route path="transactions" element={<TransactionsPage />} />
                  <Route
                    path="returns/sales"
                    element={
                      <ProtectedRoute allowedRoles={['Admin', 'Cashier']}>
                        <SalesReturnsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Reports Modules */}
                  <Route path="reports">
                    <Route
                      path="sales"
                      element={
                        <ProtectedRoute allowedRoles={['Admin']}>
                          <SalesReportsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="inventory"
                      element={
                        <ProtectedRoute allowedRoles={['Admin', 'Inventory Staff']}>
                          <InventoryReportsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="purchases"
                      element={
                        <ProtectedRoute allowedRoles={['Admin']}>
                          <PurchaseReportsPage />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  {/* Administration Modules */}
                  <Route path="admin">
                    <Route
                      path="staff"
                      element={
                        <ProtectedRoute allowedRoles={['Admin']}>
                          <StaffPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="backup"
                      element={
                        <ProtectedRoute allowedRoles={['Admin']}>
                          <BackupPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="audit"
                      element={
                        <ProtectedRoute allowedRoles={['Admin']}>
                          <AuditPage />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  {/* Settings Module */}
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </StoreProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
