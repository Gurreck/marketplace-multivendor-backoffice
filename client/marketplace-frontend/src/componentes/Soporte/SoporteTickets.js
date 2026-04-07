import React from "react";
import {
  Ticket,
  Search,
  RefreshCcw,
  Loader2,
  Eye,
  UserCheck,
  ArrowLeft,
  ArrowUpRight,
  ShieldAlert,
  Store,
  MessageSquare,
  Send
} from "lucide-react";
import "./SoporteTickets.css";

export function SoporteTicketsLista({
  ticketsFiltrados,
  buscarTicket,
  setBuscarTicket,
  filtroEstadoTicket,
  setFiltroEstadoTicket,
  cargarTickets,
  cargando,
  obtenerIniciales,
  formatearFecha,
  coloresEstadoTicket,
  etiquetasEstadoTicket,
  setTicketSeleccionado,
  setSeccionActiva,
  asignarseTicket
}) {
  return (
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
}

export function SoporteDetalleTicket({
  ticket,
  setSeccionActiva,
  formatearFecha,
  obtenerIniciales,
  coloresEstadoTicket,
  etiquetasEstadoTicket,
  estadosTicket,
  cambiarEstadoTicket,
  asignarseTicket,
  mostrarEscalar,
  setMostrarEscalar,
  comentarioEscalar,
  setComentarioEscalar,
  escalarTicketHandler,
  respuestaTicket,
  setRespuestaTicket,
  responderTicketHandler
}) {
  if (!ticket) return null;

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
                className={`mensaje-sop ${(msg.remitente?.role === "soporte" || msg.remitente?.role === "administrador" || msg.rol === "soporte") ? "soporte" : "cliente"}`}
              >
                <div className="cabecera-mensaje-sop">
                  <div
                    className={`avatar-mensaje-sop ${(msg.remitente?.role === "soporte" || msg.remitente?.role === "administrador" || msg.rol === "soporte") ? "soporte" : ""}`}
                  >
                    {obtenerIniciales(msg.remitente?.nombre || msg.autor)}
                  </div>
                  <div>
                    <strong>{msg.remitente?.nombre || msg.autor || "Usuario"}</strong>
                    <span className="fecha-mensaje-sop">
                      {formatearFecha(msg.fecha)}
                    </span>
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
}
