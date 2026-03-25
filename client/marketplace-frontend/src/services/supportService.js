import api from "./api";

const servicioSoporte = {
  // ========== TICKETS ==========
  obtenerTickets: async (filtros = {}) => {
    const parametros = new URLSearchParams();
    if (filtros.estado) parametros.append("estado", filtros.estado);
    if (filtros.prioridad) parametros.append("prioridad", filtros.prioridad);
    if (filtros.pagina) parametros.append("page", filtros.pagina);
    if (filtros.limite) parametros.append("limit", filtros.limite);
    const respuesta = await api.get(`/support/tickets?${parametros.toString()}`);
    return respuesta.data;
  },

  obtenerDetalleTicket: async (idTicket) => {
    const respuesta = await api.get(`/support/tickets/${idTicket}`);
    return respuesta.data;
  },

  asignarseTicket: async (idTicket) => {
    const respuesta = await api.put(`/support/tickets/${idTicket}/assign`);
    return respuesta.data;
  },

  responderTicket: async (idTicket, mensaje) => {
    const respuesta = await api.post(`/support/tickets/${idTicket}/reply`, { mensaje });
    return respuesta.data;
  },

  cambiarEstadoTicket: async (idTicket, estado) => {
    const respuesta = await api.put(`/support/tickets/${idTicket}/status`, { estado });
    return respuesta.data;
  },

  escalarTicket: async (idTicket, destino, comentario = "") => {
    const respuesta = await api.put(`/support/tickets/${idTicket}/escalate`, {
      destino,
      comentario,
    });
    return respuesta.data;
  },

  // ========== DEVOLUCIONES (RMA) ==========
  obtenerDevoluciones: async (filtros = {}) => {
    const parametros = new URLSearchParams();
    if (filtros.estado) parametros.append("estado", filtros.estado);
    if (filtros.pagina) parametros.append("page", filtros.pagina);
    if (filtros.limite) parametros.append("limit", filtros.limite);
    const respuesta = await api.get(`/support/rma?${parametros.toString()}`);
    return respuesta.data;
  },

  obtenerDetalleRMA: async (idRMA) => {
    const respuesta = await api.get(`/support/rma/${idRMA}`);
    return respuesta.data;
  },

  cambiarEstadoRMA: async (idRMA, estado, comentario = "") => {
    const respuesta = await api.put(`/support/rma/${idRMA}/status`, {
      estado,
      comentario,
    });
    return respuesta.data;
  },

  escalarRMA: async (idRMA, destino, comentario = "") => {
    const respuesta = await api.put(`/support/rma/${idRMA}/escalate`, {
      destino,
      comentario,
    });
    return respuesta.data;
  },
};

export default servicioSoporte;
