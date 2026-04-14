import { useState, useEffect, useCallback } from "react";
import api from "../../../services/api";
import useSoporteTickets from '../useSoporteTickets/useSoporteTickets';
import useSoporteRMA from '../useSoporteRMA/useSoporteRMA';

/**
 * Hook principal que compone los sub-hooks de Tickets y RMA,
 * además de manejar órdenes y estado general del módulo de Soporte.
 */
export default function useSoporteData() {
  // ===== ESTADO GENERAL =====
  const [seccionActiva, setSeccionActiva] = useState("tickets");
  const [notificacion, setNotificacion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  // ===== ÓRDENES =====
  const [ordenes, setOrdenes] = useState([]);
  const [buscarOrden, setBuscarOrden] = useState("");
  const [filtroEstadoOrden, setFiltroEstadoOrden] = useState("todas");

  const etiquetasEstadoOrden = {
    created: "Creada", pending: "Pendiente", paid: "Pagada",
    packed: "Empacada", shipped: "Enviada", delivered: "Entregada",
    cancelled: "Cancelada", receipt_confirmed: "Recepción Confirmada",
  };
  const coloresEstadoOrden = {
    created: "", pending: "orange", paid: "blue",
    packed: "purple", shipped: "blue", delivered: "green",
    cancelled: "red", receipt_confirmed: "green",
  };

  const mostrarNotificacion = (mensaje, tipo = "success") => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3500);
  };

  // ===== HOOKS COMPUESTOS =====
  const ticketsHook = useSoporteTickets({ mostrarNotificacion });
  const rmaHook = useSoporteRMA({ mostrarNotificacion });

  // ===== CARGA DE ÓRDENES =====
  const cargarOrdenes = useCallback(async () => {
    try {
      setCargando(true);
      const res = await api.get("/support/orders");
      if (res.data.success) setOrdenes(res.data.data || []);
    } catch (err) {
      console.error("Error cargando órdenes:", err);
    } finally {
      setCargando(false);
    }
  }, []);

  // ===== EFECTO DE CARGA SEGÚN SECCIÓN =====
  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      switch (seccionActiva) {
        case "tickets":
          await ticketsHook.cargarTickets();
          break;
        case "devoluciones":
          await rmaHook.cargarDevoluciones();
          break;
        case "ordenes":
          await cargarOrdenes();
          break;
        default:
          break;
      }
      setCargando(false);
    };
    cargar();
  }, [seccionActiva, ticketsHook.cargarTickets, rmaHook.cargarDevoluciones, cargarOrdenes]);

  // ===== ACCIONES: ÓRDENES =====
  const cambiarEstadoOrdenSoporte = async (ordenId, nuevoEstado) => {
    try {
      const res = await api.put(`/support/orders/${ordenId}/status`, { estado: nuevoEstado });
      if (res.data.success) {
        mostrarNotificacion(`Estado actualizado a "${etiquetasEstadoOrden[nuevoEstado]}"`);
        cargarOrdenes();
      }
    } catch (err) {
      mostrarNotificacion("Error al cambiar estado de la orden", "error");
    }
  };

  // ===== FILTROS DE ÓRDENES =====
  const ordenesFiltradas = ordenes.filter((o) => {
    const matchEstado = filtroEstadoOrden === "todas" || o.status === filtroEstadoOrden;
    const matchBuscar = !buscarOrden ||
      (o._id || "").toLowerCase().includes(buscarOrden.toLowerCase()) ||
      (o.user?.nombre || "").toLowerCase().includes(buscarOrden.toLowerCase());
    return matchEstado && matchBuscar;
  });

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

  return {
    // Estado general
    seccionActiva, setSeccionActiva,
    notificacion,
    cargando,
    menuAbierto, setMenuAbierto,
    // Tickets (from sub-hook)
    ...ticketsHook,
    // RMA (from sub-hook)
    ...rmaHook,
    // Órdenes
    ordenes, ordenesFiltradas,
    buscarOrden, setBuscarOrden,
    filtroEstadoOrden, setFiltroEstadoOrden,
    etiquetasEstadoOrden, coloresEstadoOrden,
    cargarOrdenes,
    cambiarEstadoOrdenSoporte,
    // Utilidades
    obtenerIniciales,
    formatearFecha,
    mostrarNotificacion,
  };
}
