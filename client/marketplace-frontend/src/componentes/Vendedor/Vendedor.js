import React from "react";
import "./Vendedor.css";
import "./useVendedorData.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  X,
  CheckCircle2,
  Moon,
  Sun,
  LogOut,
  Menu,
  XCircle,
  User,
} from "lucide-react";
import PerfilVendedor from "../Perfil/PerfilVendedor";

// Sub-componentes
import VendedorDashboard from "./VendedorDashboard";
import VendedorProductos from "./VendedorProductos";
import VendedorOrdenesLista from "./VendedorOrdenesLista";
import VendedorDetalleOrden from "./VendedorDetalleOrden";
import { ModalesVendedor } from "./ModalesVendedor";

// Custom hook con toda la lógica
import useVendedorData from "./useVendedorData";

export default function Vendedor() {
  const navegar = useNavigate();
  const { logout: cerrarSesion, user } = useAuth();
  const { isDarkMode: esModoOscuro, toggleTheme: alternarTema } = useTheme();
  const data = useVendedorData();

  const manejarCerrarSesion = () => {
    cerrarSesion();
    navegar("/");
  };

  const elementosNav = [
    { clave: "perfil", icono: <User size={20} />, etiqueta: "Perfil" },
    { clave: "dashboard", icono: <LayoutDashboard size={20} />, etiqueta: "Dashboard" },
    { clave: "productos", icono: <Package size={20} />, etiqueta: "Productos" },
    { clave: "ordenes", icono: <ShoppingCart size={20} />, etiqueta: "Órdenes" },
  ];

  return (
    <div className={`contenedor-vend ${!esModoOscuro ? "modo-claro" : ""}`}>
      {/* Notificación */}
      {data.notificacion && (
        <div className={`notificacion-vend ${data.notificacion.tipo}`}>
          {data.notificacion.tipo === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          <span>{data.notificacion.mensaje}</span>
        </div>
      )}

      {/* Botón menú móvil */}
      <button className="boton-menu-movil-vend" onClick={() => data.setMenuAbierto(!data.menuAbierto)}>
        {data.menuAbierto ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Barra lateral */}
      <aside className={`barra-lateral-vend ${data.menuAbierto ? "abierta" : ""}`}>
        <div className="perfil-sidebar-vend">
          <img
            src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre || user?.email || "V")}&background=0ea5e9&color=fff`}
            alt="Perfil"
            className="avatar-sidebar-vend"
          />
          <div className="info-usuario-sidebar-vend">
            <span className="nombre-usuario-sidebar-vend">
              {user?.nombre || user?.email?.split("@")[0]}
            </span>
            <span className="email-usuario-sidebar-vend">
              {user?.email}
            </span>
          </div>
        </div>

        <nav className="nav-vend">
          {elementosNav.map((elemento) => (
            <button
              key={elemento.clave}
              className={`item-nav-vend ${data.seccionActiva === elemento.clave || (data.seccionActiva === "detalleOrden" && elemento.clave === "ordenes") ? "activo" : ""}`}
              onClick={() => {
                data.setSeccionActiva(elemento.clave);
                if (window.innerWidth <= 768) data.setMenuAbierto(false);
              }}
            >
              <span>{elemento.icono}</span>
              <span>{elemento.etiqueta}</span>
            </button>
          ))}
        </nav>

        <div className="pie-barra-lateral-vend">
          <button className="boton-tema-vend" onClick={alternarTema}>
            <span>{esModoOscuro ? <Sun size={18} /> : <Moon size={18} />}</span>
            <span>{esModoOscuro ? "Modo Claro" : "Modo Oscuro"}</span>
          </button>
          <button className="boton-cerrar-sesion-vend" onClick={manejarCerrarSesion}>
            <span><LogOut size={18} /></span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="principal-vend">
        {data.seccionActiva === "perfil" && <PerfilVendedor />}
        {data.seccionActiva === "dashboard" && (
          <VendedorDashboard
            kpis={data.kpis} cargando={data.cargando} stockThreshold={data.stockThreshold}
            etiquetasEstado={data.etiquetasEstado} getStatusColor={data.getStatusColor}
            ordenes={data.ordenes} verDetalleOrden={data.verDetalleOrden} formatearFecha={data.formatearFecha}
          />
        )}
        {data.seccionActiva === "productos" && (
          <VendedorProductos
            filteredProducts={data.filteredProducts} searchTerm={data.searchTerm} setSearchTerm={data.setSearchTerm}
            filterStatus={data.filterStatus} setFilterStatus={data.setFilterStatus}
            selectedCategory={data.selectedCategory} setSelectedCategory={data.setSelectedCategory}
            categories={data.categories} stockThreshold={data.stockThreshold} setStockThreshold={data.setStockThreshold}
            openAddModal={data.openAddModal} cargando={data.cargando}
            handleUpdateStock={data.handleUpdateStock} openEditModal={data.openEditModal}
            handleToggleProduct={data.handleToggleProduct} handleDelete={data.handleDelete}
          />
        )}
        {data.seccionActiva === "ordenes" && (
          <VendedorOrdenesLista
            ordenesFiltradas={data.ordenesFiltradas} filtroEstadoOrden={data.filtroEstadoOrden}
            setFiltroEstadoOrden={data.setFiltroEstadoOrden} cargarOrdenes={data.cargarOrdenes}
            cargando={data.cargando} getStatusColor={data.getStatusColor}
            etiquetasEstado={data.etiquetasEstado} formatearFecha={data.formatearFecha}
            verDetalleOrden={data.verDetalleOrden}
          />
        )}
        {data.seccionActiva === "detalleOrden" && (
          <VendedorDetalleOrden
            orden={data.ordenSeleccionada} setSeccionActiva={data.setSeccionActiva}
            formatearFecha={data.formatearFecha} getStatusColor={data.getStatusColor}
            etiquetasEstado={data.etiquetasEstado} estadosOrden={data.estadosOrden}
            historialOrden={data.historialOrden}
          />
        )}
      </main>

      <ModalesVendedor
        isModalOpen={data.isModalOpen} setIsModalOpen={data.setIsModalOpen}
        editingProduct={data.editingProduct} handleSubmit={data.handleSubmit}
        formData={data.formData} handleInputChange={data.handleInputChange}
        categories={data.categories} existingImages={data.existingImages}
        removeExistingImage={data.removeExistingImage} imagePreviews={data.imagePreviews}
        removeNewImage={data.removeNewImage} handleFileSelect={data.handleFileSelect}
      />
    </div>
  );
}
