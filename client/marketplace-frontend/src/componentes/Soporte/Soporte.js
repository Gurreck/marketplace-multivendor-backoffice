import React, { useState, useEffect, useCallback } from "react";
import "./Soporte.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import {
  Ticket,
  RotateCcw,
  X,
  CheckCircle2,
  Moon,
  Sun,
  LogOut,
  Menu,
  Zap,
  XCircle,
  Package,
} from "lucide-react";

import { SoporteTicketsLista, SoporteDetalleTicket } from "./SoporteTickets";
import { SoporteDevolucionesLista, SoporteDetalleDevolucion } from "./SoporteDevoluciones";
import { SoporteOrdenes } from "./SoporteOrdenes";

export default function Soporte() {
  const navegar = useNavigate();
  const { logout: cerrarSesion, user: usuario } = useAuth();
  const { isDarkMode: esModoOscuro, toggleTheme: alternarTema } = useTheme();

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

  // ===== ÓRDENES (LÍNEA DE ENVÍO) =====
  const [ordenes, setOrdenes] = useState([]);
  const [buscarOrden, setBuscarOrden] = useState("");
  const [filtroEstadoOrden, setFiltroEstadoOrden] = useState("todos");

  // ===== ESTADOS Y ETIQUETAS =====
  const estadosTicket = [
    "open",
    "in_progress",
    "waiting_customer",
    "resolved",
    "closed",
  ];
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

  const estadosRMA = [
    "requested",
    "approved",
    "rejected",
    "received",
    "refunded",
  ];
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
    cancelled: "Cancelada"
  };

  const coloresEstadoOrden = {
    created: "gray",
    pending: "orange",
    paid: "blue",
    packed: "yellow",
    shipped: "purple",
    delivered: "green",
    cancelled: "red"
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
      if (response.data.success) {
        setTickets(response.data.data || []);
      }
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
      if (response.data.success) {
        setDevoluciones(response.data.data || []);
      }
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
      if (response.data.success) {
        setOrdenes(response.data.data || []);
      }
    } catch (err) {
      console.error("Error al cargar órdenes:", err);
      setOrdenes([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    switch (seccionActiva) {
      case "tickets":
        cargarTickets();
        break;
      case "devoluciones":
        cargarDevoluciones();
        break;
      case "ordenes":
        cargarOrdenes();
        break;
      default:
        break;
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
          setTicketSeleccionado({
            ...ticketSeleccionado,
            asignado: usuario,
            estado: "in_progress",
          });
        }
      }
    } catch (err) {
      mostrarNotificacion(
        err.response?.data?.message || "Error al asignar ticket",
        "error",
      );
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
        // Actualizar mensajes localmente
        setTicketSeleccionado({
          ...ticketSeleccionado,
          mensajes: [
            ...(ticketSeleccionado.mensajes || []),
            {
              autor: usuario?.nombre || "Soporte",
              mensaje: respuestaTicket,
              fecha: new Date().toISOString(),
              rol: "soporte",
            },
          ],
        });
      }
    } catch (err) {
      mostrarNotificacion("Error al enviar respuesta", "error");
    }
  };

  const cambiarEstadoTicket = async (idTicket, nuevoEstado) => {
    try {
      const response = await api.put(
        `/support/tickets/${idTicket}/status`,
        { estado: nuevoEstado },
      );
      if (response.data.success) {
        mostrarNotificacion(
          `Estado cambiado a "${etiquetasEstadoTicket[nuevoEstado]}"`,
        );
        if (
          ticketSeleccionado &&
          ticketSeleccionado._id === idTicket
        ) {
          setTicketSeleccionado({
            ...ticketSeleccionado,
            estado: nuevoEstado,
          });
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
        mostrarNotificacion(
          `Estado RMA cambiado a "${etiquetasEstadoRMA[nuevoEstado]}"`,
        );
        if (rmaSeleccionada && rmaSeleccionada._id === idRMA) {
          setRmaSeleccionada({
            ...rmaSeleccionada,
            estado: nuevoEstado,
          });
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
      const response = await api.put(`/support/orders/${orderId}/status`, {
        estado: nuevoEstado,
      });
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
    const matchesEstado =
      filtroEstadoTicket === "todos" || t.estado === filtroEstadoTicket;
    const matchesBusqueda =
      (t.asunto || "").toLowerCase().includes(buscarTicket.toLowerCase()) ||
      (t.user?.nombre || "").toLowerCase().includes(buscarTicket.toLowerCase());
    return matchesEstado && matchesBusqueda;
  });

  const devolucionesFiltradas = devoluciones.filter((d) => {
    const matchesEstado =
      filtroEstadoRMA === "todos" || d.estado === filtroEstadoRMA;
    const matchesBusqueda =
      (d.motivo || "").toLowerCase().includes(buscarRMA.toLowerCase()) ||
      (d.user?.nombre || "").toLowerCase().includes(buscarRMA.toLowerCase());
    return matchesEstado && matchesBusqueda;
  });

  const ordenesFiltradas = ordenes.filter((o) => {
    const matchesEstado =
      filtroEstadoOrden === "todos" || o.status === filtroEstadoOrden;
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
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const obtenerIniciales = (nombre) => {
    if (!nombre) return "?";
    return nombre
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const manejarCerrarSesion = () => {
    cerrarSesion();
    navegar("/");
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

  // ===== SECCIONES DE NAVEGACIÓN =====
  const elementosNav = [
    { clave: "tickets", icono: <Ticket size={20} />, etiqueta: "Tickets" },
    {
      clave: "devoluciones",
      icono: <RotateCcw size={20} />,
      etiqueta: "Devoluciones RMA",
    },
    {
      clave: "ordenes",
      icono: <Package size={20} />,
      etiqueta: "Envíos",
    },
  ];

  // ===== RENDER PRINCIPAL =====
  return (
    <div
      className={`contenedor-sop ${!esModoOscuro ? "modo-claro" : ""}`}
    >
      {/* Notificación */}
      {notificacion && (
        <div className={`notificacion-sop ${notificacion.tipo}`}>
          {notificacion.tipo === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <XCircle size={18} />
          )}
          <span style={{ marginLeft: "8px" }}>
            {notificacion.mensaje}
          </span>
        </div>
      )}

      {/* Botón menú móvil */}
      <button
        className="boton-menu-movil-sop"
        onClick={() => setMenuAbierto(!menuAbierto)}
      >
        {menuAbierto ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Barra lateral */}
      <aside
        className={`barra-lateral-sop ${menuAbierto ? "abierta" : ""}`}
      >
        <div className="marca-barra-lateral-sop">
          <Zap size={24} color="var(--sop-azul)" />
          <h2>Nexora Soporte</h2>
        </div>

        <nav className="nav-sop">
          {elementosNav.map((elemento) => (
            <button
              key={elemento.clave}
              className={`item-nav-sop ${
                seccionActiva === elemento.clave ||
                (seccionActiva === "detalleTicket" &&
                  elemento.clave === "tickets") ||
                (seccionActiva === "detalleRMA" &&
                  elemento.clave === "devoluciones")
                  ? "activo"
                  : ""
              }`}
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

        <div className="pie-barra-lateral-sop">
          <button className="boton-tema-sop" onClick={alternarTema}>
            <span>
              {esModoOscuro ? <Sun size={18} /> : <Moon size={18} />}
            </span>
            <span>
              {esModoOscuro ? "Modo Claro" : "Modo Oscuro"}
            </span>
          </button>
          <button
            className="boton-cerrar-sesion-sop"
            onClick={manejarCerrarSesion}
          >
            <span>
              <LogOut size={18} />
            </span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="principal-sop">
        {seccionActiva === "tickets" && (
          <SoporteTicketsLista
            ticketsFiltrados={ticketsFiltrados}
            buscarTicket={buscarTicket}
            setBuscarTicket={setBuscarTicket}
            filtroEstadoTicket={filtroEstadoTicket}
            setFiltroEstadoTicket={setFiltroEstadoTicket}
            cargarTickets={cargarTickets}
            cargando={cargando}
            obtenerIniciales={obtenerIniciales}
            formatearFecha={formatearFecha}
            coloresEstadoTicket={coloresEstadoTicket}
            etiquetasEstadoTicket={etiquetasEstadoTicket}
            setTicketSeleccionado={setTicketSeleccionado}
            setSeccionActiva={setSeccionActiva}
            asignarseTicket={asignarseTicket}
          />
        )}
        {seccionActiva === "detalleTicket" && (
          <SoporteDetalleTicket
            ticket={ticketSeleccionado}
            setSeccionActiva={setSeccionActiva}
            formatearFecha={formatearFecha}
            obtenerIniciales={obtenerIniciales}
            coloresEstadoTicket={coloresEstadoTicket}
            etiquetasEstadoTicket={etiquetasEstadoTicket}
            estadosTicket={estadosTicket}
            cambiarEstadoTicket={cambiarEstadoTicket}
            asignarseTicket={asignarseTicket}
            mostrarEscalar={mostrarEscalar}
            setMostrarEscalar={setMostrarEscalar}
            comentarioEscalar={comentarioEscalar}
            setComentarioEscalar={setComentarioEscalar}
            escalarTicketHandler={escalarTicketHandler}
            respuestaTicket={respuestaTicket}
            setRespuestaTicket={setRespuestaTicket}
            responderTicketHandler={responderTicketHandler}
          />
        )}
        {seccionActiva === "devoluciones" && (
          <SoporteDevolucionesLista
            devolucionesFiltradas={devolucionesFiltradas}
            buscarRMA={buscarRMA}
            setBuscarRMA={setBuscarRMA}
            filtroEstadoRMA={filtroEstadoRMA}
            setFiltroEstadoRMA={setFiltroEstadoRMA}
            cargarDevoluciones={cargarDevoluciones}
            cargando={cargando}
            obtenerIniciales={obtenerIniciales}
            formatearFecha={formatearFecha}
            coloresEstadoRMA={coloresEstadoRMA}
            etiquetasEstadoRMA={etiquetasEstadoRMA}
            setRmaSeleccionada={setRmaSeleccionada}
            setSeccionActiva={setSeccionActiva}
            cambiarEstadoRMA={cambiarEstadoRMA}
          />
        )}
        {seccionActiva === "detalleRMA" && (
          <SoporteDetalleDevolucion
            rma={rmaSeleccionada}
            setSeccionActiva={setSeccionActiva}
            obtenerTransicionesRMA={obtenerTransicionesRMA}
            formatearFecha={formatearFecha}
            coloresEstadoRMA={coloresEstadoRMA}
            etiquetasEstadoRMA={etiquetasEstadoRMA}
            estadosRMA={estadosRMA}
            comentarioRMA={comentarioRMA}
            setComentarioRMA={setComentarioRMA}
            cambiarEstadoRMA={cambiarEstadoRMA}
            mostrarEscalarRMA={mostrarEscalarRMA}
            setMostrarEscalarRMA={setMostrarEscalarRMA}
            comentarioEscalarRMA={comentarioEscalarRMA}
            setComentarioEscalarRMA={setComentarioEscalarRMA}
            escalarRMAHandler={escalarRMAHandler}
          />
        )}
        {seccionActiva === "ordenes" && (
          <SoporteOrdenes
            ordenesFiltradas={ordenesFiltradas}
            buscarOrden={buscarOrden}
            setBuscarOrden={setBuscarOrden}
            filtroEstadoOrden={filtroEstadoOrden}
            setFiltroEstadoOrden={setFiltroEstadoOrden}
            cargarOrdenes={cargarOrdenes}
            cargando={cargando}
            coloresEstadoOrden={coloresEstadoOrden}
            etiquetasEstadoOrden={etiquetasEstadoOrden}
            formatearFecha={formatearFecha}
            cambiarEstadoOrdenSoporte={cambiarEstadoOrdenSoporte}
          />
        )}
      </main>
    </div>
  );
}
