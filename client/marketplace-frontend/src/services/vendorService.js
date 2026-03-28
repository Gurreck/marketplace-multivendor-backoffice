import api from "./api";

const servicioVendedor = {
  // ========== PRODUCTOS ==========
  obtenerMisProductos: async () => {
    const respuesta = await api.get("/products/vendor/me");
    return respuesta.data;
  },

  crearProducto: async (formData) => {
    const respuesta = await api.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return respuesta.data;
  },

  actualizarProducto: async (idProducto, formData) => {
    const respuesta = await api.put(`/products/${idProducto}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return respuesta.data;
  },

  eliminarProducto: async (idProducto) => {
    const respuesta = await api.delete(`/products/${idProducto}`);
    return respuesta.data;
  },

  toggleProducto: async (idProducto) => {
    const respuesta = await api.put(`/products/${idProducto}/toggle`);
    return respuesta.data;
  },

  actualizarStock: async (idProducto, stock) => {
    const respuesta = await api.put(`/products/${idProducto}/stock`, { stock });
    return respuesta.data;
  },

  // ========== ÓRDENES ==========
  obtenerMisOrdenes: async (filtros = {}) => {
    const parametros = new URLSearchParams();
    if (filtros.estado) parametros.append("estado", filtros.estado);
    if (filtros.pagina) parametros.append("page", filtros.pagina);
    if (filtros.limite) parametros.append("limit", filtros.limite);
    const respuesta = await api.get(`/vendor/orders?${parametros.toString()}`);
    return respuesta.data;
  },

  obtenerDetalleOrden: async (idOrden) => {
    const respuesta = await api.get(`/vendor/orders/${idOrden}`);
    return respuesta.data;
  },

  actualizarEstadoOrden: async (idOrden, nuevoEstado, comentario = "") => {
    const respuesta = await api.put(`/vendor/orders/${idOrden}/status`, {
      estado: nuevoEstado,
      comentario,
    });
    return respuesta.data;
  },

  // ========== DASHBOARD / KPIs ==========
  obtenerKPIs: async (periodo = "mes") => {
    const respuesta = await api.get(`/vendor/dashboard?periodo=${periodo}`);
    return respuesta.data;
  },
};

export default servicioVendedor;
