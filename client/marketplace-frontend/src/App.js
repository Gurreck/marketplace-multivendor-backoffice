import React from "react";
import "./App.css";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Login from "./componentes/inicio/login";
import Register from "./componentes/inicio/register";
import ForgotPassword from "./componentes/inicio/forgot_Password";
import Principal from "./componentes/pages/page";
import PageViewProduct from "./componentes/pageViewProduct/pageViewProduct";
import PagePay from "./componentes/pagePay/pagePay";
import PaymentGateway from "./componentes/pagePay/paymentGateway";
import PageVendedor from "./componentes/pageVendedor/pageVendedor";
import Mascota from "./componentes/MascotaNexo/MascotaNexo";

import { useAuth } from "./context/AuthContext";

// 🔐 Componente para proteger rutas
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Cargando...</div>;

  // Si no hay usuario
  if (!user) {
    // si ya está en "/", permitir acceso
    if (location.pathname === "/") {
      return children;
    }

        return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to={getDashboardByRole(user.role)} replace />;

  return children;
};

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="Aplicacion">
      <Routes>

        {/* ⭐ rutas públicas */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/product/:id"
          element={
              <PageViewProduct />
          }
        />


        {/* ⭐ rutas protegidas */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["administrador"]}>
              <Principal />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vendedor"
          element={
            <ProtectedRoute allowedRoles={["vendedor"]}>
              <PageVendedor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cliente"
          element={
            <ProtectedRoute allowedRoles={["cliente"]}>
              <Principal />
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

        <Route
          path="/paymentGateway"
          element={
            <ProtectedRoute>
              <PaymentGateway />
            </ProtectedRoute>
          }
        />

        {/* ⭐ ruta raiz inteligente */}
        <Route
          path="/"
          element={<Principal />}
        />

        {/* ⭐ fallback */}
        <Route
          path="*"
          element={<Principal />}
        />
      </Routes>

      {/*  DEJAR SIEMPRE FUERA DE </Routes> */}
      <Mascota />
    </div>
  );
}

// ⭐ función para redirigir por rol
const getDashboardByRole = (role) => {
  switch (role) {
    case "administrador":
      return "/admin/dashboard";
    case "vendedor":
      return "/vendedor";
    case "cliente":
      return "/cliente";
    default:
      return "/";
  }
};


export default App;