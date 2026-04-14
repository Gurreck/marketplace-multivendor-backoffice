import { useState, useEffect, useCallback } from "react";
import api from "../../../services/api";
import useVendedorProductos from '../useVendedorProductos/useVendedorProductos';

/**
 * Custom hook que centraliza todo el estado y lógica de datos del Vendedor.
 * Compone hooks especializados para productos y órdenes.
 */
export default function useVendedorData() {
  // ===== ESTADO GENERAL =====
  const [seccionActiva, setSeccionActiva] = useState("dashboard");
  const [notificacion, setNotificacion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  // ===== DASHBOARD =====
  const [kpis, setKpis] = useState(null);

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

  // ===== HOOK DE PRODUCTOS =====
  const productosHook = useVendedorProductos({ mostrarNotificacion, categories });

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
            paid: 0, packed: 0, shipped: 0, delivered: 0,
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
            (p) => p.stock <= (p.lowStockThreshold || productosHook.stockThreshold) && p.isActive !== false,
          );
          setKpis({
            ventasTotales: 0, ordenesTotales: 0, ordenesPendientes: 0,
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
  }, [productosHook.stockThreshold]);

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
            de: h.estado, a: h.estado,
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
        productosHook.cargarProductos();
        break;
      case "ordenes":
        cargarOrdenes();
        break;
      default:
        break;
    }
  }, [seccionActiva, cargarKPIs, productosHook.cargarProductos, cargarOrdenes]);

  // ===== ACCIONES: ÓRDENES =====
  const verDetalleOrden = (orden) => {
    setOrdenSeleccionada(orden);
    setHistorialOrden(orden.historial || []);
    setSeccionActiva("detalleOrden");
  };

  // ===== FILTROS =====
  const ordenesFiltradas = ordenes.filter((o) =>
    filtroEstadoOrden === "todas" ? true : o.estado === filtroEstadoOrden,
  );

  // ===== UTILIDADES =====
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "—";
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-CR", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const getStatusColor = (estado) => {
    const colores = {
      created: "", paid: "blue", packed: "orange",
      shipped: "purple", delivered: "green",
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
    etiquetasEstado,
    getStatusColor,
    ordenes,
    // Productos (from sub-hook)
    ...productosHook,
    categories,
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
