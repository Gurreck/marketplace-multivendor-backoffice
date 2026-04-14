import { useState, useCallback } from "react";
import api from "../../../services/api";

/**
 * Hook que maneja la lógica de devoluciones RMA del soporte.
 */
export default function useSoporteRMA({ mostrarNotificacion }) {
  const [devoluciones, setDevoluciones] = useState([]);
  const [rmaSeleccionada, setRmaSeleccionada] = useState(null);
  const [buscarRMA, setBuscarRMA] = useState("");
  const [filtroEstadoRMA, setFiltroEstadoRMA] = useState("todos");
  const [comentarioRMA, setComentarioRMA] = useState("");
  const [mostrarEscalarRMA, setMostrarEscalarRMA] = useState(false);
  const [comentarioEscalarRMA, setComentarioEscalarRMA] = useState("");

  const estadosRMA = ["requested", "approved", "rejected", "received", "refunded"];
  const etiquetasEstadoRMA = {
    requested: "Solicitada", approved: "Aprobada", rejected: "Rechazada",
    received: "Recibida", refunded: "Reembolsada",
  };
  const coloresEstadoRMA = {
    requested: "orange", approved: "blue", rejected: "red",
    received: "purple", refunded: "green",
  };

  const obtenerTransicionesRMA = (estadoActual) => {
    const transiciones = {
      requested: ["approved", "rejected"],
      approved: ["received"],
      received: ["refunded"],
    };
    return transiciones[estadoActual] || [];
  };

  const cargarDevoluciones = useCallback(async () => {
    try {
      const res = await api.get("/support/returns");
      if (res.data.success) setDevoluciones(res.data.data || []);
    } catch (err) {
      console.error("Error cargando devoluciones:", err);
    }
  }, []);

  const cambiarEstadoRMA = async (rmaId, nuevoEstado, comentario = "") => {
    try {
      const res = await api.put(`/support/returns/${rmaId}/status`, {
        estado: nuevoEstado, comentario,
      });
      if (res.data.success) {
        mostrarNotificacion(`Estado de la devolución actualizado a "${etiquetasEstadoRMA[nuevoEstado]}"`);
        setRmaSeleccionada(res.data.data);
        setComentarioRMA("");
        cargarDevoluciones();
      }
    } catch (err) {
      mostrarNotificacion("Error al cambiar estado de la devolución", "error");
    }
  };

  const escalarRMAHandler = async (destino) => {
    if (!rmaSeleccionada) return;
    try {
      const res = await api.put(`/support/returns/${rmaSeleccionada._id}/escalate`, {
        destino, comentario: comentarioEscalarRMA,
      });
      if (res.data.success) {
        mostrarNotificacion("Devolución escalada exitosamente");
        setRmaSeleccionada(res.data.data);
        setMostrarEscalarRMA(false);
        setComentarioEscalarRMA("");
        cargarDevoluciones();
      }
    } catch (err) {
      mostrarNotificacion("Error al escalar devolución", "error");
    }
  };

  const devolucionesFiltradas = devoluciones.filter((d) => {
    const matchEstado = filtroEstadoRMA === "todos" || d.estado === filtroEstadoRMA;
    const matchBuscar = !buscarRMA ||
      (d._id || "").toLowerCase().includes(buscarRMA.toLowerCase()) ||
      (d.cliente?.nombre || "").toLowerCase().includes(buscarRMA.toLowerCase()) ||
      (d.motivo || "").toLowerCase().includes(buscarRMA.toLowerCase());
    return matchEstado && matchBuscar;
  });

  return {
    devoluciones, devolucionesFiltradas,
    rmaSeleccionada, setRmaSeleccionada,
    buscarRMA, setBuscarRMA,
    filtroEstadoRMA, setFiltroEstadoRMA,
    comentarioRMA, setComentarioRMA,
    mostrarEscalarRMA, setMostrarEscalarRMA,
    comentarioEscalarRMA, setComentarioEscalarRMA,
    estadosRMA, etiquetasEstadoRMA, coloresEstadoRMA,
    obtenerTransicionesRMA,
    cargarDevoluciones, cambiarEstadoRMA, escalarRMAHandler,
  };
}

