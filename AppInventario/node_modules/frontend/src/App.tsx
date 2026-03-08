import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Products from './pages/Products';
import Dashboard from './pages/Dashboard';
import Purchases from './pages/Purchases';
import Providers from './pages/Providers';

import Users from './pages/Users';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import RoleRoute from './components/RoleRoute';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Verificando sesión...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            
            <Route path="products" element={
              <RoleRoute allowedRoles={['ALMACEN', 'COMPRADOR']}><Products /></RoleRoute>
            } />
            
            <Route path="inventory" element={
              <RoleRoute allowedRoles={['ALMACEN']}><Inventory /></RoleRoute>
            } />
            
            <Route path="purchases" element={
              <RoleRoute allowedRoles={['COMPRADOR']}><Purchases /></RoleRoute>
            } />
            
            <Route path="providers" element={
              <RoleRoute allowedRoles={['COMPRADOR']}><Providers /></RoleRoute>
            } />
            
            <Route path="reports" element={
              <RoleRoute allowedRoles={['AUDITOR']}><Reports /></RoleRoute>
            } />
            
            <Route path="users" element={
              <RoleRoute allowedRoles={[]}><Users /></RoleRoute> // Only ADMIN can access
            } />
            
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
