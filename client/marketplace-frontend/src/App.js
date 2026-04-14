import React from "react";
import "./App.css";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import IniciarSesion from './componentes/Acceso/IniciarSesion/IniciarSesion';
import Registro from './componentes/Acceso/Registro/Registro';
import RecuperarPassword from './componentes/Acceso/RecuperarPassword/RecuperarPassword';
import Principal from "./componentes/Principal/Principal";
import VistaProducto from "./componentes/VistaProducto/VistaProducto";
import Carrito from "./componentes/PasarelaDePago/Carrito/Carrito";
import PasarelaDePago from "./componentes/PasarelaDePago/PasarelaDePago/PasarelaDePago";
import Vendedor from "./componentes/Vendedor/Vendedor/Vendedor";
import Administrador from "./componentes/Administrador/Administrador/Administrador";
import Soporte from "./componentes/Soporte/Soporte/Soporte";
import Mascota from "./componentes/MascotaNexo/MascotaNexo";
import PerfilCliente from './componentes/Perfil/PerfilCliente/PerfilCliente';
import Rastreo from "./componentes/Rastreo/Rastreo/Rastreo";
import RuletaPrimeraCompra from "./componentes/RuletaPrimeraCompra/RuletaPrimeraCompra";
import ResetPassword from './componentes/Acceso/ReseteoPassword/ReseteoPassword';

import { useAuth } from "./context/AuthContext";

// ⭐ función para redirigir por rol
const obtenerRutaPorRol = (rol) => {
  switch (rol) {
    case "administrador":
      return "/administrador/dashboard";
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

  // Si el usuario es administrador, redirigir al panel administrador
  if (user && user.role === "administrador") {
    return <Navigate to="/administrador/dashboard" replace />;
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
        {/* 🔑 Rutas Públicas */}
        <Route path="/login" element={<IniciarSesion />} />
        <Route path="/register" element={<Registro />} />
        <Route path="/forgot-password" element={<RecuperarPassword />} />
        <Route path="/ReseteoPassword/:token" element={<ResetPassword />} />

        <Route path="/product/:id" element={<VistaProducto />} />

        <Route path="/rastreo/:orderId" element={<Rastreo />} />

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
          path="/administrador/dashboard"
          element={
            <RutaProtegida rolesPermitidos={["administrador"]}>
              <Administrador />
            </RutaProtegida>
          }
        />

        {/* ⭐ Redirigir /administrador a /administrador/dashboard */}
        <Route
          path="/administrador"
          element={<Navigate to="/administrador/dashboard" replace />}
        />

        <Route
          path="/vendedor"
          element={
            <RutaProtegida rolesPermitidos={["vendedor"]}>
              <Vendedor />
            </RutaProtegida>
          }
        />

        <Route
          path="/soporte"
          element={
            <RutaProtegida rolesPermitidos={["soporte"]}>
              <Soporte />
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
          path="/carrito"
          element={
            <RutaProtegida>
              <Carrito />
            </RutaProtegida>
          }
        />

        <Route
          path="/pasarela-pago"
          element={
            <RutaProtegida>
              <PasarelaDePago />
            </RutaProtegida>
          }
        />

        {/* ⭐ ruta raíz inteligente — redirige según rol */}
        <Route path="/" element={<RutaRaiz />} />

        {/* ⭐ fallback */}
        <Route path="*" element={<RutaRaiz />} />
      </Routes>

      {/*  DEJAR SIEMPRE FUERA DE </Routes> */}
      <Mascota />
    </div>
  );
}

export default App;

