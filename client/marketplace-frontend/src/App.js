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
import PaginaAdmin from "./componentes/pageAdmin/pageAdmin";
import PaginaSoporte from "./componentes/pageSoporte/pageSoporte";
import Mascota from "./componentes/MascotaNexo/MascotaNexo";
import PerfilCliente from "./componentes/perfil/PerfilCliente";
import Tracking from "./componentes/Tracking/tracking";
import RuletaPrimeraCompra from "./componentes/RuletaPrimeraCompra/RuletaPrimeraCompra";

import { useAuth } from "./context/AuthContext";

// ⭐ función para redirigir por rol
const obtenerRutaPorRol = (rol) => {
  switch (rol) {
    case "administrador":
      return "/admin/dashboard";
    case "vendedor":
      return "/vendedor";
    case "soporte":
      return "/soporte";
    case "cliente":
      return "/cliente";
    default:
      return "/";
  }
};

// 🔐 Componente para proteger rutas
const RutaProtegida = ({ children, rolesPermitidos }) => {
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

  if (rolesPermitidos && !rolesPermitidos.includes(user.role))
    return <Navigate to={obtenerRutaPorRol(user.role)} replace />;

  return children;
};

// ⭐ Componente inteligente para la ruta raíz
const RutaRaiz = () => {
  const { user } = useAuth();

  // Si el usuario es administrador, redirigir al panel admin
  if (user && user.role === "administrador") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Si es vendedor, redirigir a su panel
  if (user && user.role === "vendedor") {
    return <Navigate to="/vendedor" replace />;
  }

  // Si es soporte, redirigir a su panel
  if (user && user.role === "soporte") {
    return <Navigate to="/soporte" replace />;
  }

  // Para clientes o visitantes, mostrar la página principal
  return <Principal />;
};

function App() {
  const { loading } = useAuth();

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

        <Route
          path="/rastreo"
          element={<Tracking />}
        />

        <Route
          path="/ruleta"
          element={
            <RutaProtegida rolesPermitidos={["cliente"]}>
              <RuletaPrimeraCompra />
            </RutaProtegida>
          }
        />


        {/* ⭐ rutas protegidas - Administrador */}
        <Route
          path="/admin/dashboard"
          element={
            <RutaProtegida rolesPermitidos={["administrador"]}>
              <PaginaAdmin />
            </RutaProtegida>
          }
        />

        {/* ⭐ Redirigir /admin a /admin/dashboard */}
        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        <Route
          path="/vendedor"
          element={
            <RutaProtegida rolesPermitidos={["vendedor"]}>
              <PageVendedor />
            </RutaProtegida>
          }
        />

        <Route
          path="/soporte"
          element={
            <RutaProtegida rolesPermitidos={["soporte"]}>
              <PaginaSoporte />
            </RutaProtegida>
          }
        />

        <Route
          path="/cliente"
          element={
            <RutaProtegida rolesPermitidos={["cliente"]}>
              <Principal />
            </RutaProtegida>
          }
        />

        <Route
          path="/cliente/perfil/*"
          element={
            <RutaProtegida rolesPermitidos={["cliente"]}>
              <PerfilCliente />
            </RutaProtegida>
          }
        />

        <Route
          path="/checkout"
          element={
            <RutaProtegida>
              <PagePay />
            </RutaProtegida>
          }
        />

        <Route
          path="/paymentGateway"
          element={
            <RutaProtegida>
              <PaymentGateway />
            </RutaProtegida>
          }
        />

        {/* ⭐ ruta raíz inteligente — redirige según rol */}
        <Route
          path="/"
          element={<RutaRaiz />}
        />

        {/* ⭐ fallback */}
        <Route
          path="*"
          element={<RutaRaiz />}
        />
      </Routes>

      {/*  DEJAR SIEMPRE FUERA DE </Routes> */}
      <Mascota />
    </div>
  );
}

export default App;