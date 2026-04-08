import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";

/**
 * Custom hook que centraliza todo el estado y lógica de datos del Vendedor.
 * Extrae la lógica de negocio fuera del componente visual principal.
 */
export default function useVendedorData() {
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

  const [categories, setCategories] = useState(["Todos"]);

  // ===== CONSTANTES =====
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
          topProductos: data.topProductos || [],
          productosStockBajoLista: data.lowStockProducts || [],
          ventasPorMes: data.ventasPorMes || [],
          ordenesPorEstado: data.ordenesPorEstado || {
            paid: 0,
            packed: 0,
            shipped: 0,
            delivered: 0,
          },
        });
      }
    } catch (err) {
      console.error("Error al cargar KPIs:", err);
      try {
        const response = await api.get("/products/vendor/me");
        if (response.data.success) {
          const prods = response.data.data;
          const activos = prods.filter((p) => p.isActive !== false);
          const stockBajo = prods.filter(
            (p) =>
              p.stock <= (p.lowStockThreshold || stockThreshold) &&
              p.isActive !== false,
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
      const response = await api.get("/categories");
      if (response.data.success) {
        const catNames = response.data.data
          .filter((c) => c.activa)
          .map((c) => c.nombre);
        setCategories(["Todos", ...catNames]);
      }
    } catch (err) {
      console.error("Error al cargar categorias:", err);
    }
  }, []);

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  useEffect(() => {
    switch (seccionActiva) {
      case "dashboard":
        cargarKPIs();
        cargarOrdenes();
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
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
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
          product.active === false ? "Producto activado" : "Producto desactivado",
        );
      }
    } catch (err) {
      try {
        const submitData = new FormData();
        submitData.append("active", product.active === false ? true : false);
        await api.put(`/products/${product._id}`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        cargarProductos();
        mostrarNotificacion(
          product.active === false ? "Producto activado" : "Producto desactivado",
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
    setSeccionActiva("detalleOrden");
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

  return {
    // Estado general
    seccionActiva, setSeccionActiva,
    notificacion,
    cargando,
    menuAbierto, setMenuAbierto,
    // Dashboard
    kpis,
    stockThreshold, setStockThreshold,
    etiquetasEstado,
    getStatusColor,
    ordenes,
    // Productos
    filteredProducts,
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    selectedCategory, setSelectedCategory,
    categories,
    isModalOpen, setIsModalOpen,
    editingProduct,
    formData,
    imageFiles,
    imagePreviews,
    existingImages,
    handleInputChange,
    handleFileSelect,
    removeNewImage,
    removeExistingImage,
    openAddModal,
    openEditModal,
    handleSubmit,
    handleDelete,
    handleToggleProduct,
    handleUpdateStock,
    // Órdenes
    ordenesFiltradas,
    filtroEstadoOrden, setFiltroEstadoOrden,
    ordenSeleccionada,
    historialOrden,
    estadosOrden,
    cargarOrdenes,
    verDetalleOrden,
    // Utilidades
    formatearFecha,
    mostrarNotificacion,
  };
}
