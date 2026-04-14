import React from "react";
import { Ticket, Search, RefreshCcw, Loader2, Eye, UserCheck } from "lucide-react";
import "./SoporteTicketsLista.css";

export default function SoporteTicketsLista({
  ticketsFiltrados, buscarTicket, setBuscarTicket,
  filtroEstadoTicket, setFiltroEstadoTicket, cargarTickets,
  cargando, obtenerIniciales, formatearFecha,
  coloresEstadoTicket, etiquetasEstadoTicket,
  setTicketSeleccionado, setSeccionActiva, asignarseTicket
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
              <input className="entrada-busqueda-sop" type="text" placeholder="Buscar ticket..."
                value={buscarTicket} onChange={(e) => setBuscarTicket(e.target.value)} />
            </div>
            <select className="select-filtro-sop" value={filtroEstadoTicket}
              onChange={(e) => setFiltroEstadoTicket(e.target.value)}>
              <option value="todos">Todos los Estados</option>
              <option value="open">Abiertos</option>
              <option value="in_progress">En Progreso</option>
              <option value="waiting_customer">Esperando Cliente</option>
              <option value="resolved">Resueltos</option>
              <option value="closed">Cerrados</option>
            </select>
            <button className="boton-secundario-sop" onClick={cargarTickets}>
              <RefreshCcw size={16} style={{ marginRight: "6px" }} /> Actualizar
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
                <th>ID</th><th>Asunto</th><th>Cliente</th><th>Prioridad</th>
                <th>Estado</th><th>Asignado</th><th>Fecha</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ticketsFiltrados.map((ticket) => (
                <tr key={ticket._id}>
                  <td><strong>#{ticket._id?.slice(-6)}</strong></td>
                  <td><strong>{ticket.asunto || "Sin asunto"}</strong></td>
                  <td>
                    <div className="info-usuario-sop">
                      <div className="avatar-sop">{obtenerIniciales(ticket.user?.nombre)}</div>
                      <div className="detalles-usuario-sop">
                        <strong>{ticket.user?.nombre || "Cliente"}</strong>
                        <span>{ticket.user?.email || ""}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`insignia-sop ${ticket.prioridad === "alta" ? "red" : ticket.prioridad === "media" ? "orange" : "blue"}`}>
                      {ticket.prioridad || "normal"}
                    </span>
                  </td>
                  <td>
                    <span className={`insignia-sop ${coloresEstadoTicket[ticket.estado] || ""}`}>
                      {etiquetasEstadoTicket[ticket.estado] || ticket.estado}
                    </span>
                  </td>
                  <td>
                    {ticket.asignadoA
                      ? <span className="texto-asignado-sop">{ticket.asignadoA.nombre || "Asignado"}</span>
                      : <span className="texto-sin-asignar-sop">Sin asignar</span>}
                  </td>
                  <td className="fecha-sop">{formatearFecha(ticket.createdAt)}</td>
                  <td>
                    <div className="botones-accion-sop">
                      <button className="boton-accion-sop" onClick={() => { setTicketSeleccionado(ticket); setSeccionActiva("detalleTicket"); }} title="Ver detalle">
                        <Eye size={16} />
                      </button>
                      {!ticket.asignadoA && (
                        <button className="boton-accion-sop success" onClick={() => asignarseTicket(ticket._id)} title="Asignarme">
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
