import { useState, useEffect, useCallback } from "react";
import servicioAdministrador from "../../../services/administradorService";
import useAdministradorUsuarios from '../useAdministradorUsuarios/useAdministradorUsuarios';

/**
 * Hook principal que compone useAdministradorUsuarios y maneja la lógica de
 * vendedores, categorías, auditoría y estado general del Administrador.
 */
export default function useAdministradorData() {
  // ===== ESTADO GENERAL =====
  const [seccionActiva, setSeccionActiva] = useState("dashboard");
  const [notificacion, setNotificacion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

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
    usuario: "", accion: "", entidad: "", fechaDesde: "", fechaHasta: "",
  });
  const [paginacionAuditoria, setPaginacionAuditoria] = useState({
    paginaActual: 1, totalPaginas: 1, total: 0,
  });

  // ===== NOTIFICACIONES =====
  const mostrarNotificacion = (mensaje, tipo = "success") => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3500);
  };

  // ===== HOOK COMPUESTO: USUARIOS =====
  const usuariosHook = useAdministradorUsuarios({ mostrarNotificacion, setCargando });

  // ===== CARGA DE DATOS =====
  const cargarVendedores = useCallback(async () => {
    try {
      setCargando(true);
      const respuesta = await servicioAdministrador.obtenerVendedores();
      if (respuesta.success) setVendedores(respuesta.data);
    } catch (err) { console.error("Error al cargar vendedores:", err); }
    finally { setCargando(false); }
  }, []);

  const cargarCategorias = useCallback(async () => {
    try {
      setCargando(true);
      const respuesta = await servicioAdministrador.obtenerCategorias();
      if (respuesta.success) setCategorias(respuesta.data);
    } catch (err) { console.error("Error al cargar categorías:", err); }
    finally { setCargando(false); }
  }, []);

  const cargarAuditoria = useCallback(async (pagina = 1) => {
    try {
      setCargando(true);
      const respuesta = await servicioAdministrador.obtenerRegistrosAuditoria({
        ...filtrosAuditoria, pagina, limite: 15,
      });
      if (respuesta.success) {
        setRegistrosAuditoria(respuesta.data);
        setPaginacionAuditoria({
          paginaActual: respuesta.currentPage,
          totalPaginas: respuesta.totalPages,
          total: respuesta.total,
        });
      }
    } catch (err) { console.error("Error al cargar auditoría:", err); }
    finally { setCargando(false); }
  }, [filtrosAuditoria]);

  useEffect(() => {
    switch (seccionActiva) {
      case "dashboard": break;
      case "usuarios": usuariosHook.cargarUsuarios(); break;
      case "vendedores": cargarVendedores(); break;
      case "categorias": cargarCategorias(); break;
      case "auditoria": cargarAuditoria(); break;
      default: break;
    }
  }, [seccionActiva, usuariosHook.cargarUsuarios, cargarVendedores, cargarCategorias, cargarAuditoria]);

  // ===== ACCIONES: VENDEDORES =====
  const manejarAprobarVendedor = async (idVendedor) => {
    try {
      const r = await servicioAdministrador.aprobarVendedor(idVendedor);
      if (r.success) { mostrarNotificacion("Vendedor aprobado"); cargarVendedores(); }
    } catch (err) { mostrarNotificacion("Error al aprobar vendedor", "error"); }
  };

  const manejarSuspenderVendedor = async (idVendedor) => {
    if (!window.confirm("¿Seguro que deseas suspender a este vendedor?")) return;
    try {
      const r = await servicioAdministrador.suspenderVendedor(idVendedor);
      if (r.success) { mostrarNotificacion("Vendedor suspendido"); cargarVendedores(); }
    } catch (err) { mostrarNotificacion("Error al suspender vendedor", "error"); }
  };

  // ===== ACCIONES: CATEGORÍAS =====
  const manejarGuardarCategoria = async (e) => {
    e.preventDefault();
    try {
      if (categoriaEditando) {
        const r = await servicioAdministrador.actualizarCategoria(categoriaEditando._id, formularioCategoria);
        if (r.success) mostrarNotificacion("Categoría actualizada");
      } else {
        const r = await servicioAdministrador.crearCategoria(formularioCategoria);
        if (r.success) mostrarNotificacion("Categoría creada");
      }
      setMostrarModalCategoria(false);
      setCategoriaEditando(null);
      setFormularioCategoria({ nombre: "", descripcion: "" });
      cargarCategorias();
    } catch (err) { mostrarNotificacion(err.response?.data?.message || "Error al guardar categoría", "error"); }
  };

  const manejarAlternarCategoria = async (idCategoria) => {
    try {
      const r = await servicioAdministrador.alternarCategoria(idCategoria);
      if (r.success) { mostrarNotificacion(r.message); cargarCategorias(); }
    } catch (err) { mostrarNotificacion("Error al cambiar estado", "error"); }
  };

  const manejarEliminarCategoria = async (idCategoria) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    try {
      const r = await servicioAdministrador.eliminarCategoria(idCategoria);
      if (r.success) { mostrarNotificacion("Categoría eliminada"); cargarCategorias(); }
    } catch (err) { mostrarNotificacion("Error al eliminar categoría", "error"); }
  };

  // ===== UTILIDADES =====
  const obtenerIniciales = (nombre) => {
    if (!nombre) return "?";
    return nombre.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "—";
    return new Date(fechaStr).toLocaleDateString("es-CR", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const formatearAccion = (accion) => {
    const mapa = {
      crear_usuario: "Crear usuario", desactivar_usuario: "Desactivar usuario",
      activar_usuario: "Activar usuario", asignar_rol: "Asignar rol",
      aprobar_vendedor: "Aprobar vendedor", suspender_vendedor: "Suspender vendedor",
      crear_categoria: "Crear categoría", editar_categoria: "Editar categoría",
      activar_categoria: "Activar categoría", desactivar_categoria: "Desactivar categoría",
      eliminar_categoria: "Eliminar categoría", cambio_estado: "Cambio de estado",
      aprobacion: "Aprobación", uso_cupon: "Uso de cupón",
      crear_producto: "Crear producto", eliminar_producto: "Eliminar producto", otro: "Otro",
    };
    return mapa[accion] || accion;
  };

  return {
    seccionActiva, setSeccionActiva,
    notificacion, cargando,
    menuAbierto, setMenuAbierto,
    // Usuarios (from sub-hook)
    ...usuariosHook,
    // Vendedores
    vendedores, buscarVendedor, setBuscarVendedor,
    manejarAprobarVendedor, manejarSuspenderVendedor,
    // Categorías
    categorias, mostrarModalCategoria, setMostrarModalCategoria,
    categoriaEditando, setCategoriaEditando,
    formularioCategoria, setFormularioCategoria,
    manejarGuardarCategoria, manejarAlternarCategoria, manejarEliminarCategoria,
    // Auditoría
    registrosAuditoria, filtrosAuditoria, setFiltrosAuditoria,
    paginacionAuditoria, cargarAuditoria,
    // Utilidades
    obtenerIniciales, formatearFecha, formatearAccion,
  };
}


