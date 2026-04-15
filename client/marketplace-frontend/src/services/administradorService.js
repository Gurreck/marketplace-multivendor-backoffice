import api from "./api";

const servicioAdministrador = {
  // ========== USUARIOS ==========
  obtenerUsuarios: async () => {
    const respuesta = await api.get("/admin/users");
    return respuesta.data;
  },

  crearUsuario: async (datosUsuario) => {
    const respuesta = await api.post("/admin/users", datosUsuario);
    return respuesta.data;
  },

  asignarRol: async (idUsuario, rol) => {
    const respuesta = await api.put(`/admin/users/${idUsuario}/role`, { role: rol });
    return respuesta.data;
  },

  cambiarEstadoUsuario: async (idUsuario, activo) => {
    const respuesta = await api.put(`/admin/users/${idUsuario}/status`, { activo });
    return respuesta.data;
  },

  actualizarUsuario: async (idUsuario, datosUsuario) => {
    const respuesta = await api.put(`/admin/users/${idUsuario}`, datosUsuario);
    return respuesta.data;
  },

  eliminarUsuario: async (idUsuario) => {
    const respuesta = await api.delete(`/admin/users/${idUsuario}`);
    return respuesta.data;
  },

  // ========== VENDEDORES ==========
  obtenerVendedores: async () => {
    const respuesta = await api.get("/admin/vendors");
    return respuesta.data;
  },

  aprobarVendedor: async (idVendedor) => {
    const respuesta = await api.put(`/admin/vendors/${idVendedor}/approve`);
    return respuesta.data;
  },

  suspenderVendedor: async (idVendedor) => {
    const respuesta = await api.put(`/admin/vendors/${idVendedor}/suspend`);
    return respuesta.data;
  },

  // ========== CATEGORÍAS ==========
  obtenerCategorias: async () => {
    const respuesta = await api.get("/admin/categories");
    return respuesta.data;
  },

  crearCategoria: async (datosCategoria) => {
    const respuesta = await api.post("/admin/categories", datosCategoria);
    return respuesta.data;
  },

  actualizarCategoria: async (idCategoria, datosCategoria) => {
    const respuesta = await api.put(`/admin/categories/${idCategoria}`, datosCategoria);
    return respuesta.data;
  },

  alternarCategoria: async (idCategoria) => {
    const respuesta = await api.put(`/admin/categories/${idCategoria}/toggle`);
    return respuesta.data;
  },

  eliminarCategoria: async (idCategoria) => {
    const respuesta = await api.delete(`/admin/categories/${idCategoria}`);
    return respuesta.data;
  },

  // ========== AUDITORÍA ==========
  obtenerRegistrosAuditoria: async (filtros = {}) => {
    const parametros = new URLSearchParams();
    if (filtros.usuario) parametros.append("usuario", filtros.usuario);
    if (filtros.accion) parametros.append("accion", filtros.accion);
    if (filtros.entidad) parametros.append("entidad", filtros.entidad);
    if (filtros.fechaDesde) parametros.append("fechaDesde", filtros.fechaDesde);
    if (filtros.fechaHasta) parametros.append("fechaHasta", filtros.fechaHasta);
    if (filtros.pagina) parametros.append("page", filtros.pagina);
    if (filtros.limite) parametros.append("limit", filtros.limite);

    const respuesta = await api.get(`/admin/audit?${parametros.toString()}`);
    return respuesta.data;
  },

  obtenerResumenAuditoria: async () => {
    const respuesta = await api.get("/admin/audit/summary");
    return respuesta.data;
  },

  // ========== KPIs ==========
  obtenerKPIs: async () => {
    const respuesta = await api.get("/admin/kpis");
    return respuesta.data;
  },
};

export default servicioAdministrador;


