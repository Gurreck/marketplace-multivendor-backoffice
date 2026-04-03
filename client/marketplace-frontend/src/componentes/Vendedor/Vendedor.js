import React, { useState, useEffect, useCallback } from "react";
import "./Vendedor.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  PlusCircle,
  Pencil,
  Trash2,
  X,
  UploadCloud,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  Tag,
  Boxes,
  Briefcase,
  Moon,
  Sun,
  LogOut,
  Menu,
  Search,
  BarChart3,
  TrendingUp,
  Clock,
  PackageCheck,
  Eye,
  ArrowLeft,
  ChevronRight,
  RefreshCcw,
  XCircle,
  Truck,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  User,
} from "lucide-react";
import PerfilVendedor from "../Perfil/PerfilVendedor";

export default function Vendedor() {
  const navegar = useNavigate();
  const { logout: cerrarSesion, user } = useAuth();
  const { isDarkMode: esModoOscuro, toggleTheme: alternarTema } = useTheme();

  // ===== ESTADO GENERAL =====
  const [seccionActiva, setSeccionActiva] = useState("dashboard");
  const [notificacion, setNotificacion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  // ===== DASHBOARD =====
  const [kpis, setKpis] = useState(null);

  // ===== PRODUCTOS =====
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [stockThreshold, setStockThreshold] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    stock: "",
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // ===== ÓRDENES =====
  const [ordenes, setOrdenes] = useState([]);
  const [filtroEstadoOrden, setFiltroEstadoOrden] = useState("todas");
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [historialOrden, setHistorialOrden] = useState([]);
  const [comentarioEstado, setComentarioEstado] = useState("");

  const [categories, setCategories] = useState(["Todos"]);

  const estadosOrden = ["created", "paid", "packed", "shipped", "delivered"];
  const etiquetasEstado = {
    created: "Creada",
    paid: "Pagada",
    packed: "Empacada",
    shipped: "Enviada",
    delivered: "Entregada",
  };

  // ===== NOTIFICACIONES =====
  const mostrarNotificacion = (mensaje, tipo = "success") => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3500);
  };

  // ===== CARGA DE DATOS =====
  const cargarKPIs = useCallback(async () => {
    try {
      setCargando(true);
      const response = await api.get("/vendor/dashboard");
      if (response.data.success) {
        const data = response.data.data;
        setKpis({
          ventasTotales: data.ventasTotales || 0,
          ordenesTotales: data.totalOrdenes || 0,
          ordenesPendientes: data.ordenesPendientes || 0,
          productosActivos: data.productosActivos || 0,
          productosStockBajo: data.lowStockProducts?.length || 0,
          topProductos: [],
          productosStockBajoLista: data.lowStockProducts || [],
          ventasPorMes: data.ventasPorMes || [],
          ordenesPorEstado: {
            paid: 0,
            packed: 0,
            shipped: 0,
            delivered: 0,
          },
        });
      }
    } catch (err) {
      console.error("Error al cargar KPIs:", err);
      // Fallback: simular KPIs desde productos
      try {
        const response = await api.get("/products/vendor/me");
        if (response.data.success) {
          const prods = response.data.data;
          const activos = prods.filter((p) => p.isActive !== false);
          const stockBajo = prods.filter(
            (p) => p.stock <= (p.lowStockThreshold || stockThreshold) && p.isActive !== false,
          );
          setKpis({
            ventasTotales: 0,
            ordenesTotales: 0,
            ordenesPendientes: 0,
            productosActivos: activos.length,
            productosStockBajo: stockBajo.length,
            topProductos: [],
            productosStockBajoLista: stockBajo.slice(0, 10),
            ventasPorMes: [],
            ordenesPorEstado: { paid: 0, packed: 0, shipped: 0, delivered: 0 },
          });
        }
      } catch (fallbackErr) {
        console.error("Fallback KPI also failed:", fallbackErr);
      }
    } finally {
      setCargando(false);
    }
  }, [stockThreshold]);

  const cargarProductos = useCallback(async () => {
    try {
      setCargando(true);
      const response = await api.get("/products/vendor/me");
      if (response.data.success) {
        const sorted = [...response.data.data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setProducts(sorted);
      }
    } catch (err) {
      console.error("Error al cargar productos:", err);
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarOrdenes = useCallback(async () => {
    try {
      setCargando(true);
      const response = await api.get("/vendor/orders");
      if (response.data.success) {
        // Mapear campos del backend (inglés) a nombres que usa la UI (español)
        const ordenesMapeadas = (response.data.data || []).map((o) => ({
          ...o,
          estado: o.status || o.estado,
          cliente: o.user || o.cliente,
          historial: (o.statusHistory || []).map((h) => ({
            de: h.estado,
            a: h.estado,
            comentario: h.comentario,
            fecha: h.fecha,
            usuario: h.usuarioQueCambio?.nombre || "",
          })),
          itemsPropios: o.items?.length || 0,
        }));
        setOrdenes(ordenesMapeadas);
      }
    } catch (err) {
      console.error("Error al cargar órdenes:", err);
      setOrdenes([]);
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarCategorias = useCallback(async () => {
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        const catNames = response.data.data
          .filter(c => c.activa)
          .map(c => c.nombre);
        setCategories(['Todos', ...catNames]);
      }
    } catch (err) {
      console.error('Error al cargar categorias:', err);
    }
  }, []);

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  useEffect(() => {
    switch (seccionActiva) {
      case "dashboard":
        cargarKPIs();
        break;
      case "productos":
        cargarProductos();
        break;
      case "ordenes":
        cargarOrdenes();
        break;
      default:
        break;
    }
  }, [seccionActiva, cargarKPIs, cargarProductos, cargarOrdenes]);

  // ===== ACCIONES: PRODUCTOS =====
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const totalImages = imageFiles.length + files.length;
    if (totalImages > 5) {
      alert("Máximo 5 imágenes permitidas.");
      return;
    }

    setImageFiles((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeNewImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      category: categories.length > 1 ? categories[1] : "",
      brand: "",
      stock: "0",
    });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand || "",
      stock: product.stock,
    });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages(product.images || []);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (imageFiles.length === 0 && existingImages.length === 0) {
        alert("Debes incluir al menos una imagen.");
        return;
      }

      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("price", Number(formData.price));
      submitData.append("stock", Number(formData.stock));
      submitData.append("category", formData.category);
      submitData.append("brand", formData.brand);

      imageFiles.forEach((file) => {
        submitData.append("images", file);
      });

      if (editingProduct) {
        const imagesToRemove = editingProduct.images.filter(
          (img) => !existingImages.some((e) => e.public_id === img.public_id),
        );
        submitData.append("removeImages", JSON.stringify(imagesToRemove));
      }

      let response;
      if (editingProduct) {
        response = await api.put(
          `/products/${editingProduct._id}`,
          submitData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
      } else {
        response = await api.post("/products", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response.data.success) {
        setIsModalOpen(false);
        cargarProductos();
        mostrarNotificacion(
          editingProduct
            ? "Producto actualizado con éxito"
            : "Producto creado con éxito",
        );
      }
    } catch (err) {
      console.error("Error saving product:", err);
      mostrarNotificacion(
        "Error al guardar el producto: " +
          (err.response?.data?.message || err.message),
        "error",
      );
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este producto?")
    ) {
      try {
        const response = await api.delete(`/products/${id}`);
        if (response.data.success) {
          cargarProductos();
          mostrarNotificacion("Producto eliminado");
        }
      } catch (err) {
        console.error("Error deleting product:", err);
        mostrarNotificacion("Error al eliminar el producto.", "error");
      }
    }
  };

  const handleToggleProduct = async (product) => {
    try {
      const response = await api.put(`/products/${product._id}/toggle`);
      if (response.data.success) {
        cargarProductos();
        mostrarNotificacion(
          product.active === false
            ? "Producto activado"
            : "Producto desactivado",
        );
      }
    } catch (err) {
      // Fallback: intentar actualizar con FormData
      try {
        const submitData = new FormData();
        submitData.append("active", product.active === false ? true : false);
        await api.put(`/products/${product._id}`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        cargarProductos();
        mostrarNotificacion(
          product.active === false
            ? "Producto activado"
            : "Producto desactivado",
        );
      } catch (err2) {
        mostrarNotificacion("Error al cambiar estado del producto", "error");
      }
    }
  };

  const handleUpdateStock = async (product, newStock) => {
    try {
      const submitData = new FormData();
      submitData.append("name", product.name);
      submitData.append("description", product.description);
      submitData.append("price", product.price);
      submitData.append("stock", Number(newStock));
      submitData.append("category", product.category);
      submitData.append("brand", product.brand || "");

      await api.put(`/products/${product._id}`, submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      cargarProductos();
      mostrarNotificacion("Stock actualizado");
    } catch (err) {
      mostrarNotificacion("Error al actualizar stock", "error");
    }
  };

  // ===== ACCIONES: ÓRDENES =====
  const verDetalleOrden = (orden) => {
    setOrdenSeleccionada(orden);
    setHistorialOrden(orden.historial || []);
    setComentarioEstado("");
    setSeccionActiva("detalleOrden");
  };

  const actualizarEstadoOrden = async (idOrden, nuevoEstado) => {
    try {
      // Usar la orden actual de la lista o la seleccionada para saber el estado anterior
      const ordenObjetivo = ordenSeleccionada || ordenes.find((o) => o._id === idOrden);
      const estadoAnterior = ordenObjetivo ? ordenObjetivo.estado : "";

      const response = await api.put(`/vendor/orders/${idOrden}/status`, {
        estado: nuevoEstado,
        comentario: comentarioEstado || `Avanzado a ${etiquetasEstado[nuevoEstado]}`,
      });
      
      if (response.data.success) {
        mostrarNotificacion(`Estado actualizado a "${etiquetasEstado[nuevoEstado]}"`);
        
        // Actualizar la orden seleccionada en detalle SOLO si estamos en esa vista
        if (ordenSeleccionada && ordenSeleccionada._id === idOrden) {
          const ordenActualizada = {
            ...ordenSeleccionada,
            estado: nuevoEstado,
            historial: [
              {
                de: estadoAnterior,
                a: nuevoEstado,
                comentario: comentarioEstado || `Avanzado a ${etiquetasEstado[nuevoEstado]}`,
                fecha: new Date().toISOString(),
                usuario: "Vendedor",
              },
              ...(ordenSeleccionada.historial || []),
            ],
          };
          setOrdenSeleccionada(ordenActualizada);
          setHistorialOrden(ordenActualizada.historial);
        }

        setComentarioEstado("");
        cargarOrdenes();
      }
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      // Extraer mensaje del servidor o usar uno genérico
      const mensaje = err.response?.data?.message || err.message || "Error al actualizar estado";
      mostrarNotificacion(mensaje, "error");
    }
  };

  // ===== FILTROS =====
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "Todos" || product.category === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "todos"
        ? true
        : filterStatus === "activos"
        ? product.active !== false
        : filterStatus === "inactivos"
        ? product.active === false
        : filterStatus === "stock_bajo"
        ? product.stock <= stockThreshold && product.active !== false
        : true;
    return matchesCategory && matchesSearch && matchesStatus;
  });

  const ordenesFiltradas = ordenes.filter((o) =>
    filtroEstadoOrden === "todas" ? true : o.estado === filtroEstadoOrden,
  );

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

  const obtenerSiguienteEstado = (estadoActual) => {
    const index = estadosOrden.indexOf(estadoActual);
    if (index < estadosOrden.length - 1) return estadosOrden[index + 1];
    return null;
  };

  const getStatusColor = (estado) => {
    const colores = {
      created: "",
      paid: "blue",
      packed: "orange",
      shipped: "purple",
      delivered: "green",
    };
    return colores[estado] || "";
  };

  const manejarCerrarSesion = () => {
    cerrarSesion();
    navegar("/");
  };

  // ===== SECCIONES DE NAVEGACIÓN =====
  const elementosNav = [
    {
      clave: "perfil",
      icono: <User size={20} />,
      etiqueta: "Perfil",
    },
    {
      clave: "dashboard",
      icono: <LayoutDashboard size={20} />,
      etiqueta: "Dashboard",
    },
    {
      clave: "productos",
      icono: <Package size={20} />,
      etiqueta: "Productos",
    },
    {
      clave: "ordenes",
      icono: <ShoppingCart size={20} />,
      etiqueta: "Órdenes",
    },
  ];

  // ===== RENDER: DASHBOARD =====
  const renderDashboard = () => {
    if (cargando && !kpis) {
      return (
        <div className="cargando-vend">
          <Loader2 className="animacion-giro" size={40} />
          <p>Cargando métricas...</p>
        </div>
      );
    }

    if (!kpis) return null;

    const maxVentas =
      kpis.topProductos.length > 0
        ? Math.max(...kpis.topProductos.map((p) => p.sold || 0))
        : 1;

    const totalOrdEstado = Object.values(kpis.ordenesPorEstado).reduce(
      (a, b) => a + b,
      0,
    );

    return (
      <>
        <div className="encabezado-pagina-vend">
          <h1>Dashboard del Vendedor</h1>
          <p>Resumen de tu tienda y métricas de rendimiento</p>
        </div>

        {/* KPIs */}
        <div className="cuadricula-kpi-vend">
          <div className="tarjeta-kpi-vend">
            <div className="icono-kpi-vend blue">
              <TrendingUp size={24} />
            </div>
            <div className="info-kpi-vend">
              <h3>₡{(kpis.ventasTotales || 0).toLocaleString()}</h3>
              <p>Ventas Totales</p>
            </div>
          </div>
          <div className="tarjeta-kpi-vend">
            <div className="icono-kpi-vend green">
              <ShoppingCart size={24} />
            </div>
            <div className="info-kpi-vend">
              <h3>{kpis.ordenesTotales}</h3>
              <p>Órdenes Totales</p>
            </div>
          </div>
          <div className="tarjeta-kpi-vend">
            <div className="icono-kpi-vend orange">
              <Clock size={24} />
            </div>
            <div className="info-kpi-vend">
              <h3>{kpis.ordenesPendientes}</h3>
              <p>Órdenes Pendientes</p>
            </div>
          </div>
          <div className="tarjeta-kpi-vend">
            <div className="icono-kpi-vend purple">
              <PackageCheck size={24} />
            </div>
            <div className="info-kpi-vend">
              <h3>{kpis.productosActivos}</h3>
              <p>Productos Activos</p>
            </div>
          </div>
          <div className="tarjeta-kpi-vend">
            <div className="icono-kpi-vend red">
              <AlertTriangle size={24} />
            </div>
            <div className="info-kpi-vend">
              <h3>{kpis.productosStockBajo}</h3>
              <p>Stock Bajo (&le;{stockThreshold})</p>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="cuadricula-graficos-vend">
          {/* Órdenes por Estado (Donut visual) */}
          <div className="tarjeta-grafico-vend">
            <h3>
              <BarChart3
                size={18}
                style={{ marginRight: "8px", verticalAlign: "middle" }}
              />
              Órdenes por Estado
            </h3>
            <div className="grafico-barras-vend">
              {Object.entries(kpis.ordenesPorEstado).map(
                ([estado, cantidad], i) => (
                  <div className="item-barra-vend" key={estado}>
                    <span className="etiqueta-barra-vend">
                      {etiquetasEstado[estado] || estado}
                    </span>
                    <div className="pista-barra-vend">
                      <div
                        className={`relleno-barra-vend ${getStatusColor(estado)}`}
                        style={{
                          width: `${totalOrdEstado > 0 ? (cantidad / totalOrdEstado) * 100 : 0}%`,
                        }}
                      >
                        <span className="valor-barra-vend">{cantidad}</span>
                      </div>
                    </div>
                  </div>
                ),
              )}
              {totalOrdEstado === 0 && (
                <div className="vacio-vend">
                  <ShoppingCart size={40} opacity={0.2} />
                  <p>Aún no hay datos de órdenes</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Productos más vendidos */}
          <div className="tarjeta-grafico-vend">
            <h3>
              <TrendingUp
                size={18}
                style={{ marginRight: "8px", verticalAlign: "middle" }}
              />
              Top Productos Más Vendidos
            </h3>
            <div className="grafico-barras-vend">
              {kpis.topProductos.map((p, i) => (
                <div className="item-barra-vend" key={p._id}>
                  <span className="etiqueta-barra-vend">{p.name}</span>
                  <div className="pista-barra-vend">
                    <div
                      className={`relleno-barra-vend ${["blue", "green", "purple", "orange", "red"][i % 5]}`}
                      style={{
                        width: `${maxVentas > 0 ? ((p.sold || 0) / maxVentas) * 100 : 0}%`,
                      }}
                    >
                      <span className="valor-barra-vend">{p.sold || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
              {kpis.topProductos.length === 0 && (
                <div className="vacio-vend">
                  <Package size={40} opacity={0.2} />
                  <p>Aún no hay productos</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tablas: Órdenes recientes y Stock bajo */}
        <div className="cuadricula-graficos-vend">
          <div className="tarjeta-grafico-vend">
            <h3>
              <ShoppingCart
                size={18}
                style={{ marginRight: "8px", verticalAlign: "middle" }}
              />
              Órdenes Recientes
            </h3>
            {ordenes.length > 0 ? (
              <table className="tabla-vend mini">
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenes.slice(0, 5).map((o) => (
                    <tr
                      key={o._id}
                      onClick={() => verDetalleOrden(o)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        <strong>#{o._id?.slice(-6)}</strong>
                      </td>
                      <td>
                        <span
                          className={`insignia-vend ${getStatusColor(o.estado)}`}
                        >
                          {etiquetasEstado[o.estado] || o.estado}
                        </span>
                      </td>
                      <td className="fecha-vend">
                        {formatearFecha(o.createdAt)}
                      </td>
                      <td className="monto-vend">
                        ₡{(o.total || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="vacio-vend">
                <ShoppingCart size={40} opacity={0.2} />
                <p>No hay órdenes recientes</p>
              </div>
            )}
          </div>

          <div className="tarjeta-grafico-vend">
            <h3>
              <AlertTriangle
                size={18}
                style={{ marginRight: "8px", verticalAlign: "middle" }}
              />
              Productos con Stock Bajo
            </h3>
            {kpis.productosStockBajoLista.length > 0 ? (
              <table className="tabla-vend mini">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Stock</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {kpis.productosStockBajoLista.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <strong>{p.name}</strong>
                      </td>
                      <td>
                        <span className="insignia-vend red">{p.stock}</span>
                      </td>
                      <td className="monto-vend">
                        ₡{p.price?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="vacio-vend">
                <PackageCheck size={40} opacity={0.2} />
                <p>No hay productos con stock bajo</p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  // ===== RENDER: PRODUCTOS =====
  const renderProductos = () => (
    <>
      <div className="encabezado-pagina-vend">
        <h1>Gestión de Productos</h1>
        <p>Crear, editar, activar/desactivar y gestionar stock</p>
      </div>

      <div className="contenedor-tabla-vend">
        <div className="encabezado-tabla-vend">
          <h3>
            <Package size={18} style={{ marginRight: "8px" }} />
            Mis Productos ({filteredProducts.length})
            {selectedCategory !== "Todos" && ` — ${selectedCategory}`}
          </h3>
          <div className="acciones-tabla-vend">
            <div className="contenedor-entrada-vend">
              <Search size={18} className="icono-entrada-vend" />
              <input
                className="entrada-busqueda-vend"
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="select-filtro-vend"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
              <option value="stock_bajo">Stock Bajo</option>
            </select>
            <button className="boton-primario-vend" onClick={openAddModal}>
              <PlusCircle size={18} style={{ marginRight: "8px" }} /> Nuevo
              Producto
            </button>
          </div>
        </div>

        <div className="filtros-categorias-vend">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`chip-categoria-vend ${selectedCategory === cat ? "activo" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="umbral-stock-vend">
          <AlertCircle size={14} />
          <span>Umbral stock bajo:</span>
          <input
            type="number"
            className="input-umbral-vend"
            value={stockThreshold}
            onChange={(e) => setStockThreshold(Number(e.target.value))}
            min="1"
          />
          <span>unidades</span>
        </div>

        {cargando ? (
          <div className="cargando-vend">
            <Loader2 className="animacion-giro" size={40} />
            <p>Cargando productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="vacio-vend" style={{ padding: "60px" }}>
            <Boxes size={48} opacity={0.3} />
            <p>No hay productos en esta selección</p>
            <button className="boton-primario-vend" onClick={openAddModal}>
              <PlusCircle size={18} style={{ marginRight: "8px" }} /> Agregar
              Producto
            </button>
          </div>
        ) : (
          <table className="tabla-vend">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="info-producto-vend">
                      <img
                        src={
                          product.images?.[0]?.url ||
                          "https://via.placeholder.com/40"
                        }
                        alt={product.name}
                        className="img-mini-producto"
                      />
                      <div className="detalles-producto-vend">
                        <strong>{product.name}</strong>
                        <span>
                          {product.description?.substring(0, 50)}...
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="insignia-vend blue">
                      {product.category}
                    </span>
                  </td>
                  <td className="monto-vend">
                    ₡{product.price?.toLocaleString()}
                  </td>
                  <td>
                    <div className="control-stock-vend">
                      <input
                        type="number"
                        className="input-stock-vend"
                        defaultValue={product.stock}
                        min="0"
                        onBlur={(e) => {
                          if (Number(e.target.value) !== product.stock) {
                            handleUpdateStock(product, e.target.value);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.target.blur();
                          }
                        }}
                      />
                      {product.stock <= stockThreshold &&
                        product.active !== false && (
                          <AlertTriangle
                            size={14}
                            color="#f59e0b"
                            title="Stock bajo"
                          />
                        )}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`insignia-vend ${product.active !== false ? "green" : "red"}`}
                    >
                      {product.active !== false ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <div className="botones-accion-vend">
                      <button
                        className="boton-accion-vend"
                        onClick={() => openEditModal(product)}
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className={`boton-accion-vend ${product.active !== false ? "warning" : "success"}`}
                        onClick={() => handleToggleProduct(product)}
                        title={
                          product.active !== false
                            ? "Desactivar"
                            : "Activar"
                        }
                      >
                        {product.active !== false ? (
                          <ToggleRight size={16} />
                        ) : (
                          <ToggleLeft size={16} />
                        )}
                      </button>
                      <button
                        className="boton-accion-vend danger"
                        onClick={() => handleDelete(product._id)}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
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

  // ===== RENDER: ÓRDENES =====
  const renderOrdenes = () => (
    <>
      <div className="encabezado-pagina-vend">
        <h1>Gestión de Órdenes</h1>
        <p>Órdenes que contienen tus productos</p>
      </div>

      <div className="contenedor-tabla-vend">
        <div className="encabezado-tabla-vend">
          <h3>
            <ShoppingCart size={18} style={{ marginRight: "8px" }} />
            Mis Órdenes ({ordenesFiltradas.length})
          </h3>
          <div className="acciones-tabla-vend">
            <select
              className="select-filtro-vend"
              value={filtroEstadoOrden}
              onChange={(e) => setFiltroEstadoOrden(e.target.value)}
            >
              <option value="todas">Todas</option>
              <option value="created">Creadas</option>
              <option value="paid">Pagadas</option>
              <option value="packed">Empacadas</option>
              <option value="shipped">Enviadas</option>
              <option value="delivered">Entregadas</option>
            </select>
            <button
              className="boton-secundario-vend"
              onClick={cargarOrdenes}
            >
              <RefreshCcw size={16} style={{ marginRight: "6px" }} />{" "}
              Actualizar
            </button>
          </div>
        </div>

        {cargando ? (
          <div className="cargando-vend">
            <Loader2 className="animacion-giro" size={40} />
            <p>Cargando órdenes...</p>
          </div>
        ) : ordenesFiltradas.length === 0 ? (
          <div className="vacio-vend" style={{ padding: "60px" }}>
            <ShoppingCart size={48} opacity={0.3} />
            <p>No hay órdenes disponibles</p>
          </div>
        ) : (
          <table className="tabla-vend">
            <thead>
              <tr>
                <th>Orden</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Ítems Propios</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenesFiltradas.map((orden) => (
                <tr key={orden._id}>
                  <td>
                    <strong>#{orden._id?.slice(-6)}</strong>
                  </td>
                  <td>
                    <div className="info-usuario-vend">
                      <strong>
                        {orden.cliente?.nombre || "Cliente"}
                      </strong>
                      <span>{orden.cliente?.email || ""}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`insignia-vend ${getStatusColor(orden.estado)}`}
                    >
                      {etiquetasEstado[orden.estado] || orden.estado}
                    </span>
                  </td>
                  <td>{orden.itemsPropios || 0}</td>
                  <td className="monto-vend">
                    ₡{(orden.total || 0).toLocaleString()}
                  </td>
                  <td className="fecha-vend">
                    {formatearFecha(orden.createdAt)}
                  </td>
                  <td>
                    <div className="botones-accion-vend">
                      <button
                        className="boton-accion-vend"
                        onClick={() => verDetalleOrden(orden)}
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                      {obtenerSiguienteEstado(orden.estado) && (
                        <button
                          className="boton-accion-vend success"
                          onClick={() =>
                            actualizarEstadoOrden(
                              orden._id,
                              obtenerSiguienteEstado(orden.estado),
                            )
                          }
                          title={`Avanzar a ${etiquetasEstado[obtenerSiguienteEstado(orden.estado)]}`}
                        >
                          <ChevronRight size={16} />
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

  // ===== RENDER: DETALLE DE ORDEN =====
  const renderDetalleOrden = () => {
    if (!ordenSeleccionada) return null;
    const orden = ordenSeleccionada;
    const siguienteEstado = obtenerSiguienteEstado(orden.estado);

    return (
      <>
        <div className="encabezado-pagina-vend" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            className="boton-volver-vend"
            onClick={() => setSeccionActiva("ordenes")}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>Detalle de Orden #{orden._id?.slice(-6)}</h1>
            <p>Vista detallada — Solo ítems propios</p>
          </div>
        </div>

        <div className="cuadricula-detalle-orden">
          {/* Info general */}
          <div className="tarjeta-grafico-vend">
            <h3>
              <ShoppingCart
                size={18}
                style={{ marginRight: "8px", verticalAlign: "middle" }}
              />
              Información General
            </h3>
            <div className="detalle-info-grid">
              <div className="detalle-info-item">
                <span className="detalle-label">ID Orden</span>
                <span className="detalle-valor">{orden._id}</span>
              </div>
              <div className="detalle-info-item">
                <span className="detalle-label">Cliente</span>
                <span className="detalle-valor">
                  {orden.cliente?.nombre || "—"}
                </span>
              </div>
              <div className="detalle-info-item">
                <span className="detalle-label">Email</span>
                <span className="detalle-valor">
                  {orden.cliente?.email || "—"}
                </span>
              </div>
              <div className="detalle-info-item">
                <span className="detalle-label">Fecha</span>
                <span className="detalle-valor">
                  {formatearFecha(orden.createdAt)}
                </span>
              </div>
              <div className="detalle-info-item">
                <span className="detalle-label">Estado</span>
                <span
                  className={`insignia-vend ${getStatusColor(orden.estado)}`}
                >
                  {etiquetasEstado[orden.estado] || orden.estado}
                </span>
              </div>
              <div className="detalle-info-item">
                <span className="detalle-label">Total</span>
                <span className="detalle-valor monto-vend">
                  ₡{(orden.total || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Progreso de estados */}
          <div className="tarjeta-grafico-vend">
            <h3>
              <Truck
                size={18}
                style={{ marginRight: "8px", verticalAlign: "middle" }}
              />
              Progreso del Envío
            </h3>
            <div className="progreso-estados-vend">
              {estadosOrden.map((est, i) => {
                const indexActual = estadosOrden.indexOf(orden.estado);
                const esCompletado = i <= indexActual;
                const esActual = i === indexActual;
                return (
                  <div
                    key={est}
                    className={`paso-estado-vend ${esCompletado ? "completado" : ""} ${esActual ? "actual" : ""}`}
                  >
                    <div className="circulo-estado-vend">
                      {esCompletado ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </div>
                    <span className="texto-estado-vend">
                      {etiquetasEstado[est]}
                    </span>
                    {i < estadosOrden.length - 1 && (
                      <div
                        className={`linea-estado-vend ${esCompletado && i < indexActual ? "completado" : ""}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actualizar estado */}
            {siguienteEstado && (
              <div className="actualizar-estado-vend">
                <textarea
                  className="textarea-estado-vend"
                  placeholder="Comentario (obligatorio para historial)..."
                  value={comentarioEstado}
                  onChange={(e) => setComentarioEstado(e.target.value)}
                  rows="2"
                  disabled={cargando}
                />
                <button
                  className="boton-primario-vend"
                  disabled={cargando}
                  onClick={async () => {
                    setCargando(true);
                    await actualizarEstadoOrden(orden._id, siguienteEstado);
                    setCargando(false);
                  }}
                  style={{ opacity: cargando ? 0.6 : 1, cursor: cargando ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronRight
                    size={18}
                    style={{ marginRight: "8px" }}
                  />
                  {cargando ? "Actualizando..." : `Avanzar a "${etiquetasEstado[siguienteEstado]}"`}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Ítems propios */}
        <div className="contenedor-tabla-vend" style={{ marginTop: "20px" }}>
          <div className="encabezado-tabla-vend">
            <h3>
              <Package size={18} style={{ marginRight: "8px" }} />
              Ítems Propios
            </h3>
          </div>
          {orden.items && orden.items.length > 0 ? (
            <table className="tabla-vend">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {orden.items.map((item, i) => (
                  <tr key={i}>
                    <td>
                      <strong>{item.nombre || item.name || "—"}</strong>
                    </td>
                    <td>{item.cantidad || item.quantity || 0}</td>
                    <td className="monto-vend">
                      ₡
                      {(
                        item.precioUnitario ||
                        item.price ||
                        0
                      ).toLocaleString()}
                    </td>
                    <td className="monto-vend">
                      ₡
                      {(
                        (item.precioUnitario || item.price || 0) *
                        (item.cantidad || item.quantity || 0)
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="vacio-vend" style={{ padding: "40px" }}>
              <Package size={40} opacity={0.2} />
              <p>No hay ítems en esta orden</p>
            </div>
          )}
        </div>

        {/* Historial de cambios */}
        <div
          className="contenedor-tabla-vend"
          style={{ marginTop: "20px" }}
        >
          <div className="encabezado-tabla-vend">
            <h3>
              <Clock size={18} style={{ marginRight: "8px" }} />
              Historial de Cambios
            </h3>
          </div>
          {historialOrden.length > 0 ? (
            <table className="tabla-vend">
              <thead>
                <tr>
                  <th>De</th>
                  <th>A</th>
                  <th>Comentario</th>
                  <th>Fecha</th>
                  <th>Usuario</th>
                </tr>
              </thead>
              <tbody>
                {historialOrden.map((h, i) => (
                  <tr key={i}>
                    <td>
                      <span
                        className={`insignia-vend ${getStatusColor(h.de)}`}
                      >
                        {etiquetasEstado[h.de] || h.de}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`insignia-vend ${getStatusColor(h.a)}`}
                      >
                        {etiquetasEstado[h.a] || h.a}
                      </span>
                    </td>
                    <td>{h.comentario || "—"}</td>
                    <td className="fecha-vend">
                      {formatearFecha(h.fecha)}
                    </td>
                    <td>{h.usuario || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="vacio-vend" style={{ padding: "40px" }}>
              <Clock size={40} opacity={0.2} />
              <p>No hay historial de cambios</p>
            </div>
          )}
        </div>
      </>
    );
  };

  // ===== RENDER PRINCIPAL =====
  return (
    <div
      className={`contenedor-vend ${!esModoOscuro ? "modo-claro" : ""}`}
    >
      {/* Notificación */}
      {notificacion && (
        <div className={`notificacion-vend ${notificacion.tipo}`}>
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
        className="boton-menu-movil-vend"
        onClick={() => setMenuAbierto(!menuAbierto)}
      >
        {menuAbierto ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Barra lateral */}
      <aside
        className={`barra-lateral-vend ${menuAbierto ? "abierta" : ""}`}
      >
        <div className="perfil-sidebar-vend" style={{ 
          padding: '24px 20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          borderBottom: '1px solid var(--vend-borde)',
          marginBottom: '10px'
        }}>
          <img 
              src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre || user?.email || 'V')}&background=0ea5e9&color=fff`} 
              alt="Perfil" 
              style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--vend-azul)' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--vend-texto)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user?.nombre || user?.email?.split('@')[0]}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--vend-texto-secundario)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.email}
              </span>
          </div>
        </div>

        <nav className="nav-vend">
          {elementosNav.map((elemento) => (
            <button
              key={elemento.clave}
              className={`item-nav-vend ${seccionActiva === elemento.clave || (seccionActiva === "detalleOrden" && elemento.clave === "ordenes") ? "activo" : ""}`}
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

        <div className="pie-barra-lateral-vend">
          <button className="boton-tema-vend" onClick={alternarTema}>
            <span>
              {esModoOscuro ? <Sun size={18} /> : <Moon size={18} />}
            </span>
            <span>
              {esModoOscuro ? "Modo Claro" : "Modo Oscuro"}
            </span>
          </button>
          <button
            className="boton-cerrar-sesion-vend"
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
      <main className="principal-vend">
        {seccionActiva === "perfil" && <PerfilVendedor />}
        {seccionActiva === "dashboard" && renderDashboard()}
        {seccionActiva === "productos" && renderProductos()}
        {seccionActiva === "ordenes" && renderOrdenes()}
        {seccionActiva === "detalleOrden" && renderDetalleOrden()}
      </main>

      {/* ===== MODAL: Crear/Editar Producto ===== */}
      {isModalOpen && (
        <div className="superposicion-modal-vend">
          <div className="modal-vend">
            <div className="encabezado-modal-vend">
              <h2>
                {editingProduct ? (
                  <>
                    <Pencil
                      size={20}
                      style={{ marginRight: "10px", verticalAlign: "middle" }}
                    />
                    Editar Producto
                  </>
                ) : (
                  <>
                    <PlusCircle
                      size={20}
                      style={{ marginRight: "10px", verticalAlign: "middle" }}
                    />
                    Subir Nuevo Producto
                  </>
                )}
              </h2>
              <button
                className="cerrar-modal-vend"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form className="formulario-vend" onSubmit={handleSubmit}>
              <div className="grupo-formulario-vend">
                <label>
                  <Briefcase size={14} style={{ marginRight: "6px" }} />{" "}
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ej: Laptop Dell XPS 15"
                  required
                />
              </div>

              <div className="grupo-formulario-vend">
                <label>Descripción</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe las características principales..."
                  rows="4"
                  required
                />
              </div>

              <div className="fila-formulario-vend">
                <div className="grupo-formulario-vend">
                  <label>Precio (₡)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="grupo-formulario-vend">
                  <label>
                    <Boxes size={14} style={{ marginRight: "6px" }} />{" "}
                    Stock Disponible
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="fila-formulario-vend">
                <div className="grupo-formulario-vend">
                  <label>
                    <Tag size={14} style={{ marginRight: "6px" }} />{" "}
                    Categoría
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {categories
                      .filter((c) => c !== "Todos")
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="grupo-formulario-vend">
                  <label>Marca (Opcional)</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="Ej: Dell, Sony..."
                  />
                </div>
              </div>

              <div className="grupo-formulario-vend">
                <label>
                  <ImageIcon size={14} style={{ marginRight: "6px" }} />{" "}
                  Imágenes del Producto
                </label>

                {existingImages.length > 0 && (
                  <div className="contenedor-vistas-previas-vend">
                    <p className="subtitulo-imagenes-vend">
                      Imágenes actuales:
                    </p>
                    <div className="cuadricula-vistas-previas-vend">
                      {existingImages.map((img, index) => (
                        <div
                          key={`existing-${index}`}
                          className="item-vista-previa-vend"
                        >
                          <img
                            src={img.url}
                            alt={`Existente ${index + 1}`}
                          />
                          <button
                            type="button"
                            className="boton-quitar-vista-previa-vend"
                            onClick={() => removeExistingImage(index)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {imagePreviews.length > 0 && (
                  <div className="contenedor-vistas-previas-vend">
                    <p className="subtitulo-imagenes-vend">
                      Nuevas imágenes:
                    </p>
                    <div className="cuadricula-vistas-previas-vend">
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={`new-${index}`}
                          className="item-vista-previa-vend"
                        >
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                          />
                          <button
                            type="button"
                            className="boton-quitar-vista-previa-vend"
                            onClick={() => removeNewImage(index)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="area-carga-archivos-vend">
                  <label className="boton-carga-archivos-vend">
                    <UploadCloud
                      size={20}
                      style={{ marginRight: "10px" }}
                    />
                    Seleccionar imágenes
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      multiple
                      onChange={handleFileSelect}
                      style={{ display: "none" }}
                    />
                  </label>
                  <span className="sugerencia-carga-vend">
                    Máx. 5 imágenes (JPEG, PNG, GIF, WebP) — 5MB c/u
                  </span>
                </div>
              </div>

              <div className="acciones-formulario-vend">
                <button
                  type="button"
                  className="boton-cancelar-vend"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="boton-enviar-vend">
                  {editingProduct
                    ? "Guardar Cambios"
                    : "Publicar Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
