import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

/**
 * Custom hook que centraliza todo el estado y lógica de datos del módulo Soporte.
 */
export default function useSoporteData() {
  const { user: usuario } = useAuth();

  // ===== ESTADO GENERAL =====
  const [seccionActiva, setSeccionActiva] = useState("tickets");
  const [notificacion, setNotificacion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  // ===== TICKETS =====
  const [tickets, setTickets] = useState([]);
  const [filtroEstadoTicket, setFiltroEstadoTicket] = useState("todos");
  const [buscarTicket, setBuscarTicket] = useState("");
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [respuestaTicket, setRespuestaTicket] = useState("");
  const [comentarioEscalar, setComentarioEscalar] = useState("");
  const [mostrarEscalar, setMostrarEscalar] = useState(false);

  // ===== DEVOLUCIONES RMA =====
  const [devoluciones, setDevoluciones] = useState([]);
  const [filtroEstadoRMA, setFiltroEstadoRMA] = useState("todos");
  const [buscarRMA, setBuscarRMA] = useState("");
  const [rmaSeleccionada, setRmaSeleccionada] = useState(null);
  const [comentarioRMA, setComentarioRMA] = useState("");
  const [mostrarEscalarRMA, setMostrarEscalarRMA] = useState(false);
  const [comentarioEscalarRMA, setComentarioEscalarRMA] = useState("");

  // ===== ÓRDENES =====
  const [ordenes, setOrdenes] = useState([]);
  const [buscarOrden, setBuscarOrden] = useState("");
  const [filtroEstadoOrden, setFiltroEstadoOrden] = useState("todos");

  // ===== CONSTANTES: ESTADOS Y ETIQUETAS =====
  const estadosTicket = ["open", "in_progress", "waiting_customer", "resolved", "closed"];
  const etiquetasEstadoTicket = {
    open: "Abierto",
    in_progress: "En Progreso",
    waiting_customer: "Esperando Cliente",
    resolved: "Resuelto",
    closed: "Cerrado",
  };
  const coloresEstadoTicket = {
    open: "blue",
    in_progress: "orange",
    waiting_customer: "purple",
    resolved: "green",
    closed: "gray",
  };

  const estadosRMA = ["requested", "approved", "rejected", "received", "refunded"];
  const etiquetasEstadoRMA = {
    requested: "Solicitada",
    approved: "Aprobada",
    rejected: "Rechazada",
    received: "Recibida",
    refunded: "Reembolsada",
  };
  const coloresEstadoRMA = {
    requested: "blue",
    approved: "green",
    rejected: "red",
    received: "purple",
    refunded: "teal",
  };

  const etiquetasEstadoOrden = {
    created: "Creada",
    pending: "Pendiente",
    paid: "Pagada",
    packed: "Empacada",
    shipped: "Enviada",
    delivered: "Entregada",
    cancelled: "Cancelada",
  };
  const coloresEstadoOrden = {
    created: "gray",
    pending: "orange",
    paid: "blue",
    packed: "yellow",
    shipped: "purple",
    delivered: "green",
    cancelled: "red",
  };

  // ===== NOTIFICACIONES =====
  const mostrarNotificacion = (mensaje, tipo = "success") => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3500);
  };

  // ===== CARGA DE DATOS =====
  const cargarTickets = useCallback(async () => {
    try {
      setCargando(true);
      const response = await api.get("/support/tickets");
      if (response.data.success) setTickets(response.data.data || []);
    } catch (err) {
      console.error("Error al cargar tickets:", err);
      setTickets([]);
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarDevoluciones = useCallback(async () => {
    try {
      setCargando(true);
      const response = await api.get("/support/rma");
      if (response.data.success) setDevoluciones(response.data.data || []);
    } catch (err) {
      console.error("Error al cargar devoluciones:", err);
      setDevoluciones([]);
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarOrdenes = useCallback(async () => {
    try {
      setCargando(true);
      const response = await api.get("/support/orders");
      if (response.data.success) setOrdenes(response.data.data || []);
    } catch (err) {
      console.error("Error al cargar órdenes:", err);
      setOrdenes([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    switch (seccionActiva) {
      case "tickets": cargarTickets(); break;
      case "devoluciones": cargarDevoluciones(); break;
      case "ordenes": cargarOrdenes(); break;
      default: break;
    }
  }, [seccionActiva, cargarTickets, cargarDevoluciones, cargarOrdenes]);

  // ===== ACCIONES: TICKETS =====
  const asignarseTicket = async (idTicket) => {
    try {
      const response = await api.put(`/support/tickets/${idTicket}/assign`);
      if (response.data.success) {
        mostrarNotificacion("Ticket asignado correctamente");
        cargarTickets();
        if (ticketSeleccionado && ticketSeleccionado._id === idTicket) {
          setTicketSeleccionado({ ...ticketSeleccionado, asignado: usuario, estado: "in_progress" });
        }
      }
    } catch (err) {
      mostrarNotificacion(err.response?.data?.message || "Error al asignar ticket", "error");
    }
  };

  const responderTicketHandler = async () => {
    if (!respuestaTicket.trim()) return;
    try {
      const response = await api.post(
        `/support/tickets/${ticketSeleccionado._id}/reply`,
        { mensaje: respuestaTicket },
      );
      if (response.data.success) {
        mostrarNotificacion("Respuesta enviada");
        setRespuestaTicket("");
        setTicketSeleccionado({
          ...ticketSeleccionado,
          mensajes: [
            ...(ticketSeleccionado.mensajes || []),
            { autor: usuario?.nombre || "Soporte", mensaje: respuestaTicket, fecha: new Date().toISOString(), rol: "soporte" },
          ],
        });
      }
    } catch (err) {
      mostrarNotificacion("Error al enviar respuesta", "error");
    }
  };

  const cambiarEstadoTicket = async (idTicket, nuevoEstado) => {
    try {
      const response = await api.put(`/support/tickets/${idTicket}/status`, { estado: nuevoEstado });
      if (response.data.success) {
        mostrarNotificacion(`Estado cambiado a "${etiquetasEstadoTicket[nuevoEstado]}"`);
        if (ticketSeleccionado && ticketSeleccionado._id === idTicket) {
          setTicketSeleccionado({ ...ticketSeleccionado, estado: nuevoEstado });
        }
        cargarTickets();
      }
    } catch (err) {
      mostrarNotificacion("Error al cambiar estado", "error");
    }
  };

  const escalarTicketHandler = async (destino) => {
    if (!ticketSeleccionado) return;
    try {
      const response = await api.put(
        `/support/tickets/${ticketSeleccionado._id}/escalate`,
        { destino, comentario: comentarioEscalar },
      );
      if (response.data.success) {
        mostrarNotificacion(`Ticket escalado a ${destino}`);
        setMostrarEscalar(false);
        setComentarioEscalar("");
        cargarTickets();
      }
    } catch (err) {
      mostrarNotificacion("Error al escalar ticket", "error");
    }
  };

  // ===== ACCIONES: RMA =====
  const cambiarEstadoRMA = async (idRMA, nuevoEstado) => {
    try {
      const response = await api.put(`/support/rma/${idRMA}/status`, {
        estado: nuevoEstado,
        comentario: comentarioRMA,
      });
      if (response.data.success) {
        mostrarNotificacion(`Estado RMA cambiado a "${etiquetasEstadoRMA[nuevoEstado]}"`);
        if (rmaSeleccionada && rmaSeleccionada._id === idRMA) {
          setRmaSeleccionada({ ...rmaSeleccionada, estado: nuevoEstado });
        }
        setComentarioRMA("");
        cargarDevoluciones();
      }
    } catch (err) {
      mostrarNotificacion("Error al cambiar estado RMA", "error");
    }
  };

  const escalarRMAHandler = async (destino) => {
    if (!rmaSeleccionada) return;
    try {
      const response = await api.put(
        `/support/rma/${rmaSeleccionada._id}/escalate`,
        { destino, comentario: comentarioEscalarRMA },
      );
      if (response.data.success) {
        mostrarNotificacion(`RMA escalado a ${destino}`);
        setMostrarEscalarRMA(false);
        setComentarioEscalarRMA("");
        cargarDevoluciones();
      }
    } catch (err) {
      mostrarNotificacion("Error al escalar RMA", "error");
    }
  };

  // ===== ACCIONES: ORDENES =====
  const cambiarEstadoOrdenSoporte = async (orderId, nuevoEstado) => {
    try {
      const response = await api.put(`/support/orders/${orderId}/status`, { estado: nuevoEstado });
      if (response.data.success) {
        mostrarNotificacion(`Estado de orden cambiado a "${etiquetasEstadoOrden[nuevoEstado]}"`);
        cargarOrdenes();
      }
    } catch (err) {
      mostrarNotificacion(err.response?.data?.message || "Error al cambiar estado de orden", "error");
    }
  };

  // ===== FILTROS =====
  const ticketsFiltrados = tickets.filter((t) => {
    const matchesEstado = filtroEstadoTicket === "todos" || t.estado === filtroEstadoTicket;
    const matchesBusqueda =
      (t.asunto || "").toLowerCase().includes(buscarTicket.toLowerCase()) ||
      (t.user?.nombre || "").toLowerCase().includes(buscarTicket.toLowerCase());
    return matchesEstado && matchesBusqueda;
  });

  const devolucionesFiltradas = devoluciones.filter((d) => {
    const matchesEstado = filtroEstadoRMA === "todos" || d.estado === filtroEstadoRMA;
    const matchesBusqueda =
      (d.motivo || "").toLowerCase().includes(buscarRMA.toLowerCase()) ||
      (d.user?.nombre || "").toLowerCase().includes(buscarRMA.toLowerCase());
    return matchesEstado && matchesBusqueda;
  });

  const ordenesFiltradas = ordenes.filter((o) => {
    const matchesEstado = filtroEstadoOrden === "todos" || o.status === filtroEstadoOrden;
    const matchesBusqueda =
      (o._id || "").toLowerCase().includes(buscarOrden.toLowerCase()) ||
      (o.user?.nombre || "").toLowerCase().includes(buscarOrden.toLowerCase());
    return matchesEstado && matchesBusqueda;
  });

  // ===== UTILIDADES =====
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "—";
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-CR", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const obtenerIniciales = (nombre) => {
    if (!nombre) return "?";
    return nombre.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
  };

  const obtenerTransicionesRMA = (estadoActual) => {
    const transiciones = {
      requested: ["approved", "rejected"],
      approved: ["received"],
      received: ["refunded"],
      rejected: [],
      refunded: [],
    };
    return transiciones[estadoActual] || [];
  };

  return {
    // Estado general
    seccionActiva, setSeccionActiva,
    notificacion,
    cargando,
    menuAbierto, setMenuAbierto,
    // Tickets
    ticketsFiltrados,
    buscarTicket, setBuscarTicket,
    filtroEstadoTicket, setFiltroEstadoTicket,
    cargarTickets,
    ticketSeleccionado, setTicketSeleccionado,
    respuestaTicket, setRespuestaTicket,
    responderTicketHandler,
    estadosTicket,
    etiquetasEstadoTicket,
    coloresEstadoTicket,
    cambiarEstadoTicket,
    asignarseTicket,
    mostrarEscalar, setMostrarEscalar,
    comentarioEscalar, setComentarioEscalar,
    escalarTicketHandler,
    // Devoluciones
    devolucionesFiltradas,
    buscarRMA, setBuscarRMA,
    filtroEstadoRMA, setFiltroEstadoRMA,
    cargarDevoluciones,
    rmaSeleccionada, setRmaSeleccionada,
    estadosRMA,
    etiquetasEstadoRMA,
    coloresEstadoRMA,
    comentarioRMA, setComentarioRMA,
    cambiarEstadoRMA,
    mostrarEscalarRMA, setMostrarEscalarRMA,
    comentarioEscalarRMA, setComentarioEscalarRMA,
    escalarRMAHandler,
    obtenerTransicionesRMA,
    // Órdenes
    ordenesFiltradas,
    buscarOrden, setBuscarOrden,
    filtroEstadoOrden, setFiltroEstadoOrden,
    cargarOrdenes,
    coloresEstadoOrden,
    etiquetasEstadoOrden,
    cambiarEstadoOrdenSoporte,
    // Utilidades
    formatearFecha,
    obtenerIniciales,
  };
}
