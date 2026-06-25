/**
 * ⚠️ ROUTING RULES:
 * - Do NOT add <BrowserRouter> here — it's in main.tsx
 * - Define routes using <Routes> and <Route> ONLY
 * - NEVER use useRoutes()
 * - Static imports only — no React.lazy()
 */

import { Routes, Route } from 'react-router';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import ProductFormPage from '@/pages/ProductFormPage';
import ProductionOrders from '@/pages/ProductionOrders';
import ProductionOrderFormPage from '@/pages/ProductionOrderFormPage';
import OpsEnviadas from '@/pages/OpsEnviadas';
import ProductionCalendar from '@/pages/ProductionCalendar';
import Fabrics from '@/pages/Fabrics';
import FabricFormPage from '@/pages/FabricFormPage';
import Trims from '@/pages/Trims';
import TrimFormPage from '@/pages/TrimFormPage';
import Workshops from '@/pages/Workshops';
import WorkshopFormPage from '@/pages/WorkshopFormPage';
import Suppliers from '@/pages/Suppliers';
import SupplierFormPage from '@/pages/SupplierFormPage';
import Collections from '@/pages/Collections';
import CollectionFormPage from '@/pages/CollectionFormPage';
import TechnicalSheets from '@/pages/TechnicalSheets';
import TechnicalSheetFormPage from '@/pages/TechnicalSheetFormPage';
import FabricCalculator from '@/pages/FabricCalculator';
import Stock from '@/pages/Stock';
import StockMovementFormPage from '@/pages/StockMovementFormPage';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import DeletionHistory from '@/pages/DeletionHistory';
import PublicOpView from '@/pages/PublicOpView';

export default function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Routes>
        {/* Página pública para oficina acessar OP */}
        <Route path="/op/:token" element={<PublicOpView />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/produtos" element={<Products />} />
          <Route path="/produtos/novo" element={<ProductFormPage />} />
          <Route path="/produtos/:id/editar" element={<ProductFormPage />} />
          <Route path="/ordens" element={<ProductionOrders />} />
          <Route path="/ordens/nova" element={<ProductionOrderFormPage />} />
          <Route path="/ordens/:id/editar" element={<ProductionOrderFormPage />} />
          <Route path="/ops-enviadas" element={<OpsEnviadas />} />
          <Route path="/calendario" element={<ProductionCalendar />} />
          <Route path="/tecidos" element={<Fabrics />} />
          <Route path="/tecidos/novo" element={<FabricFormPage />} />
          <Route path="/tecidos/:id/editar" element={<FabricFormPage />} />
          <Route path="/aviamentos" element={<Trims />} />
          <Route path="/aviamentos/novo" element={<TrimFormPage />} />
          <Route path="/aviamentos/:id/editar" element={<TrimFormPage />} />
          <Route path="/oficinas" element={<Workshops />} />
          <Route path="/oficinas/nova" element={<WorkshopFormPage />} />
          <Route path="/oficinas/:id/editar" element={<WorkshopFormPage />} />
          <Route path="/fornecedores" element={<Suppliers />} />
          <Route path="/fornecedores/novo" element={<SupplierFormPage />} />
          <Route path="/fornecedores/:id/editar" element={<SupplierFormPage />} />
          <Route path="/colecoes" element={<Collections />} />
          <Route path="/colecoes/nova" element={<CollectionFormPage />} />
          <Route path="/colecoes/:id/editar" element={<CollectionFormPage />} />
          <Route path="/fichas-tecnicas" element={<TechnicalSheets />} />
          <Route path="/fichas-tecnicas/nova" element={<TechnicalSheetFormPage />} />
          <Route path="/fichas-tecnicas/:id/editar" element={<TechnicalSheetFormPage />} />
          <Route path="/calculadora" element={<FabricCalculator />} />
          <Route path="/estoque" element={<Stock />} />
          <Route path="/estoque/nova" element={<StockMovementFormPage />} />
          <Route path="/estoque/:id/editar" element={<StockMovementFormPage />} />
          <Route path="/relatorios" element={<Reports />} />
          <Route path="/configuracoes" element={<Settings />} />
          <Route path="/historico-exclusoes" element={<DeletionHistory />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
