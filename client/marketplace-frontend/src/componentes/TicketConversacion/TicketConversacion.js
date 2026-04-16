import React from "react";
import './TicketConversacion.css';
import { MessageSquare, Send } from "lucide-react";

/**
 * Componente de conversación de un ticket de soporte.
 * Muestra los mensajes y permite responder.
 */
export default function TicketConversacion({
  ticket,
  obtenerIniciales,
  formatearFecha,
  respuestaTicket,
  setRespuestaTicket,
  responderTicketHandler
}) {
  const esSoporte = (msg) =>
    msg.remitente?.role === "soporte" || msg.remitente?.role === "administrador" || msg.rol === "soporte";

  return (
    <div className="tarjeta-info-sop conversacion">
      <h3>
        <MessageSquare size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} />
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
              <strong>{ticket.user?.nombre || "Cliente"}</strong>
              <span className="fecha-mensaje-sop">{formatearFecha(ticket.createdAt)}</span>
            </div>
          </div>
          <p className="texto-mensaje-sop">{ticket.descripcion || "Sin descripción"}</p>
        </div>

        {/* Mensajes */}
        {(ticket.mensajes || []).map((msg, i) => (
          <div key={i} className={`mensaje-sop ${esSoporte(msg) ? "soporte" : "cliente"}`}>
            <div className="cabecera-mensaje-sop">
              <div className={`avatar-mensaje-sop ${esSoporte(msg) ? "soporte" : ""}`}>
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
          <textarea
            className="textarea-sop"
            placeholder="Escribe tu respuesta..."
            value={respuestaTicket}
            onChange={(e) => setRespuestaTicket(e.target.value)}
            rows="3"
          />
          <button className="boton-primario-sop" onClick={responderTicketHandler} disabled={!respuestaTicket.trim()}>
            <Send size={16} style={{ marginRight: "8px" }} />
            Enviar Respuesta
          </button>
        </div>
      )}
    </div>
  );
}

