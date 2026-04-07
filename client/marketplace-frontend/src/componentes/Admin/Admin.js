import React, { useState, useEffect, useCallback } from "react";
import "./Admin.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import servicioAdmin from "../../services/adminService";
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
  Zap
} from 'lucide-react';

// Import local components
import AdminDashboard from "./AdminDashboard";
import AdminUsuarios from "./AdminUsuarios";
import AdminVendedores from "./AdminVendedores";
import AdminCategorias from "./AdminCategorias";
import AdminAuditoria from "./AdminAuditoria";
import { ModalCrearUsuario, ModalAsignarRol, ModalCategoria } from "./ModalesAdmin";

export default function Admin() {
  const navegar = useNavigate();
  const { logout: cerrarSesion } = useAuth();
  const { isDarkMode: esModoOscuro, toggleTheme: alternarTema } = useTheme();

  // ===== ESTADO GENERAL =====
  const [seccionActiva, setSeccionActiva] = useState("dashboard");
  const [notificacion, setNotificacion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  // ===== USUARIOS =====
  const [usuarios, setUsuarios] = useState([]);
  const [buscarUsuario, setBuscarUsuario] = useState("");
  const [mostrarModalUsuario, setMostrarModalUsuario] = useState(false);
  const [formularioUsuario, setFormularioUsuario] = useState({ nombre: "", email: "", password: "", role: "cliente" });
  const [mostrarModalRol, setMostrarModalRol] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [nuevoRol, setNuevoRol] = useState("");

  // ===== VENDEDORES =====
  const [vendedores, setVendedores] = useState([]);
  const [buscarVendedor, setBuscarVendedor] = useState("");

  // ===== CATEGORÍAS =====
  const [categorias, setCategorias] = useState([]);
  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [formularioCategoria, setFormularioCategoria] = useState({ nombre: "", descripcion: "" });

  // ===== AUDITORÍA =====
  const [registrosAuditoria, setRegistrosAuditoria] = useState([]);
  const [filtrosAuditoria, setFiltrosAuditoria] = useState({
    usuario: "",
    accion: "",
    entidad: "",
    fechaDesde: "",
    fechaHasta: "",
  });
  const [paginacionAuditoria, setPaginacionAuditoria] = useState({
    paginaActual: 1,
    totalPaginas: 1,
    total: 0,
  });

  // ===== NOTIFICACIONES =====
  const mostrarNotificacion = (mensaje, tipo = "success") => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3500);
  };

  // ===== CARGA DE DATOS =====
  const cargarUsuarios = useCallback(async () => {
    try {
      setCargando(true);
      const respuesta = await servicioAdmin.obtenerUsuarios();
      if (respuesta.success) setUsuarios(respuesta.data);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarVendedores = useCallback(async () => {
    try {
      setCargando(true);
      const respuesta = await servicioAdmin.obtenerVendedores();
      if (respuesta.success) setVendedores(respuesta.data);
    } catch (err) {
      console.error("Error al cargar vendedores:", err);
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarCategorias = useCallback(async () => {
    try {
      setCargando(true);
      const respuesta = await servicioAdmin.obtenerCategorias();
      if (respuesta.success) setCategorias(respuesta.data);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarAuditoria = useCallback(async (pagina = 1) => {
    try {
      setCargando(true);
      const respuesta = await servicioAdmin.obtenerRegistrosAuditoria({
        ...filtrosAuditoria,
        pagina,
        limite: 15,
      });
      if (respuesta.success) {
        setRegistrosAuditoria(respuesta.data);
        setPaginacionAuditoria({
          paginaActual: respuesta.currentPage,
          totalPaginas: respuesta.totalPages,
          total: respuesta.total,
        });
      }
    } catch (err) {
      console.error("Error al cargar auditoría:", err);
    } finally {
      setCargando(false);
    }
  }, [filtrosAuditoria]);

  useEffect(() => {
    switch (seccionActiva) {
      case "dashboard":
        // Dashboard loads its own data
        break;
      case "usuarios":
        cargarUsuarios();
        break;
      case "vendedores":
        cargarVendedores();
        break;
      case "categorias":
        cargarCategorias();
        break;
      case "auditoria":
        cargarAuditoria();
        break;
      default:
        break;
    }
  }, [seccionActiva, cargarUsuarios, cargarVendedores, cargarCategorias, cargarAuditoria]);

  // ===== ACCIONES: USUARIOS =====
  const manejarCrearUsuario = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await servicioAdmin.crearUsuario(formularioUsuario);
      if (respuesta.success) {
        mostrarNotificacion("Usuario creado exitosamente");
        setMostrarModalUsuario(false);
        setFormularioUsuario({ nombre: "", email: "", password: "", role: "cliente" });
        cargarUsuarios();
      }
    } catch (err) {
      mostrarNotificacion(err.response?.data?.message || "Error al crear usuario", "error");
    }
  };

  const manejarAsignarRol = async (e) => {
    e.preventDefault();
    if (!usuarioSeleccionado || !nuevoRol) return;
    try {
      const respuesta = await servicioAdmin.asignarRol(usuarioSeleccionado._id, nuevoRol);
      if (respuesta.success) {
        mostrarNotificacion(`Rol actualizado a "${nuevoRol}"`);
        setMostrarModalRol(false);
        setUsuarioSeleccionado(null);
        cargarUsuarios();
      }
    } catch (err) {
      mostrarNotificacion(err.response?.data?.message || "Error al asignar rol", "error");
    }
  };

  const manejarCambiarEstadoUsuario = async (idUsuario, estadoActual) => {
    try {
      const respuesta = await servicioAdmin.cambiarEstadoUsuario(idUsuario, !estadoActual);
      if (respuesta.success) {
        mostrarNotificacion(respuesta.message);
        cargarUsuarios();
      }
    } catch (err) {
      mostrarNotificacion("Error al cambiar estado", "error");
    }
  };

  // ===== ACCIONES: VENDEDORES =====
  const manejarAprobarVendedor = async (idVendedor) => {
    try {
      const respuesta = await servicioAdmin.aprobarVendedor(idVendedor);
      if (respuesta.success) {
        mostrarNotificacion("Vendedor aprobado");
        cargarVendedores();
      }
    } catch (err) {
      mostrarNotificacion("Error al aprobar vendedor", "error");
    }
  };

  const manejarSuspenderVendedor = async (idVendedor) => {
    if (!window.confirm("¿Seguro que deseas suspender a este vendedor?")) return;
    try {
      const respuesta = await servicioAdmin.suspenderVendedor(idVendedor);
      if (respuesta.success) {
        mostrarNotificacion("Vendedor suspendido");
        cargarVendedores();
      }
    } catch (err) {
      mostrarNotificacion("Error al suspender vendedor", "error");
    }
  };

  // ===== ACCIONES: CATEGORÍAS =====
  const manejarGuardarCategoria = async (e) => {
    e.preventDefault();
    try {
      if (categoriaEditando) {
        const respuesta = await servicioAdmin.actualizarCategoria(categoriaEditando._id, formularioCategoria);
        if (respuesta.success) {
          mostrarNotificacion("Categoría actualizada");
        }
      } else {
        const respuesta = await servicioAdmin.crearCategoria(formularioCategoria);
        if (respuesta.success) {
          mostrarNotificacion("Categoría creada");
        }
      }
      setMostrarModalCategoria(false);
      setCategoriaEditando(null);
      setFormularioCategoria({ nombre: "", descripcion: "" });
      cargarCategorias();
    } catch (err) {
      mostrarNotificacion(err.response?.data?.message || "Error al guardar categoría", "error");
    }
  };

  const manejarAlternarCategoria = async (idCategoria) => {
    try {
      const respuesta = await servicioAdmin.alternarCategoria(idCategoria);
      if (respuesta.success) {
        mostrarNotificacion(respuesta.message);
        cargarCategorias();
      }
    } catch (err) {
      mostrarNotificacion("Error al cambiar estado", "error");
    }
  };

  const manejarEliminarCategoria = async (idCategoria) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    try {
      const respuesta = await servicioAdmin.eliminarCategoria(idCategoria);
      if (respuesta.success) {
        mostrarNotificacion("Categoría eliminada");
        cargarCategorias();
      }
    } catch (err) {
      mostrarNotificacion("Error al eliminar categoría", "error");
    }
  };

  // ===== UTILIDADES =====
  const obtenerIniciales = (nombre) => {
    if (!nombre) return "?";
    return nombre.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "—";
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-CR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatearAccion = (accion) => {
    const mapa = {
      crear_usuario: "Crear usuario",
      desactivar_usuario: "Desactivar usuario",
      activar_usuario: "Activar usuario",
      asignar_rol: "Asignar rol",
      aprobar_vendedor: "Aprobar vendedor",
      suspender_vendedor: "Suspender vendedor",
      crear_categoria: "Crear categoría",
      editar_categoria: "Editar categoría",
      activar_categoria: "Activar categoría",
      desactivar_categoria: "Desactivar categoría",
      eliminar_categoria: "Eliminar categoría",
      cambio_estado: "Cambio de estado",
      aprobacion: "Aprobación",
      uso_cupon: "Uso de cupón",
      crear_producto: "Crear producto",
      eliminar_producto: "Eliminar producto",
      otro: "Otro",
    };
    return mapa[accion] || accion;
  };

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
  ];

  // ===== RENDER PRINCIPAL =====
  return (
    <div className={`contenedor-admin ${!esModoOscuro ? "modo-claro" : ""}`}>
      {/* Notificación */}
      {notificacion && (
        <div className={`notificacion-admin ${notificacion.tipo}`}>
          {notificacion.tipo === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />} 
          <span style={{ marginLeft: '8px' }}>{notificacion.mensaje}</span>
        </div>
      )}

      {/* Botón menú móvil */}
      <button className="boton-menu-movil" onClick={() => setMenuAbierto(!menuAbierto)}>
        {menuAbierto ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Barra lateral */}
      <aside className={`barra-lateral-admin ${menuAbierto ? "abierta" : ""}`}>
        <div className="marca-barra-lateral-admin">
          <Zap size={24} color="var(--admin-azul)" />
          <h2>Nexora Admin</h2>
        </div>

        <nav className="nav-admin">
          {elementosNav.map((elemento) => (
            <button
              key={elemento.clave}
              className={`item-nav-admin ${seccionActiva === elemento.clave ? "activo" : ""}`}
              onClick={() => {
                setSeccionActiva(elemento.clave);
                if (window.innerWidth <= 768) setMenuAbierto(false);
              }}
            >
              <span>{elemento.icono}</span>
              <span>{elemento.etiqueta}</span>
            </button>
          ))}
        </nav>

        <div className="pie-barra-lateral-admin">
          <button className="boton-tema-admin" onClick={alternarTema}>
            <span>{esModoOscuro ? <Sun size={18} /> : <Moon size={18} />}</span>
            <span>{esModoOscuro ? "Modo Claro" : "Modo Oscuro"}</span>
          </button>
          <button className="boton-cerrar-sesion-admin" onClick={manejarCerrarSesion}>
            <span><LogOut size={18} /></span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="principal-admin">
        {seccionActiva === "dashboard" && <AdminDashboard />}
        {seccionActiva === "usuarios" && (
          <AdminUsuarios
            usuarios={usuarios}
            buscarUsuario={buscarUsuario}
            setBuscarUsuario={setBuscarUsuario}
            setFormularioUsuario={setFormularioUsuario}
            setMostrarModalUsuario={setMostrarModalUsuario}
            cargando={cargando}
            setUsuarioSeleccionado={setUsuarioSeleccionado}
            setNuevoRol={setNuevoRol}
            setMostrarModalRol={setMostrarModalRol}
            manejarCambiarEstadoUsuario={manejarCambiarEstadoUsuario}
            obtenerIniciales={obtenerIniciales}
            formatearFecha={formatearFecha}
          />
        )}
        {seccionActiva === "vendedores" && (
          <AdminVendedores
            vendedores={vendedores}
            buscarVendedor={buscarVendedor}
            setBuscarVendedor={setBuscarVendedor}
            cargando={cargando}
            manejarAprobarVendedor={manejarAprobarVendedor}
            manejarSuspenderVendedor={manejarSuspenderVendedor}
            obtenerIniciales={obtenerIniciales}
            formatearFecha={formatearFecha}
          />
        )}
        {seccionActiva === "categorias" && (
          <AdminCategorias
            categorias={categorias}
            setCategoriaEditando={setCategoriaEditando}
            setFormularioCategoria={setFormularioCategoria}
            setMostrarModalCategoria={setMostrarModalCategoria}
            cargando={cargando}
            manejarAlternarCategoria={manejarAlternarCategoria}
            manejarEliminarCategoria={manejarEliminarCategoria}
            formatearFecha={formatearFecha}
          />
        )}
        {seccionActiva === "auditoria" && (
          <AdminAuditoria
            filtrosAuditoria={filtrosAuditoria}
            setFiltrosAuditoria={setFiltrosAuditoria}
            cargarAuditoria={cargarAuditoria}
            cargando={cargando}
            paginacionAuditoria={paginacionAuditoria}
            registrosAuditoria={registrosAuditoria}
            obtenerIniciales={obtenerIniciales}
            formatearAccion={formatearAccion}
            formatearFecha={formatearFecha}
          />
        )}
      </main>

      <ModalCrearUsuario
        mostrar={mostrarModalUsuario}
        cerrar={() => setMostrarModalUsuario(false)}
        formulario={formularioUsuario}
        setFormulario={setFormularioUsuario}
        manejarSubmit={manejarCrearUsuario}
      />

      <ModalAsignarRol
        mostrar={mostrarModalRol}
        cerrar={() => setMostrarModalRol(false)}
        usuarioSeleccionado={usuarioSeleccionado}
        nuevoRol={nuevoRol}
        setNuevoRol={setNuevoRol}
        manejarAsignarRol={manejarAsignarRol}
      />

      <ModalCategoria
        mostrar={mostrarModalCategoria}
        cerrar={() => setMostrarModalCategoria(false)}
        categoriaEditando={categoriaEditando}
        formularioCategoria={formularioCategoria}
        setFormularioCategoria={setFormularioCategoria}
        manejarGuardarCategoria={manejarGuardarCategoria}
      />
    </div>
  );
}
