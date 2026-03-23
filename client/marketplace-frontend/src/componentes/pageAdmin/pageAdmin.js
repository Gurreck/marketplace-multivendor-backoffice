import React, { useState, useEffect, useCallback } from "react";
import "./pageAdmin.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import servicioAdmin from "../../services/adminService";

export default function PaginaAdmin() {
  const navegar = useNavigate();
  const { logout: cerrarSesion, user: usuario } = useAuth();
  const { isDarkMode: esModoOscuro, toggleTheme: alternarTema } = useTheme();

  // ===== ESTADO GENERAL =====
  const [seccionActiva, setSeccionActiva] = useState("dashboard");
  const [notificacion, setNotificacion] = useState(null);
  const [cargando, setCargando] = useState(false);

  // ===== DASHBOARD / KPIs =====
  const [kpis, setKpis] = useState(null);

  // ===== USUARIOS =====
  const [usuarios, setUsuarios] = useState([]);
  const [buscarUsuario, setBuscarUsuario] = useState("");
  const [mostrarModalUsuario, setMostrarModalUsuario] = useState(false);
  const [formularioUsuario, setFormularioUsuario] = useState({ nombre: "", email: "", password: "", role: "cliente" });
  const [mostrarModalRol, setMostrarModalRol] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [nuevoRol, setNuevoRol] = useState("");

  // ===== VENDEDORES =====
  const [vendedores, setVendedores] = useState([]);
  const [buscarVendedor, setBuscarVendedor] = useState("");

  // ===== CATEGORÍAS =====
  const [categorias, setCategorias] = useState([]);
  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [formularioCategoria, setFormularioCategoria] = useState({ nombre: "", descripcion: "" });

  // ===== AUDITORÍA =====
  const [registrosAuditoria, setRegistrosAuditoria] = useState([]);
  const [filtrosAuditoria, setFiltrosAuditoria] = useState({
    usuario: "",
    accion: "",
    entidad: "",
    fechaDesde: "",
    fechaHasta: "",
  });
  const [paginacionAuditoria, setPaginacionAuditoria] = useState({
    paginaActual: 1,
    totalPaginas: 1,
    total: 0,
  });

  // ===== NOTIFICACIONES =====
  const mostrarNotificacion = (mensaje, tipo = "success") => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3500);
  };

  // ===== CARGA DE DATOS =====
  const cargarKPIs = useCallback(async () => {
    try {
      setCargando(true);
      const respuesta = await servicioAdmin.obtenerKPIs();
      if (respuesta.success) setKpis(respuesta.data);
    } catch (err) {
      console.error("Error al cargar KPIs:", err);
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarUsuarios = useCallback(async () => {
    try {
      setCargando(true);
      const respuesta = await servicioAdmin.obtenerUsuarios();
      if (respuesta.success) setUsuarios(respuesta.data);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarVendedores = useCallback(async () => {
    try {
      setCargando(true);
      const respuesta = await servicioAdmin.obtenerVendedores();
      if (respuesta.success) setVendedores(respuesta.data);
    } catch (err) {
      console.error("Error al cargar vendedores:", err);
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarCategorias = useCallback(async () => {
    try {
      setCargando(true);
      const respuesta = await servicioAdmin.obtenerCategorias();
      if (respuesta.success) setCategorias(respuesta.data);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarAuditoria = useCallback(async (pagina = 1) => {
    try {
      setCargando(true);
      const respuesta = await servicioAdmin.obtenerRegistrosAuditoria({
        ...filtrosAuditoria,
        pagina,
        limite: 15,
      });
      if (respuesta.success) {
        setRegistrosAuditoria(respuesta.data);
        setPaginacionAuditoria({
          paginaActual: respuesta.currentPage,
          totalPaginas: respuesta.totalPages,
          total: respuesta.total,
        });
      }
    } catch (err) {
      console.error("Error al cargar auditoría:", err);
    } finally {
      setCargando(false);
    }
  }, [filtrosAuditoria]);

  useEffect(() => {
    switch (seccionActiva) {
      case "dashboard":
        cargarKPIs();
        break;
      case "usuarios":
        cargarUsuarios();
        break;
      case "vendedores":
        cargarVendedores();
        break;
      case "categorias":
        cargarCategorias();
        break;
      case "auditoria":
        cargarAuditoria();
        break;
      default:
        break;
    }
  }, [seccionActiva, cargarKPIs, cargarUsuarios, cargarVendedores, cargarCategorias, cargarAuditoria]);

  // ===== ACCIONES: USUARIOS =====
  const manejarCrearUsuario = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await servicioAdmin.crearUsuario(formularioUsuario);
      if (respuesta.success) {
        mostrarNotificacion("Usuario creado exitosamente");
        setMostrarModalUsuario(false);
        setFormularioUsuario({ nombre: "", email: "", password: "", role: "cliente" });
        cargarUsuarios();
      }
    } catch (err) {
      mostrarNotificacion(err.response?.data?.message || "Error al crear usuario", "error");
    }
  };

  const manejarAsignarRol = async () => {
    if (!usuarioSeleccionado || !nuevoRol) return;
    try {
      const respuesta = await servicioAdmin.asignarRol(usuarioSeleccionado._id, nuevoRol);
      if (respuesta.success) {
        mostrarNotificacion(`Rol actualizado a "${nuevoRol}"`);
        setMostrarModalRol(false);
        setUsuarioSeleccionado(null);
        cargarUsuarios();
      }
    } catch (err) {
      mostrarNotificacion(err.response?.data?.message || "Error al asignar rol", "error");
    }
  };

  const manejarCambiarEstadoUsuario = async (idUsuario, estadoActual) => {
    try {
      const respuesta = await servicioAdmin.cambiarEstadoUsuario(idUsuario, !estadoActual);
      if (respuesta.success) {
        mostrarNotificacion(respuesta.message);
        cargarUsuarios();
      }
    } catch (err) {
      mostrarNotificacion("Error al cambiar estado", "error");
    }
  };

  // ===== ACCIONES: VENDEDORES =====
  const manejarAprobarVendedor = async (idVendedor) => {
    try {
      const respuesta = await servicioAdmin.aprobarVendedor(idVendedor);
      if (respuesta.success) {
        mostrarNotificacion("Vendedor aprobado");
        cargarVendedores();
      }
    } catch (err) {
      mostrarNotificacion("Error al aprobar vendedor", "error");
    }
  };

  const manejarSuspenderVendedor = async (idVendedor) => {
    if (!window.confirm("¿Seguro que deseas suspender a este vendedor?")) return;
    try {
      const respuesta = await servicioAdmin.suspenderVendedor(idVendedor);
      if (respuesta.success) {
        mostrarNotificacion("Vendedor suspendido");
        cargarVendedores();
      }
    } catch (err) {
      mostrarNotificacion("Error al suspender vendedor", "error");
    }
  };

  // ===== ACCIONES: CATEGORÍAS =====
  const manejarGuardarCategoria = async (e) => {
    e.preventDefault();
    try {
      if (categoriaEditando) {
        const respuesta = await servicioAdmin.actualizarCategoria(categoriaEditando._id, formularioCategoria);
        if (respuesta.success) {
          mostrarNotificacion("Categoría actualizada");
        }
      } else {
        const respuesta = await servicioAdmin.crearCategoria(formularioCategoria);
        if (respuesta.success) {
          mostrarNotificacion("Categoría creada");
        }
      }
      setMostrarModalCategoria(false);
      setCategoriaEditando(null);
      setFormularioCategoria({ nombre: "", descripcion: "" });
      cargarCategorias();
    } catch (err) {
      mostrarNotificacion(err.response?.data?.message || "Error al guardar categoría", "error");
    }
  };

  const manejarAlternarCategoria = async (idCategoria) => {
    try {
      const respuesta = await servicioAdmin.alternarCategoria(idCategoria);
      if (respuesta.success) {
        mostrarNotificacion(respuesta.message);
        cargarCategorias();
      }
    } catch (err) {
      mostrarNotificacion("Error al cambiar estado", "error");
    }
  };

  const manejarEliminarCategoria = async (idCategoria) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    try {
      const respuesta = await servicioAdmin.eliminarCategoria(idCategoria);
      if (respuesta.success) {
        mostrarNotificacion("Categoría eliminada");
        cargarCategorias();
      }
    } catch (err) {
      mostrarNotificacion("Error al eliminar categoría", "error");
    }
  };

  // ===== FILTROS USUARIOS/VENDEDORES =====
  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre?.toLowerCase().includes(buscarUsuario.toLowerCase()) ||
    u.email?.toLowerCase().includes(buscarUsuario.toLowerCase())
  );

  const vendedoresFiltrados = vendedores.filter((v) =>
    v.nombre?.toLowerCase().includes(buscarVendedor.toLowerCase()) ||
    v.email?.toLowerCase().includes(buscarVendedor.toLowerCase())
  );

  // ===== UTILIDADES =====
  const obtenerIniciales = (nombre) => {
    if (!nombre) return "?";
    return nombre.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
  };

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

  const formatearAccion = (accion) => {
    const mapa = {
      crear_usuario: "Crear usuario",
      desactivar_usuario: "Desactivar usuario",
      activar_usuario: "Activar usuario",
      asignar_rol: "Asignar rol",
      aprobar_vendedor: "Aprobar vendedor",
      suspender_vendedor: "Suspender vendedor",
      crear_categoria: "Crear categoría",
      editar_categoria: "Editar categoría",
      activar_categoria: "Activar categoría",
      desactivar_categoria: "Desactivar categoría",
      eliminar_categoria: "Eliminar categoría",
      cambio_estado: "Cambio de estado",
      aprobacion: "Aprobación",
      uso_cupon: "Uso de cupón",
      crear_producto: "Crear producto",
      eliminar_producto: "Eliminar producto",
      otro: "Otro",
    };
    return mapa[accion] || accion;
  };

  const manejarCerrarSesion = () => {
    cerrarSesion();
    navegar("/");
  };

  // ===== SECCIONES DE NAVEGACIÓN =====
  const elementosNav = [
    { clave: "dashboard", icono: "📊", etiqueta: "Dashboard" },
    { clave: "usuarios", icono: "👥", etiqueta: "Usuarios" },
    { clave: "vendedores", icono: "🏪", etiqueta: "Vendedores" },
    { clave: "categorias", icono: "🏷️", etiqueta: "Categorías" },
    { clave: "auditoria", icono: "📋", etiqueta: "Auditoría" },
  ];

  // ===== RENDER: DASHBOARD =====
  const renderDashboard = () => {
    if (cargando && !kpis) {
      return (
        <div className="cargando-admin">
          <div className="spinner-admin"></div>
          <p>Cargando métricas...</p>
        </div>
      );
    }

    if (!kpis) return null;

    const { resumen, productosPorCategoria, topProductos, topVendedores } = kpis;
    const maximoCategoria = productosPorCategoria.length > 0
      ? Math.max(...productosPorCategoria.map((c) => c.count))
      : 1;

    return (
      <>
        <div className="encabezado-pagina-admin">
          <h1>Dashboard Administrativo</h1>
          <p>Resumen general de la plataforma</p>
        </div>

        {/* Tarjetas KPI */}
        <div className="cuadricula-kpi-admin">
          <div className="tarjeta-kpi-admin">
            <div className="icono-kpi-admin blue">👥</div>
            <div className="info-kpi-admin">
              <h3>{resumen.totalUsuarios}</h3>
              <p>Usuarios totales</p>
            </div>
          </div>
          <div className="tarjeta-kpi-admin">
            <div className="icono-kpi-admin green">🏪</div>
            <div className="info-kpi-admin">
              <h3>{resumen.totalVendedores}</h3>
              <p>Vendedores</p>
            </div>
          </div>
          <div className="tarjeta-kpi-admin">
            <div className="icono-kpi-admin purple">🛍️</div>
            <div className="info-kpi-admin">
              <h3>{resumen.totalClientes}</h3>
              <p>Clientes</p>
            </div>
          </div>
          <div className="tarjeta-kpi-admin">
            <div className="icono-kpi-admin orange">📦</div>
            <div className="info-kpi-admin">
              <h3>{resumen.totalProductos}</h3>
              <p>Productos</p>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="cuadricula-graficos-admin">
          {/* Productos por Categoría */}
          <div className="tarjeta-grafico-admin">
            <h3>📊 Productos por Categoría</h3>
            <div className="grafico-barras-admin">
              {productosPorCategoria.slice(0, 8).map((cat, i) => (
                <div className="item-barra-admin" key={cat._id}>
                  <span className="etiqueta-barra-admin">{cat._id}</span>
                  <div className="pista-barra-admin">
                    <div
                      className={`relleno-barra-admin ${["", "green", "purple", "orange"][i % 4]}`}
                      style={{ width: `${(cat.count / maximoCategoria) * 100}%` }}
                    >
                      <span className="valor-barra-admin">{cat.count}</span>
                    </div>
                  </div>
                </div>
              ))}
              {productosPorCategoria.length === 0 && (
                <div className="vacio-admin">
                  <span>📊</span>
                  <p>Aún no hay datos de categorías</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Vendedores */}
          <div className="tarjeta-grafico-admin">
            <h3>🏆 Top Vendedores</h3>
            <div className="lista-ranking-admin">
              {topVendedores.slice(0, 5).map((v, i) => (
                <div className="item-ranking-admin" key={v._id}>
                  <div className={`pos-ranking-admin ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""}`}>
                    {i + 1}
                  </div>
                  <div className="info-ranking-admin">
                    <strong>{v.nombre}</strong>
                    <span>{v.totalProductos} productos · {v.totalStock} stock</span>
                  </div>
                </div>
              ))}
              {topVendedores.length === 0 && (
                <div className="vacio-admin">
                  <span>🏆</span>
                  <p>Aún no hay vendedores</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Productos */}
          <div className="tarjeta-grafico-admin">
            <h3>⭐ Top Productos (por stock)</h3>
            <div className="lista-ranking-admin">
              {topProductos.slice(0, 5).map((p, i) => (
                <div className="item-ranking-admin" key={p._id}>
                  <div className={`pos-ranking-admin ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""}`}>
                    {i + 1}
                  </div>
                  <div className="info-ranking-admin">
                    <strong>{p.name}</strong>
                    <span>{p.category} · ₡{p.price?.toLocaleString()}</span>
                  </div>
                  <div className="valor-ranking-admin">
                    {p.stock} uds
                  </div>
                </div>
              ))}
              {topProductos.length === 0 && (
                <div className="vacio-admin">
                  <span>⭐</span>
                  <p>Aún no hay productos</p>
                </div>
              )}
            </div>
          </div>

          {/* Distribución de Usuarios */}
          <div className="tarjeta-grafico-admin">
            <h3>📈 Distribución de Usuarios</h3>
            <div className="grafico-barras-admin">
              <div className="item-barra-admin">
                <span className="etiqueta-barra-admin">Clientes</span>
                <div className="pista-barra-admin">
                  <div
                    className="relleno-barra-admin green"
                    style={{ width: `${resumen.totalUsuarios > 0 ? (resumen.totalClientes / resumen.totalUsuarios) * 100 : 0}%` }}
                  >
                    <span className="valor-barra-admin">{resumen.totalClientes}</span>
                  </div>
                </div>
              </div>
              <div className="item-barra-admin">
                <span className="etiqueta-barra-admin">Vendedores</span>
                <div className="pista-barra-admin">
                  <div
                    className="relleno-barra-admin"
                    style={{ width: `${resumen.totalUsuarios > 0 ? (resumen.totalVendedores / resumen.totalUsuarios) * 100 : 0}%` }}
                  >
                    <span className="valor-barra-admin">{resumen.totalVendedores}</span>
                  </div>
                </div>
              </div>
              <div className="item-barra-admin">
                <span className="etiqueta-barra-admin">Admins</span>
                <div className="pista-barra-admin">
                  <div
                    className="relleno-barra-admin purple"
                    style={{ width: `${resumen.totalUsuarios > 0 ? ((resumen.totalUsuarios - resumen.totalClientes - resumen.totalVendedores) / resumen.totalUsuarios) * 100 : 0}%` }}
                  >
                    <span className="valor-barra-admin">{resumen.totalUsuarios - resumen.totalClientes - resumen.totalVendedores}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // ===== RENDER: USUARIOS =====
  const renderUsuarios = () => (
    <>
      <div className="encabezado-pagina-admin">
        <h1>Gestión de Usuarios</h1>
        <p>Crear, listar, asignar roles y desactivar usuarios</p>
      </div>

      <div className="contenedor-tabla-admin">
        <div className="encabezado-tabla-admin">
          <h3>👥 Usuarios ({usuariosFiltrados.length})</h3>
          <div className="acciones-tabla-admin">
            <input
              className="entrada-busqueda-admin"
              type="text"
              placeholder="🔍 Buscar usuario..."
              value={buscarUsuario}
              onChange={(e) => setBuscarUsuario(e.target.value)}
            />
            <button
              className="boton-primario-admin"
              onClick={() => {
                setFormularioUsuario({ nombre: "", email: "", password: "", role: "cliente" });
                setMostrarModalUsuario(true);
              }}
            >
              ➕ Nuevo Usuario
            </button>
          </div>
        </div>

        {cargando ? (
          <div className="cargando-admin">
            <div className="spinner-admin"></div>
            <p>Cargando usuarios...</p>
          </div>
        ) : (
          <table className="tabla-admin">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="info-usuario-admin">
                      <div className="avatar-admin">{obtenerIniciales(u.nombre)}</div>
                      <div className="detalles-usuario-admin">
                        <strong>{u.nombre}</strong>
                        <span>{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`insignia-admin ${u.role === "administrador" ? "admin" : u.role}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`insignia-admin ${u.activo !== false ? "activo" : "inactivo"}`}>
                      {u.activo !== false ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="fecha-auditoria-admin">{formatearFecha(u.createdAt)}</td>
                  <td>
                    <div className="botones-accion-admin">
                      <button
                        className="boton-accion-admin"
                        onClick={() => {
                          setUsuarioSeleccionado(u);
                          setNuevoRol(u.role);
                          setMostrarModalRol(true);
                        }}
                        title="Asignar rol"
                      >
                        🔑
                      </button>
                      <button
                        className={`boton-accion-admin ${u.activo !== false ? "danger" : "success"}`}
                        onClick={() => manejarCambiarEstadoUsuario(u._id, u.activo !== false)}
                        title={u.activo !== false ? "Desactivar" : "Activar"}
                      >
                        {u.activo !== false ? "🚫" : "✅"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="5">
                    <div className="vacio-admin">
                      <span>👤</span>
                      <p>No se encontraron usuarios</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );

  // ===== RENDER: VENDEDORES =====
  const renderVendedores = () => (
    <>
      <div className="encabezado-pagina-admin">
        <h1>Gestión de Vendedores</h1>
        <p>Aprobar, suspender y ver métricas por vendedor</p>
      </div>

      <div className="contenedor-tabla-admin">
        <div className="encabezado-tabla-admin">
          <h3>🏪 Vendedores ({vendedoresFiltrados.length})</h3>
          <div className="acciones-tabla-admin">
            <input
              className="entrada-busqueda-admin"
              type="text"
              placeholder="🔍 Buscar vendedor..."
              value={buscarVendedor}
              onChange={(e) => setBuscarVendedor(e.target.value)}
            />
          </div>
        </div>

        {cargando ? (
          <div className="cargando-admin">
            <div className="spinner-admin"></div>
            <p>Cargando vendedores...</p>
          </div>
        ) : (
          <table className="tabla-admin">
            <thead>
              <tr>
                <th>Vendedor</th>
                <th>Estado</th>
                <th>Métricas</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vendedoresFiltrados.map((v) => (
                <tr key={v._id}>
                  <td>
                    <div className="info-usuario-admin">
                      <div className="avatar-admin">{obtenerIniciales(v.nombre)}</div>
                      <div className="detalles-usuario-admin">
                        <strong>{v.nombre}</strong>
                        <span>{v.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`insignia-admin ${v.activo !== false ? "activo" : "suspendido"}`}>
                      {v.activo !== false ? "Activo" : "Suspendido"}
                    </span>
                  </td>
                  <td>
                    <div className="metricas-vendedor-admin">
                      <span className="pildora-metrica-admin">📦 {v.metricas?.totalProductos || 0}</span>
                      <span className="pildora-metrica-admin">📊 {v.metricas?.totalStock || 0} stock</span>
                      <span className="pildora-metrica-admin">💰 ₡{(v.metricas?.precioPromedio || 0).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="fecha-auditoria-admin">{formatearFecha(v.createdAt)}</td>
                  <td>
                    <div className="botones-accion-admin">
                      {v.activo === false ? (
                        <button
                          className="boton-accion-admin success"
                          onClick={() => manejarAprobarVendedor(v._id)}
                          title="Aprobar"
                        >
                          ✅ Aprobar
                        </button>
                      ) : (
                        <button
                          className="boton-accion-admin danger"
                          onClick={() => manejarSuspenderVendedor(v._id)}
                          title="Suspender"
                        >
                          ⛔ Suspender
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {vendedoresFiltrados.length === 0 && (
                <tr>
                  <td colSpan="5">
                    <div className="vacio-admin">
                      <span>🏪</span>
                      <p>No se encontraron vendedores</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );

  // ===== RENDER: CATEGORÍAS =====
  const renderCategorias = () => (
    <>
      <div className="encabezado-pagina-admin">
        <h1>Gestión de Categorías</h1>
        <p>Crear, editar, activar y desactivar categorías</p>
      </div>

      <div className="contenedor-tabla-admin">
        <div className="encabezado-tabla-admin">
          <h3>🏷️ Categorías ({categorias.length})</h3>
          <div className="acciones-tabla-admin">
            <button
              className="boton-primario-admin"
              onClick={() => {
                setCategoriaEditando(null);
                setFormularioCategoria({ nombre: "", descripcion: "" });
                setMostrarModalCategoria(true);
              }}
            >
              ➕ Nueva Categoría
            </button>
          </div>
        </div>

        {cargando ? (
          <div className="cargando-admin">
            <div className="spinner-admin"></div>
            <p>Cargando categorías...</p>
          </div>
        ) : (
          <table className="tabla-admin">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((cat) => (
                <tr key={cat._id}>
                  <td><strong>{cat.nombre}</strong></td>
                  <td className="detalles-auditoria-admin">{cat.descripcion || "—"}</td>
                  <td>
                    <span className={`insignia-admin ${cat.activa ? "activo" : "inactivo"}`}>
                      {cat.activa ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="fecha-auditoria-admin">{formatearFecha(cat.createdAt)}</td>
                  <td>
                    <div className="botones-accion-admin">
                      <button
                        className="boton-accion-admin"
                        onClick={() => {
                          setCategoriaEditando(cat);
                          setFormularioCategoria({ nombre: cat.nombre, descripcion: cat.descripcion || "" });
                          setMostrarModalCategoria(true);
                        }}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className={`boton-accion-admin ${cat.activa ? "warning" : "success"}`}
                        onClick={() => manejarAlternarCategoria(cat._id)}
                        title={cat.activa ? "Desactivar" : "Activar"}
                      >
                        {cat.activa ? "⏸️" : "▶️"}
                      </button>
                      <button
                        className="boton-accion-admin danger"
                        onClick={() => manejarEliminarCategoria(cat._id)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categorias.length === 0 && (
                <tr>
                  <td colSpan="5">
                    <div className="vacio-admin">
                      <span>🏷️</span>
                      <p>No hay categorías registradas</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );

  // ===== RENDER: AUDITORÍA =====
  const renderAuditoria = () => (
    <>
      <div className="encabezado-pagina-admin">
        <h1>Auditoría</h1>
        <p>Registro de acciones críticas del sistema</p>
      </div>

      {/* Filtros */}
      <div className="filtros-admin">
        <div className="grupo-filtro-admin">
          <label>Tipo de Acción</label>
          <select
            value={filtrosAuditoria.accion}
            onChange={(e) => setFiltrosAuditoria({ ...filtrosAuditoria, accion: e.target.value })}
          >
            <option value="">Todas</option>
            <option value="crear_usuario">Crear usuario</option>
            <option value="desactivar_usuario">Desactivar usuario</option>
            <option value="activar_usuario">Activar usuario</option>
            <option value="asignar_rol">Asignar rol</option>
            <option value="aprobar_vendedor">Aprobar vendedor</option>
            <option value="suspender_vendedor">Suspender vendedor</option>
            <option value="crear_categoria">Crear categoría</option>
            <option value="editar_categoria">Editar categoría</option>
            <option value="activar_categoria">Activar categoría</option>
            <option value="desactivar_categoria">Desactivar categoría</option>
            <option value="eliminar_categoria">Eliminar categoría</option>
          </select>
        </div>
        <div className="grupo-filtro-admin">
          <label>Entidad</label>
          <select
            value={filtrosAuditoria.entidad}
            onChange={(e) => setFiltrosAuditoria({ ...filtrosAuditoria, entidad: e.target.value })}
          >
            <option value="">Todas</option>
            <option value="usuario">Usuario</option>
            <option value="vendedor">Vendedor</option>
            <option value="categoria">Categoría</option>
            <option value="producto">Producto</option>
            <option value="orden">Orden</option>
            <option value="cupon">Cupón</option>
          </select>
        </div>
        <div className="grupo-filtro-admin">
          <label>Fecha Desde</label>
          <input
            type="date"
            value={filtrosAuditoria.fechaDesde}
            onChange={(e) => setFiltrosAuditoria({ ...filtrosAuditoria, fechaDesde: e.target.value })}
          />
        </div>
        <div className="grupo-filtro-admin">
          <label>Fecha Hasta</label>
          <input
            type="date"
            value={filtrosAuditoria.fechaHasta}
            onChange={(e) => setFiltrosAuditoria({ ...filtrosAuditoria, fechaHasta: e.target.value })}
          />
        </div>
        <button
          className="boton-filtro-admin"
          onClick={() => cargarAuditoria(1)}
        >
          🔍 Filtrar
        </button>
        <button
          className="boton-filtro-admin"
          onClick={() => {
            setFiltrosAuditoria({ usuario: "", accion: "", entidad: "", fechaDesde: "", fechaHasta: "" });
            setTimeout(() => cargarAuditoria(1), 100);
          }}
        >
          🔄 Limpiar
        </button>
      </div>

      <div className="contenedor-tabla-admin">
        <div className="encabezado-tabla-admin">
          <h3>📋 Registros de Auditoría ({paginacionAuditoria.total})</h3>
        </div>

        {cargando ? (
          <div className="cargando-admin">
            <div className="spinner-admin"></div>
            <p>Cargando registros...</p>
          </div>
        ) : (
          <>
            <table className="tabla-admin">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Entidad</th>
                  <th>Detalles</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {registrosAuditoria.map((registro) => (
                  <tr key={registro._id}>
                    <td>
                      <div className="info-usuario-admin">
                        <div className="avatar-admin">{obtenerIniciales(registro.usuarioNombre)}</div>
                        <div className="detalles-usuario-admin">
                          <strong>{registro.usuarioNombre}</strong>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="insignia-admin vendedor">
                        {formatearAccion(registro.accion)}
                      </span>
                    </td>
                    <td>
                      <span className="insignia-admin cliente" style={{ textTransform: "capitalize" }}>
                        {registro.entidad}
                      </span>
                    </td>
                    <td className="detalles-auditoria-admin" title={registro.detalles}>
                      {registro.detalles || "—"}
                    </td>
                    <td className="fecha-auditoria-admin">{formatearFecha(registro.createdAt)}</td>
                  </tr>
                ))}
                {registrosAuditoria.length === 0 && (
                  <tr>
                    <td colSpan="5">
                      <div className="vacio-admin">
                        <span>📋</span>
                        <p>No se encontraron registros de auditoría</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Paginación */}
            {paginacionAuditoria.totalPaginas > 1 && (
              <div className="paginacion-admin">
                <button
                  className="boton-pagina-admin"
                  disabled={paginacionAuditoria.paginaActual === 1}
                  onClick={() => cargarAuditoria(paginacionAuditoria.paginaActual - 1)}
                >
                  ← Anterior
                </button>
                {Array.from({ length: paginacionAuditoria.totalPaginas }, (_, i) => i + 1)
                  .filter((p) =>
                    p === 1 ||
                    p === paginacionAuditoria.totalPaginas ||
                    Math.abs(p - paginacionAuditoria.paginaActual) <= 2
                  )
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ color: "#9ca3af" }}>...</span>}
                      <button
                        className={`boton-pagina-admin ${paginacionAuditoria.paginaActual === p ? "activo" : ""}`}
                        onClick={() => cargarAuditoria(p)}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  className="boton-pagina-admin"
                  disabled={paginacionAuditoria.paginaActual === paginacionAuditoria.totalPaginas}
                  onClick={() => cargarAuditoria(paginacionAuditoria.paginaActual + 1)}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );

  // ===== RENDER PRINCIPAL =====
  return (
    <div className={`contenedor-admin ${!esModoOscuro ? "modo-claro" : ""}`}>
      {/* Notificación */}
      {notificacion && (
        <div className={`notificacion-admin ${notificacion.tipo}`}>
          {notificacion.tipo === "success" ? "✅" : "❌"} {notificacion.mensaje}
        </div>
      )}

      {/* Barra lateral */}
      <aside className="barra-lateral-admin">
        <div className="marca-barra-lateral-admin">
          <span>⚡</span>
          <h2>Nexora Admin</h2>
        </div>

        <nav className="nav-admin">
          {elementosNav.map((elemento) => (
            <button
              key={elemento.clave}
              className={`item-nav-admin ${seccionActiva === elemento.clave ? "activo" : ""}`}
              onClick={() => setSeccionActiva(elemento.clave)}
            >
              <span>{elemento.icono}</span>
              <span>{elemento.etiqueta}</span>
            </button>
          ))}
        </nav>

        <div className="pie-barra-lateral-admin">
          <button className="boton-tema-admin" onClick={alternarTema}>
            <span>{esModoOscuro ? "☀️" : "🌙"}</span>
            <span>{esModoOscuro ? "Modo Claro" : "Modo Oscuro"}</span>
          </button>
          <button className="boton-cerrar-sesion-admin" onClick={manejarCerrarSesion}>
            <span>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="principal-admin">
        {seccionActiva === "dashboard" && renderDashboard()}
        {seccionActiva === "usuarios" && renderUsuarios()}
        {seccionActiva === "vendedores" && renderVendedores()}
        {seccionActiva === "categorias" && renderCategorias()}
        {seccionActiva === "auditoria" && renderAuditoria()}
      </main>

      {/* ===== MODAL: Crear Usuario ===== */}
      {mostrarModalUsuario && (
        <div className="superposicion-modal-admin">
          <div className="modal-admin">
            <div className="encabezado-modal-admin">
              <h2>➕ Nuevo Usuario</h2>
              <button className="cerrar-modal-admin" onClick={() => setMostrarModalUsuario(false)}>×</button>
            </div>
            <form className="formulario-admin" onSubmit={manejarCrearUsuario}>
              <div className="grupo-formulario-admin">
                <label>Nombre completo</label>
                <input
                  type="text"
                  value={formularioUsuario.nombre}
                  onChange={(e) => setFormularioUsuario({ ...formularioUsuario, nombre: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>
              <div className="grupo-formulario-admin">
                <label>Email</label>
                <input
                  type="email"
                  value={formularioUsuario.email}
                  onChange={(e) => setFormularioUsuario({ ...formularioUsuario, email: e.target.value })}
                  placeholder="usuario@example.com"
                  required
                />
              </div>
              <div className="fila-formulario-admin">
                <div className="grupo-formulario-admin">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    value={formularioUsuario.password}
                    onChange={(e) => setFormularioUsuario({ ...formularioUsuario, password: e.target.value })}
                    placeholder="Mín. 6 caracteres"
                    minLength={6}
                    required
                  />
                </div>
                <div className="grupo-formulario-admin">
                  <label>Rol</label>
                  <select
                    value={formularioUsuario.role}
                    onChange={(e) => setFormularioUsuario({ ...formularioUsuario, role: e.target.value })}
                  >
                    <option value="cliente">Cliente</option>
                    <option value="vendedor">Vendedor</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
              </div>
              <div className="acciones-formulario-admin">
                <button type="button" className="boton-cancelar-admin" onClick={() => setMostrarModalUsuario(false)}>
                  Cancelar
                </button>
                <button type="submit" className="boton-enviar-admin">
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: Asignar Rol ===== */}
      {mostrarModalRol && usuarioSeleccionado && (
        <div className="superposicion-modal-admin">
          <div className="modal-admin">
            <div className="encabezado-modal-admin">
              <h2>🔑 Asignar Rol</h2>
              <button className="cerrar-modal-admin" onClick={() => setMostrarModalRol(false)}>×</button>
            </div>
            <div className="formulario-admin">
              <p style={{ color: "#9ca3af", margin: "0 0 16px 0" }}>
                Cambiar rol de <strong style={{ color: "var(--admin-azul)" }}>{usuarioSeleccionado.nombre}</strong>
              </p>
              <div className="grupo-formulario-admin">
                <label>Nuevo Rol</label>
                <select value={nuevoRol} onChange={(e) => setNuevoRol(e.target.value)}>
                  <option value="cliente">Cliente</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
              <div className="acciones-formulario-admin">
                <button className="boton-cancelar-admin" onClick={() => setMostrarModalRol(false)}>
                  Cancelar
                </button>
                <button className="boton-enviar-admin" onClick={manejarAsignarRol}>
                  Guardar Rol
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: Categoría (Crear / Editar) ===== */}
      {mostrarModalCategoria && (
        <div className="superposicion-modal-admin">
          <div className="modal-admin">
            <div className="encabezado-modal-admin">
              <h2>{categoriaEditando ? "✏️ Editar Categoría" : "➕ Nueva Categoría"}</h2>
              <button className="cerrar-modal-admin" onClick={() => setMostrarModalCategoria(false)}>×</button>
            </div>
            <form className="formulario-admin" onSubmit={manejarGuardarCategoria}>
              <div className="grupo-formulario-admin">
                <label>Nombre</label>
                <input
                  type="text"
                  value={formularioCategoria.nombre}
                  onChange={(e) => setFormularioCategoria({ ...formularioCategoria, nombre: e.target.value })}
                  placeholder="Ej: Computadoras"
                  required
                />
              </div>
              <div className="grupo-formulario-admin">
                <label>Descripción (opcional)</label>
                <textarea
                  value={formularioCategoria.descripcion}
                  onChange={(e) => setFormularioCategoria({ ...formularioCategoria, descripcion: e.target.value })}
                  placeholder="Descripción breve de la categoría..."
                  rows="3"
                />
              </div>
              <div className="acciones-formulario-admin">
                <button type="button" className="boton-cancelar-admin" onClick={() => setMostrarModalCategoria(false)}>
                  Cancelar
                </button>
                <button type="submit" className="boton-enviar-admin">
                  {categoriaEditando ? "Guardar Cambios" : "Crear Categoría"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
