import { useState, useCallback } from "react";
import api from "../../../services/api";

/**
 * Hook que maneja la lógica de tickets de soporte.
 */
export default function useSoporteTickets({ mostrarNotificacion }) {
  const [tickets, setTickets] = useState([]);
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [buscarTicket, setBuscarTicket] = useState("");
  const [filtroEstadoTicket, setFiltroEstadoTicket] = useState("todos");
  const [respuestaTicket, setRespuestaTicket] = useState("");
  const [mostrarEscalar, setMostrarEscalar] = useState(false);
  const [comentarioEscalar, setComentarioEscalar] = useState("");

  const estadosTicket = ["open", "in_progress", "waiting_customer", "resolved", "closed"];
  const etiquetasEstadoTicket = {
    open: "Abierto", in_progress: "En Progreso",
    waiting_customer: "Esperando Cliente", resolved: "Resuelto", closed: "Cerrado",
  };
  const coloresEstadoTicket = {
    open: "blue", in_progress: "orange",
    waiting_customer: "purple", resolved: "green", closed: "",
  };

  const cargarTickets = useCallback(async () => {
    try {
      const res = await api.get("/support/tickets");
      if (res.data.success) setTickets(res.data.data || []);
    } catch (err) {
      console.error("Error cargando tickets:", err);
    }
  }, []);

  const cambiarEstadoTicket = async (ticketId, nuevoEstado) => {
    try {
      const res = await api.put(`/support/tickets/${ticketId}/status`, { estado: nuevoEstado });
      if (res.data.success) {
        mostrarNotificacion("Estado del ticket actualizado");
        setTicketSeleccionado(res.data.data);
        cargarTickets();
      }
    } catch (err) {
      mostrarNotificacion("Error al cambiar estado del ticket", "error");
    }
  };

  const asignarseTicket = async (ticketId) => {
    try {
      const res = await api.put(`/support/tickets/${ticketId}/assign`);
      if (res.data.success) {
        mostrarNotificacion("Ticket asignado exitosamente");
        setTicketSeleccionado(res.data.data);
        cargarTickets();
      }
    } catch (err) {
      mostrarNotificacion("Error al asignar ticket", "error");
    }
  };

  const responderTicketHandler = async () => {
    if (!respuestaTicket.trim() || !ticketSeleccionado) return;
    try {
      const res = await api.post(`/support/tickets/${ticketSeleccionado._id}/reply`, { mensaje: respuestaTicket });
      if (res.data.success) {
        mostrarNotificacion("Respuesta enviada");
        setTicketSeleccionado(res.data.data);
        setRespuestaTicket("");
        cargarTickets();
      }
    } catch (err) {
      mostrarNotificacion("Error al enviar respuesta", "error");
    }
  };

  const escalarTicketHandler = async (destino) => {
    if (!ticketSeleccionado) return;
    try {
      const res = await api.put(`/support/tickets/${ticketSeleccionado._id}/escalate`, {
        destino, comentario: comentarioEscalar,
      });
      if (res.data.success) {
        mostrarNotificacion("Ticket escalado exitosamente");
        setTicketSeleccionado(res.data.data);
        setMostrarEscalar(false);
        setComentarioEscalar("");
        cargarTickets();
      }
    } catch (err) {
      mostrarNotificacion("Error al escalar ticket", "error");
    }
  };

  const ticketsFiltrados = tickets.filter((t) => {
    const matchEstado = filtroEstadoTicket === "todos" || t.estado === filtroEstadoTicket;
    const matchBuscar = !buscarTicket ||
      (t.asunto || "").toLowerCase().includes(buscarTicket.toLowerCase()) ||
      (t.user?.nombre || "").toLowerCase().includes(buscarTicket.toLowerCase()) ||
      (t._id || "").toLowerCase().includes(buscarTicket.toLowerCase());
    return matchEstado && matchBuscar;
  });

  return {
    tickets, ticketsFiltrados,
    ticketSeleccionado, setTicketSeleccionado,
    buscarTicket, setBuscarTicket,
    filtroEstadoTicket, setFiltroEstadoTicket,
    respuestaTicket, setRespuestaTicket,
    mostrarEscalar, setMostrarEscalar,
    comentarioEscalar, setComentarioEscalar,
    estadosTicket, etiquetasEstadoTicket, coloresEstadoTicket,
    cargarTickets, cambiarEstadoTicket, asignarseTicket,
    responderTicketHandler, escalarTicketHandler,
  };
}

