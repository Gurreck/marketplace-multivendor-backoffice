import React from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './componentes/inicio/login';
import Register from './componentes/inicio/register';
import ForgotPassword from './componentes/inicio/forgot_Password';
import Principal from './componentes/pages/page';
import PageViewProduct from './componentes/pageViewProduct/pageViewProduct';
import PageVendedor from './componentes/pageVendedor/pageVendedor';
import PagePay from './componentes/pagePay/pagePay';
import { useAuth } from './context/AuthContext';


// Componente para proteger rutas por rol
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <div className="App">
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to={getDashboardByRole(user.role)} replace />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={getDashboardByRole(user.role)} replace />} />
        <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to={getDashboardByRole(user.role)} replace />} />

        {/* Rutas protegidas por rol */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['administrador']}>
              <Principal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendedor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['vendedor']}>
              <PageVendedor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente/dashboard"
          element={
            <ProtectedRoute allowedRoles={['cliente']}>
              <Principal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product/:id"
          element={
            <ProtectedRoute>
              <PageViewProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <PagePay />
            </ProtectedRoute>
          }
        />

        {/* Ruta por defecto */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

// Función auxiliar para obtener el dashboard según el rol
const getDashboardByRole = (role) => {
  switch (role) {
    case 'administrador':
      return '/admin/dashboard';
    case 'vendedor':
      return '/vendedor/dashboard';
    case 'cliente':
      return '/cliente/dashboard';
    default:
      return '/login';
  }
};

export default App;