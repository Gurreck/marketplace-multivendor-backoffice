import React from "react";
import { Ticket, ArrowLeft, ArrowUpRight, ShieldAlert, Store, MessageSquare, Send, UserCheck } from "lucide-react";
import "./SoporteDetalleTicket.css";

export default function SoporteDetalleTicket({
  ticket, setSeccionActiva, formatearFecha, obtenerIniciales,
  coloresEstadoTicket, etiquetasEstadoTicket, estadosTicket,
  cambiarEstadoTicket, asignarseTicket, mostrarEscalar, setMostrarEscalar,
  comentarioEscalar, setComentarioEscalar, escalarTicketHandler,
  respuestaTicket, setRespuestaTicket, responderTicketHandler
}) {
  if (!ticket) return null;

  return (
    <>
      <div className="encabezado-pagina-sop" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button className="boton-volver-sop" onClick={() => setSeccionActiva("tickets")}><ArrowLeft size={20} /></button>
        <div>
          <h1>Ticket #{ticket._id?.slice(-6)}</h1>
          <p>{ticket.asunto || "Sin asunto"}</p>
        </div>
      </div>

      <div className="cuadricula-detalle-sop">
        {/* Info del ticket */}
        <div className="tarjeta-info-sop">
          <h3><Ticket size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} /> Información del Ticket</h3>
          <div className="detalle-info-grid-sop">
            <div className="detalle-info-item-sop"><span className="detalle-label-sop">ID</span><span className="detalle-valor-sop">{ticket._id}</span></div>
            <div className="detalle-info-item-sop"><span className="detalle-label-sop">Cliente</span><span className="detalle-valor-sop">{ticket.user?.nombre || "—"}</span></div>
            <div className="detalle-info-item-sop"><span className="detalle-label-sop">Email</span><span className="detalle-valor-sop">{ticket.user?.email || "—"}</span></div>
            <div className="detalle-info-item-sop">
              <span className="detalle-label-sop">Prioridad</span>
              <span className={`insignia-sop ${ticket.prioridad === "alta" ? "red" : ticket.prioridad === "media" ? "orange" : "blue"}`}>{ticket.prioridad || "normal"}</span>
            </div>
            <div className="detalle-info-item-sop">
              <span className="detalle-label-sop">Estado</span>
              <span className={`insignia-sop ${coloresEstadoTicket[ticket.estado] || ""}`}>{etiquetasEstadoTicket[ticket.estado] || ticket.estado}</span>
            </div>
            <div className="detalle-info-item-sop"><span className="detalle-label-sop">Asignado a</span><span className="detalle-valor-sop">{ticket.asignadoA?.nombre || "Sin asignar"}</span></div>
            <div className="detalle-info-item-sop"><span className="detalle-label-sop">Creado</span><span className="detalle-valor-sop">{formatearFecha(ticket.createdAt)}</span></div>
          </div>

          {/* Cambiar estado */}
          <div className="cambiar-estado-sop">
            <h4>Cambiar Estado</h4>
            <div className="botones-estado-sop">
              {estadosTicket.map((est) => (
                <button key={est} className={`boton-estado-sop ${ticket.estado === est ? "activo" : ""}`}
                  onClick={() => cambiarEstadoTicket(ticket._id, est)} disabled={ticket.estado === est}>
                  {etiquetasEstadoTicket[est]}
                </button>
              ))}
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="acciones-rapidas-sop">
            {!ticket.asignadoA && (
              <button className="boton-primario-sop" onClick={() => asignarseTicket(ticket._id)}>
                <UserCheck size={16} style={{ marginRight: "8px" }} /> Asignarme este Ticket
              </button>
            )}
            <button className="boton-escalar-sop" onClick={() => setMostrarEscalar(!mostrarEscalar)}>
              <ArrowUpRight size={16} style={{ marginRight: "8px" }} /> Escalar
            </button>
          </div>

          {/* Panel de escalamiento */}
          {mostrarEscalar && (
            <div className="panel-escalar-sop">
              <textarea className="textarea-sop" placeholder="Comentario de escalamiento..."
                value={comentarioEscalar} onChange={(e) => setComentarioEscalar(e.target.value)} rows="2" />
              <div className="botones-escalar-sop">
                <button className="boton-escalar-destino-sop" onClick={() => escalarTicketHandler("administrador")}>
                  <ShieldAlert size={14} style={{ marginRight: "6px" }} /> A Administrador
                </button>
                <button className="boton-escalar-destino-sop vendedor" onClick={() => escalarTicketHandler("vendedor")}>
                  <Store size={14} style={{ marginRight: "6px" }} /> A Vendedor
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Conversación */}
        <div className="tarjeta-info-sop conversacion">
          <h3><MessageSquare size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} /> Conversación</h3>
          <div className="lista-mensajes-sop">
            {/* Descripción original */}
            <div className="mensaje-sop cliente">
              <div className="cabecera-mensaje-sop">
                <div className="avatar-mensaje-sop">{obtenerIniciales(ticket.user?.nombre)}</div>
                <div>
                  <strong>{ticket.user?.nombre || "Cliente"}</strong>
                  <span className="fecha-mensaje-sop">{formatearFecha(ticket.createdAt)}</span>
                </div>
              </div>
              <p className="texto-mensaje-sop">{ticket.descripcion || "Sin descripción"}</p>
            </div>

            {/* Mensajes */}
            {(ticket.mensajes || []).map((msg, i) => (
              <div key={i} className={`mensaje-sop ${(msg.remitente?.role === "soporte" || msg.remitente?.role === "administrador" || msg.rol === "soporte") ? "soporte" : "cliente"}`}>
                <div className="cabecera-mensaje-sop">
                  <div className={`avatar-mensaje-sop ${(msg.remitente?.role === "soporte" || msg.remitente?.role === "administrador" || msg.rol === "soporte") ? "soporte" : ""}`}>
                    {obtenerIniciales(msg.remitente?.nombre || msg.autor)}
                  </div>
                  <div>
                    <strong>{msg.remitente?.nombre || msg.autor || "Usuario"}</strong>
                    <span className="fecha-mensaje-sop">{formatearFecha(msg.fecha)}</span>
                  </div>
                </div>
                <p className="texto-mensaje-sop">{msg.texto || msg.mensaje}</p>
              </div>
            ))}
          </div>

          {/* Responder */}
          {ticket.estado !== "closed" && (
            <div className="responder-sop">
              <textarea className="textarea-sop" placeholder="Escribe tu respuesta..."
                value={respuestaTicket} onChange={(e) => setRespuestaTicket(e.target.value)} rows="3" />
              <button className="boton-primario-sop" onClick={responderTicketHandler} disabled={!respuestaTicket.trim()}>
                <Send size={16} style={{ marginRight: "8px" }} /> Enviar Respuesta
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
