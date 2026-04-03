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
  Loader2,
  Moon,
  Sun,
  LogOut,
  Menu,
  Zap,
  Search,
  Eye,
  ArrowLeft,
  RefreshCcw,
  XCircle,
  MessageSquare,
  Send,
  UserCheck,
  ArrowUpRight,
  Clock,
  ShieldAlert,
  Store,
} from "lucide-react";

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

  useEffect(() => {
    switch (seccionActiva) {
      case "tickets":
        cargarTickets();
        break;
      case "devoluciones":
        cargarDevoluciones();
        break;
      default:
        break;
    }
  }, [seccionActiva, cargarTickets, cargarDevoluciones]);

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
  ];

  // ===== RENDER: TICKETS =====
  const renderTickets = () => (
    <>
      <div className="encabezado-pagina-sop">
        <h1>Gestión de Tickets</h1>
        <p>Ver, asignar y responder tickets de soporte</p>
      </div>

      <div className="contenedor-tabla-sop">
        <div className="encabezado-tabla-sop">
          <h3>
            <Ticket size={18} style={{ marginRight: "8px" }} />
            Tickets ({ticketsFiltrados.length})
          </h3>
          <div className="acciones-tabla-sop">
            <div className="contenedor-entrada-sop">
              <Search size={18} className="icono-entrada-sop" />
              <input
                className="entrada-busqueda-sop"
                type="text"
                placeholder="Buscar ticket..."
                value={buscarTicket}
                onChange={(e) => setBuscarTicket(e.target.value)}
              />
            </div>
            <select
              className="select-filtro-sop"
              value={filtroEstadoTicket}
              onChange={(e) => setFiltroEstadoTicket(e.target.value)}
            >
              <option value="todos">Todos los Estados</option>
              <option value="open">Abiertos</option>
              <option value="in_progress">En Progreso</option>
              <option value="waiting_customer">Esperando Cliente</option>
              <option value="resolved">Resueltos</option>
              <option value="closed">Cerrados</option>
            </select>
            <button
              className="boton-secundario-sop"
              onClick={cargarTickets}
            >
              <RefreshCcw size={16} style={{ marginRight: "6px" }} />{" "}
              Actualizar
            </button>
          </div>
        </div>

        {cargando ? (
          <div className="cargando-sop">
            <Loader2 className="animacion-giro" size={40} />
            <p>Cargando tickets...</p>
          </div>
        ) : ticketsFiltrados.length === 0 ? (
          <div className="vacio-sop" style={{ padding: "60px" }}>
            <Ticket size={48} opacity={0.3} />
            <p>No hay tickets disponibles</p>
          </div>
        ) : (
          <table className="tabla-sop">
            <thead>
              <tr>
                <th>ID</th>
                <th>Asunto</th>
                <th>Cliente</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Asignado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ticketsFiltrados.map((ticket) => (
                <tr key={ticket._id}>
                  <td>
                    <strong>#{ticket._id?.slice(-6)}</strong>
                  </td>
                  <td>
                    <strong>{ticket.asunto || "Sin asunto"}</strong>
                  </td>
                  <td>
                    <div className="info-usuario-sop">
                      <div className="avatar-sop">
                        {obtenerIniciales(ticket.user?.nombre)}
                      </div>
                      <div className="detalles-usuario-sop">
                        <strong>
                          {ticket.user?.nombre || "Cliente"}
                        </strong>
                        <span>{ticket.user?.email || ""}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`insignia-sop ${ticket.prioridad === "alta" ? "red" : ticket.prioridad === "media" ? "orange" : "blue"}`}
                    >
                      {ticket.prioridad || "normal"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`insignia-sop ${coloresEstadoTicket[ticket.estado] || ""}`}
                    >
                      {etiquetasEstadoTicket[ticket.estado] ||
                        ticket.estado}
                    </span>
                  </td>
                  <td>
                    {ticket.asignadoA ? (
                      <span className="texto-asignado-sop">
                        {ticket.asignadoA.nombre || "Asignado"}
                      </span>
                    ) : (
                      <span className="texto-sin-asignar-sop">
                        Sin asignar
                      </span>
                    )}
                  </td>
                  <td className="fecha-sop">
                    {formatearFecha(ticket.createdAt)}
                  </td>
                  <td>
                    <div className="botones-accion-sop">
                      <button
                        className="boton-accion-sop"
                        onClick={() => {
                          setTicketSeleccionado(ticket);
                          setSeccionActiva("detalleTicket");
                        }}
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                      {!ticket.asignadoA && (
                        <button
                          className="boton-accion-sop success"
                          onClick={() => asignarseTicket(ticket._id)}
                          title="Asignarme"
                        >
                          <UserCheck size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );

  // ===== RENDER: DETALLE TICKET =====
  const renderDetalleTicket = () => {
    if (!ticketSeleccionado) return null;
    const ticket = ticketSeleccionado;

    return (
      <>
        <div
          className="encabezado-pagina-sop"
          style={{ display: "flex", alignItems: "center", gap: "16px" }}
        >
          <button
            className="boton-volver-sop"
            onClick={() => setSeccionActiva("tickets")}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>Ticket #{ticket._id?.slice(-6)}</h1>
            <p>{ticket.asunto || "Sin asunto"}</p>
          </div>
        </div>

        <div className="cuadricula-detalle-sop">
          {/* Info del ticket */}
          <div className="tarjeta-info-sop">
            <h3>
              <Ticket
                size={18}
                style={{ marginRight: "8px", verticalAlign: "middle" }}
              />
              Información del Ticket
            </h3>
            <div className="detalle-info-grid-sop">
              <div className="detalle-info-item-sop">
                <span className="detalle-label-sop">ID</span>
                <span className="detalle-valor-sop">{ticket._id}</span>
              </div>
              <div className="detalle-info-item-sop">
                <span className="detalle-label-sop">Cliente</span>
                <span className="detalle-valor-sop">
                  {ticket.user?.nombre || "—"}
                </span>
              </div>
              <div className="detalle-info-item-sop">
                <span className="detalle-label-sop">Email</span>
                <span className="detalle-valor-sop">
                  {ticket.user?.email || "—"}
                </span>
              </div>
              <div className="detalle-info-item-sop">
                <span className="detalle-label-sop">Prioridad</span>
                <span
                  className={`insignia-sop ${ticket.prioridad === "alta" ? "red" : ticket.prioridad === "media" ? "orange" : "blue"}`}
                >
                  {ticket.prioridad || "normal"}
                </span>
              </div>
              <div className="detalle-info-item-sop">
                <span className="detalle-label-sop">Estado</span>
                <span
                  className={`insignia-sop ${coloresEstadoTicket[ticket.estado] || ""}`}
                >
                  {etiquetasEstadoTicket[ticket.estado] || ticket.estado}
                </span>
              </div>
              <div className="detalle-info-item-sop">
                <span className="detalle-label-sop">Asignado a</span>
                <span className="detalle-valor-sop">
                  {ticket.asignadoA?.nombre || "Sin asignar"}
                </span>
              </div>
              <div className="detalle-info-item-sop">
                <span className="detalle-label-sop">Creado</span>
                <span className="detalle-valor-sop">
                  {formatearFecha(ticket.createdAt)}
                </span>
              </div>
            </div>

            {/* Cambiar estado */}
            <div className="cambiar-estado-sop">
              <h4>Cambiar Estado</h4>
              <div className="botones-estado-sop">
                {estadosTicket.map((est) => (
                  <button
                    key={est}
                    className={`boton-estado-sop ${ticket.estado === est ? "activo" : ""}`}
                    onClick={() =>
                      cambiarEstadoTicket(ticket._id, est)
                    }
                    disabled={ticket.estado === est}
                  >
                    {etiquetasEstadoTicket[est]}
                  </button>
                ))}
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="acciones-rapidas-sop">
              {!ticket.asignadoA && (
                <button
                  className="boton-primario-sop"
                  onClick={() => asignarseTicket(ticket._id)}
                >
                  <UserCheck
                    size={16}
                    style={{ marginRight: "8px" }}
                  />
                  Asignarme este Ticket
                </button>
              )}

              <button
                className="boton-escalar-sop"
                onClick={() => setMostrarEscalar(!mostrarEscalar)}
              >
                <ArrowUpRight
                  size={16}
                  style={{ marginRight: "8px" }}
                />
                Escalar
              </button>
            </div>

            {/* Panel de escalamiento */}
            {mostrarEscalar && (
              <div className="panel-escalar-sop">
                <textarea
                  className="textarea-sop"
                  placeholder="Comentario de escalamiento..."
                  value={comentarioEscalar}
                  onChange={(e) => setComentarioEscalar(e.target.value)}
                  rows="2"
                />
                <div className="botones-escalar-sop">
                  <button
                    className="boton-escalar-destino-sop"
                    onClick={() => escalarTicketHandler("administrador")}
                  >
                    <ShieldAlert
                      size={14}
                      style={{ marginRight: "6px" }}
                    />
                    A Administrador
                  </button>
                  <button
                    className="boton-escalar-destino-sop vendedor"
                    onClick={() => escalarTicketHandler("vendedor")}
                  >
                    <Store
                      size={14}
                      style={{ marginRight: "6px" }}
                    />
                    A Vendedor
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Conversación */}
          <div className="tarjeta-info-sop conversacion">
            <h3>
              <MessageSquare
                size={18}
                style={{ marginRight: "8px", verticalAlign: "middle" }}
              />
              Conversación
            </h3>

            <div className="lista-mensajes-sop">
              {/* Descripción original */}
              <div className="mensaje-sop cliente">
                <div className="cabecera-mensaje-sop">
                  <div className="avatar-mensaje-sop">
                    {obtenerIniciales(ticket.user?.nombre)}
                  </div>
                  <div>
                    <strong>
                      {ticket.user?.nombre || "Cliente"}
                    </strong>
                    <span className="fecha-mensaje-sop">
                      {formatearFecha(ticket.createdAt)}
                    </span>
                  </div>
                </div>
                <p className="texto-mensaje-sop">
                  {ticket.descripcion || "Sin descripción"}
                </p>
              </div>

              {/* Mensajes */}
              {(ticket.mensajes || []).map((msg, i) => (
                <div
                  key={i}
                  className={`mensaje-sop ${(msg.remitente?.role === "soporte" || msg.remitente?.role === "administrador") ? "soporte" : "cliente"}`}
                >
                  <div className="cabecera-mensaje-sop">
                    <div
                      className={`avatar-mensaje-sop ${(msg.remitente?.role === "soporte" || msg.remitente?.role === "administrador") ? "soporte" : ""}`}
                    >
                      {obtenerIniciales(msg.remitente?.nombre)}
                    </div>
                    <div>
                      <strong>{msg.remitente?.nombre || "Usuario"}</strong>
                      <span className="fecha-mensaje-sop">
                        {formatearFecha(msg.fecha)}
                      </span>
                    </div>
                  </div>
                  <p className="texto-mensaje-sop">{msg.texto}</p>
                </div>
              ))}
            </div>

            {/* Responder */}
            {ticket.estado !== "closed" && (
              <div className="responder-sop">
                <textarea
                  className="textarea-sop"
                  placeholder="Escribe tu respuesta..."
                  value={respuestaTicket}
                  onChange={(e) => setRespuestaTicket(e.target.value)}
                  rows="3"
                />
                <button
                  className="boton-primario-sop"
                  onClick={responderTicketHandler}
                  disabled={!respuestaTicket.trim()}
                >
                  <Send size={16} style={{ marginRight: "8px" }} />
                  Enviar Respuesta
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  // ===== RENDER: DEVOLUCIONES RMA =====
  const renderDevoluciones = () => (
    <>
      <div className="encabezado-pagina-sop">
        <h1>Gestión de Devoluciones (RMA)</h1>
        <p>Revisar, aprobar/rechazar y gestionar solicitudes de devolución</p>
      </div>

      <div className="contenedor-tabla-sop">
        <div className="encabezado-tabla-sop">
          <h3>
            <RotateCcw size={18} style={{ marginRight: "8px" }} />
            Devoluciones ({devolucionesFiltradas.length})
          </h3>
          <div className="acciones-tabla-sop">
            <div className="contenedor-entrada-sop">
              <Search size={18} className="icono-entrada-sop" />
              <input
                className="entrada-busqueda-sop"
                type="text"
                placeholder="Buscar devolución..."
                value={buscarRMA}
                onChange={(e) => setBuscarRMA(e.target.value)}
              />
            </div>
            <select
              className="select-filtro-sop"
              value={filtroEstadoRMA}
              onChange={(e) => setFiltroEstadoRMA(e.target.value)}
            >
              <option value="todos">Todos los Estados</option>
              <option value="requested">Solicitadas</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
              <option value="received">Recibidas</option>
              <option value="refunded">Reembolsadas</option>
            </select>
            <button
              className="boton-secundario-sop"
              onClick={cargarDevoluciones}
            >
              <RefreshCcw size={16} style={{ marginRight: "6px" }} />{" "}
              Actualizar
            </button>
          </div>
        </div>

        {cargando ? (
          <div className="cargando-sop">
            <Loader2 className="animacion-giro" size={40} />
            <p>Cargando devoluciones...</p>
          </div>
        ) : devolucionesFiltradas.length === 0 ? (
          <div className="vacio-sop" style={{ padding: "60px" }}>
            <RotateCcw size={48} opacity={0.3} />
            <p>No hay devoluciones disponibles</p>
          </div>
        ) : (
          <table className="tabla-sop">
            <thead>
              <tr>
                <th>ID</th>
                <th>Orden</th>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {devolucionesFiltradas.map((rma) => (
                <tr key={rma._id}>
                  <td>
                    <strong>#{rma._id?.slice(-6)}</strong>
                  </td>
                  <td>
                    <span className="insignia-sop blue">
                      #{rma.orden?._id?.slice(-6) || rma.ordenId?.slice(-6) || "—"}
                    </span>
                  </td>
                  <td>
                    <div className="info-usuario-sop">
                      <div className="avatar-sop">
                        {obtenerIniciales(rma.cliente?.nombre)}
                      </div>
                      <div className="detalles-usuario-sop">
                        <strong>
                          {rma.cliente?.nombre || "Cliente"}
                        </strong>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>
                      {rma.producto?.name || rma.productoNombre || "—"}
                    </strong>
                  </td>
                  <td className="texto-truncado-sop">
                    {rma.motivo || "—"}
                  </td>
                  <td>
                    <span
                      className={`insignia-sop ${coloresEstadoRMA[rma.estado] || ""}`}
                    >
                      {etiquetasEstadoRMA[rma.estado] || rma.estado}
                    </span>
                  </td>
                  <td className="fecha-sop">
                    {formatearFecha(rma.createdAt)}
                  </td>
                  <td>
                    <div className="botones-accion-sop">
                      <button
                        className="boton-accion-sop"
                        onClick={() => {
                          setRmaSeleccionada(rma);
                          setSeccionActiva("detalleRMA");
                        }}
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                      {rma.estado === "requested" && (
                        <>
                          <button
                            className="boton-accion-sop success"
                            onClick={() =>
                              cambiarEstadoRMA(rma._id, "approved")
                            }
                            title="Aprobar"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button
                            className="boton-accion-sop danger"
                            onClick={() =>
                              cambiarEstadoRMA(rma._id, "rejected")
                            }
                            title="Rechazar"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );

  // ===== RENDER: DETALLE RMA =====
  const renderDetalleRMA = () => {
    if (!rmaSeleccionada) return null;
    const rma = rmaSeleccionada;
    const transicionesDisponibles = obtenerTransicionesRMA(rma.estado);

    return (
      <>
        <div
          className="encabezado-pagina-sop"
          style={{ display: "flex", alignItems: "center", gap: "16px" }}
        >
          <button
            className="boton-volver-sop"
            onClick={() => setSeccionActiva("devoluciones")}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>RMA #{rma._id?.slice(-6)}</h1>
            <p>Detalle de solicitud de devolución</p>
          </div>
        </div>

        <div className="cuadricula-detalle-sop">
          {/* Info de la RMA */}
          <div className="tarjeta-info-sop">
            <h3>
              <RotateCcw
                size={18}
                style={{ marginRight: "8px", verticalAlign: "middle" }}
              />
              Información de la Devolución
            </h3>
            <div className="detalle-info-grid-sop">
              <div className="detalle-info-item-sop">
                <span className="detalle-label-sop">ID RMA</span>
                <span className="detalle-valor-sop">{rma._id}</span>
              </div>
              <div className="detalle-info-item-sop">
                <span className="detalle-label-sop">Orden</span>
                <span className="detalle-valor-sop">
                  #{rma.orden?._id?.slice(-6) || rma.ordenId?.slice(-6) || "—"}
                </span>
              </div>
              <div className="detalle-info-item-sop">
                <span className="detalle-label-sop">Cliente</span>
                <span className="detalle-valor-sop">
                  {rma.cliente?.nombre || "—"}
                </span>
              </div>
              <div className="detalle-info-item-sop">
                <span className="detalle-label-sop">Email</span>
                <span className="detalle-valor-sop">
                  {rma.cliente?.email || "—"}
                </span>
              </div>
              <div className="detalle-info-item-sop">
                <span className="detalle-label-sop">Producto</span>
                <span className="detalle-valor-sop">
                  {rma.producto?.name || rma.productoNombre || "—"}
                </span>
              </div>
              <div className="detalle-info-item-sop">
                <span className="detalle-label-sop">Cantidad</span>
                <span className="detalle-valor-sop">
                  {rma.cantidad || 1}
                </span>
              </div>
              <div className="detalle-info-item-sop">
                <span className="detalle-label-sop">Estado</span>
                <span
                  className={`insignia-sop ${coloresEstadoRMA[rma.estado] || ""}`}
                >
                  {etiquetasEstadoRMA[rma.estado] || rma.estado}
                </span>
              </div>
              <div className="detalle-info-item-sop">
                <span className="detalle-label-sop">Fecha</span>
                <span className="detalle-valor-sop">
                  {formatearFecha(rma.createdAt)}
                </span>
              </div>
            </div>

            <div className="motivo-rma-sop">
              <h4>Motivo de Devolución</h4>
              <p>{rma.motivo || "No se proporcionó motivo"}</p>
            </div>

            {/* Progreso RMA */}
            <div className="progreso-rma-sop">
              <h4>Progreso</h4>
              <div className="pasos-rma-sop">
                {estadosRMA.map((est, i) => {
                  const indexActual = estadosRMA.indexOf(rma.estado);
                  const esCompletado = i <= indexActual;
                  const esActual = i === indexActual;
                  const esRechazado = rma.estado === "rejected";

                  // Si fue rechazado, solo mostrar requested y rejected
                  if (esRechazado && est !== "requested" && est !== "rejected")
                    return null;

                  return (
                    <div
                      key={est}
                      className={`paso-rma-sop ${esCompletado ? "completado" : ""} ${esActual ? "actual" : ""} ${est === "rejected" ? "rechazado" : ""}`}
                    >
                      <div className="circulo-rma-sop">
                        {esCompletado ? (
                          est === "rejected" ? (
                            <XCircle size={16} />
                          ) : (
                            <CheckCircle2 size={16} />
                          )
                        ) : (
                          <span>{i + 1}</span>
                        )}
                      </div>
                      <span>{etiquetasEstadoRMA[est]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Acciones y Comentarios */}
          <div className="tarjeta-info-sop">
            <h3>
              <MessageSquare
                size={18}
                style={{ marginRight: "8px", verticalAlign: "middle" }}
              />
              Acciones y Comentarios
            </h3>

            {/* Cambiar estado */}
            {transicionesDisponibles.length > 0 && (
              <div className="cambiar-estado-sop">
                <h4>Cambiar Estado</h4>
                <textarea
                  className="textarea-sop"
                  placeholder="Comentario o decisión..."
                  value={comentarioRMA}
                  onChange={(e) => setComentarioRMA(e.target.value)}
                  rows="2"
                />
                <div className="botones-estado-sop">
                  {transicionesDisponibles.map((est) => (
                    <button
                      key={est}
                      className={`boton-estado-sop ${est === "rejected" ? "rechazar" : ""}`}
                      onClick={() => cambiarEstadoRMA(rma._id, est)}
                    >
                      {etiquetasEstadoRMA[est]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Escalar */}
            <div className="acciones-rapidas-sop" style={{ marginTop: "20px" }}>
              <button
                className="boton-escalar-sop"
                onClick={() => setMostrarEscalarRMA(!mostrarEscalarRMA)}
              >
                <ArrowUpRight
                  size={16}
                  style={{ marginRight: "8px" }}
                />
                Escalar
              </button>
            </div>

            {mostrarEscalarRMA && (
              <div className="panel-escalar-sop">
                <textarea
                  className="textarea-sop"
                  placeholder="Comentario de escalamiento..."
                  value={comentarioEscalarRMA}
                  onChange={(e) => setComentarioEscalarRMA(e.target.value)}
                  rows="2"
                />
                <div className="botones-escalar-sop">
                  <button
                    className="boton-escalar-destino-sop"
                    onClick={() => escalarRMAHandler("administrador")}
                  >
                    <ShieldAlert
                      size={14}
                      style={{ marginRight: "6px" }}
                    />
                    A Administrador
                  </button>
                  <button
                    className="boton-escalar-destino-sop vendedor"
                    onClick={() => escalarRMAHandler("vendedor")}
                  >
                    <Store
                      size={14}
                      style={{ marginRight: "6px" }}
                    />
                    A Vendedor
                  </button>
                </div>
              </div>
            )}

            {/* Historial de comentarios */}
            <div className="historial-rma-sop">
              <h4>Historial</h4>
              {(rma.historial || []).length > 0 ? (
                <div className="lista-historial-sop">
                  {rma.historial.map((h, i) => (
                    <div key={i} className="item-historial-sop">
                      <div className="cabecera-historial-sop">
                        <span
                          className={`insignia-sop ${coloresEstadoRMA[h.estado] || "blue"}`}
                        >
                          {etiquetasEstadoRMA[h.estado] || h.estado}
                        </span>
                        <span className="fecha-sop">
                          {formatearFecha(h.fecha)}
                        </span>
                      </div>
                      <p>{h.comentario || "Sin comentario"}</p>
                      <span className="usuario-historial-sop">
                        Por: {h.usuario || "Sistema"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="vacio-sop" style={{ padding: "20px" }}>
                  <Clock size={30} opacity={0.2} />
                  <p>No hay historial aún</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

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
        {seccionActiva === "tickets" && renderTickets()}
        {seccionActiva === "detalleTicket" && renderDetalleTicket()}
        {seccionActiva === "devoluciones" && renderDevoluciones()}
        {seccionActiva === "detalleRMA" && renderDetalleRMA()}
      </main>
    </div>
  );
}
