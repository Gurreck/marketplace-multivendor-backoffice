import React from "react";
import "./Administrador.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Tag, 
  ClipboardList, 
  Moon, 
  Sun, 
  LogOut, 
  Menu,
  X,
  CheckCircle2,
  XCircle,
  Zap,
  FileBarChart,
  Ticket
} from 'lucide-react';

// Import local components
import MisTickets from '../../MisTickets/MisTickets';
import AdministradorDashboard from '../AdministradorDashboard/AdministradorDashboard';
import AdministradorUsuarios from '../AdministradorUsuarios/AdministradorUsuarios';
import AdministradorVendedores from '../AdministradorVendedores/AdministradorVendedores';
import AdministradorCategorias from '../AdministradorCategorias/AdministradorCategorias';
import AdministradorAuditoria from '../AdministradorAuditoria/AdministradorAuditoria';
import AdministradorReportes from '../AdministradorReportes/AdministradorReportes';
import { ModalCrearUsuario, ModalAsignarRol, ModalCategoria } from '../ModalesAdministrador/ModalesAdministrador';
import useAdministradorData from '../useAdministradorData/useAdministradorData';

export default function Administrador() {
  const navegar = useNavigate();
  const { logout: cerrarSesion } = useAuth();
  const { isDarkMode: esModoOscuro, toggleTheme: alternarTema } = useTheme();

  const datos = useAdministradorData();

  const manejarCerrarSesion = () => {
    cerrarSesion();
    navegar("/");
  };

  // ===== SECCIONES DE NAVEGACIÓN =====
  const elementosNav = [
    { clave: "dashboard", icono: <LayoutDashboard size={20} />, etiqueta: "Dashboard" },
    { clave: "usuarios", icono: <Users size={20} />, etiqueta: "Usuarios" },
    { clave: "vendedores", icono: <Store size={20} />, etiqueta: "Vendedores" },
    { clave: "categorias", icono: <Tag size={20} />, etiqueta: "Categorías" },
    { clave: "auditoria", icono: <ClipboardList size={20} />, etiqueta: "Auditoría" },
    { clave: "reportes", icono: <FileBarChart size={20} />, etiqueta: "Reportes" },
    { clave: "tickets", icono: <Ticket size={20} />, etiqueta: "Tickets" },
  ];

  // ===== RENDER PRINCIPAL =====
  return (
    <div className={`contenedor-administrador ${!esModoOscuro ? "modo-claro" : ""}`}>
      {/* Notificación */}
      {datos.notificacion && (
        <div className={`notificacion-administrador ${datos.notificacion.tipo}`}>
          {datos.notificacion.tipo === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />} 
          <span style={{ marginLeft: '8px' }}>{datos.notificacion.mensaje}</span>
        </div>
      )}

      {/* Botón menú móvil */}
      <button className="boton-menu-movil" onClick={() => datos.setMenuAbierto(!datos.menuAbierto)}>
        {datos.menuAbierto ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Barra lateral */}
      <aside className={`barra-lateral-administrador ${datos.menuAbierto ? "abierta" : ""}`}>
        <div className="marca-barra-lateral-administrador">
          <Zap size={24} color="var(--administrador-azul)" />
          <h2>Nexora Administrador</h2>
        </div>

        <nav className="nav-administrador">
          {elementosNav.map((elemento) => (
            <button
              key={elemento.clave}
              className={`item-nav-administrador ${datos.seccionActiva === elemento.clave ? "activo" : ""}`}
              onClick={() => {
                datos.setSeccionActiva(elemento.clave);
                if (window.innerWidth <= 768) datos.setMenuAbierto(false);
              }}
            >
              <span>{elemento.icono}</span>
              <span>{elemento.etiqueta}</span>
            </button>
          ))}
        </nav>

        <div className="pie-barra-lateral-administrador">
          <button className="boton-tema-administrador" onClick={alternarTema}>
            <span>{esModoOscuro ? <Sun size={18} /> : <Moon size={18} />}</span>
            <span>{esModoOscuro ? "Modo Claro" : "Modo Oscuro"}</span>
          </button>
          <button className="boton-cerrar-sesion-administrador" onClick={manejarCerrarSesion}>
            <span><LogOut size={18} /></span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="principal-administrador">
        {datos.seccionActiva === "dashboard" && <AdministradorDashboard />}
        {datos.seccionActiva === "usuarios" && (
          <AdministradorUsuarios
            usuarios={datos.usuarios}
            buscarUsuario={datos.buscarUsuario}
            setBuscarUsuario={datos.setBuscarUsuario}
            setFormularioUsuario={datos.setFormularioUsuario}
            setMostrarModalUsuario={datos.setMostrarModalUsuario}
            setUsuarioEditando={datos.setUsuarioEditando}
            cargando={datos.cargando}
            setUsuarioSeleccionado={datos.setUsuarioSeleccionado}
            setNuevoRol={datos.setNuevoRol}
            setMostrarModalRol={datos.setMostrarModalRol}
            manejarCambiarEstadoUsuario={datos.manejarCambiarEstadoUsuario}
            manejarEliminarUsuario={datos.manejarEliminarUsuario}
            obtenerIniciales={datos.obtenerIniciales}
            formatearFecha={datos.formatearFecha}
          />
        )}
        {datos.seccionActiva === "vendedores" && (
          <AdministradorVendedores
            vendedores={datos.vendedores}
            buscarVendedor={datos.buscarVendedor}
            setBuscarVendedor={datos.setBuscarVendedor}
            cargando={datos.cargando}
            manejarAprobarVendedor={datos.manejarAprobarVendedor}
            manejarSuspenderVendedor={datos.manejarSuspenderVendedor}
            obtenerIniciales={datos.obtenerIniciales}
            formatearFecha={datos.formatearFecha}
          />
        )}
        {datos.seccionActiva === "categorias" && (
          <AdministradorCategorias
            categorias={datos.categorias}
            setCategoriaEditando={datos.setCategoriaEditando}
            setFormularioCategoria={datos.setFormularioCategoria}
            setMostrarModalCategoria={datos.setMostrarModalCategoria}
            cargando={datos.cargando}
            manejarAlternarCategoria={datos.manejarAlternarCategoria}
            manejarEliminarCategoria={datos.manejarEliminarCategoria}
            formatearFecha={datos.formatearFecha}
          />
        )}
        {datos.seccionActiva === "auditoria" && (
          <AdministradorAuditoria
            filtrosAuditoria={datos.filtrosAuditoria}
            setFiltrosAuditoria={datos.setFiltrosAuditoria}
            cargarAuditoria={datos.cargarAuditoria}
            cargando={datos.cargando}
            paginacionAuditoria={datos.paginacionAuditoria}
            registrosAuditoria={datos.registrosAuditoria}
            obtenerIniciales={datos.obtenerIniciales}
            formatearAccion={datos.formatearAccion}
            formatearFecha={datos.formatearFecha}
          />
        )}
        {datos.seccionActiva === "reportes" && <AdministradorReportes />}
        {datos.seccionActiva === "tickets" && <MisTickets />}
      </main>

      <ModalCrearUsuario
        mostrar={datos.mostrarModalUsuario}
        cerrar={() => { datos.setMostrarModalUsuario(false); datos.setUsuarioEditando(null); }}
        formulario={datos.formularioUsuario}
        setFormulario={datos.setFormularioUsuario}
        manejarSubmit={datos.usuarioEditando ? datos.manejarEditarUsuario : datos.manejarCrearUsuario}
        editando={datos.usuarioEditando}
      />

      <ModalAsignarRol
        mostrar={datos.mostrarModalRol}
        cerrar={() => datos.setMostrarModalRol(false)}
        usuarioSeleccionado={datos.usuarioSeleccionado}
        nuevoRol={datos.nuevoRol}
        setNuevoRol={datos.setNuevoRol}
        manejarAsignarRol={datos.manejarAsignarRol}
      />

      <ModalCategoria
        mostrar={datos.mostrarModalCategoria}
        cerrar={() => datos.setMostrarModalCategoria(false)}
        categoriaEditando={datos.categoriaEditando}
        formularioCategoria={datos.formularioCategoria}
        setFormularioCategoria={datos.setFormularioCategoria}
        manejarGuardarCategoria={datos.manejarGuardarCategoria}
      />
    </div>
  );
}

