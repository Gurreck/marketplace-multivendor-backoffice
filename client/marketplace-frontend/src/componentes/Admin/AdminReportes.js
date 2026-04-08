import React, { useState, useCallback } from "react";
import {
  FileText,
  Download,
  Loader2,
  Users,
  Store,
  Tag,
  ShoppingCart,
  ClipboardList,
  Calendar,
  Filter,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import servicioAdmin from "../../services/adminService";
import api from "../../services/api";
import "./AdminReportes.css";

// ===== TIPOS DE REPORTE =====
const TIPOS_REPORTE = [
  {
    id: "usuarios",
    titulo: "Reporte de Usuarios",
    descripcion: "Listado completo de usuarios registrados con roles y estados.",
    icono: <Users size={28} />,
    color: "blue",
  },
  {
    id: "vendedores",
    titulo: "Reporte de Vendedores",
    descripcion: "Vendedores con estado de aprobación y productos asociados.",
    icono: <Store size={28} />,
    color: "green",
  },
  {
    id: "categorias",
    titulo: "Reporte de Categorías",
    descripcion: "Categorías del marketplace con estado activo/inactivo.",
    icono: <Tag size={28} />,
    color: "purple",
  },
  {
    id: "ordenes",
    titulo: "Reporte de Órdenes",
    descripcion: "Resumen de ventas, órdenes recientes y estados de pedidos.",
    icono: <ShoppingCart size={28} />,
    color: "orange",
  },
  {
    id: "auditoria",
    titulo: "Reporte de Auditoría",
    descripcion: "Registro de acciones administrativas realizadas en el sistema.",
    icono: <ClipboardList size={28} />,
    color: "red",
  },
];

// ===== UTILIDADES PDF =====
function formatearFechaReporte(fechaStr) {
  if (!fechaStr) return "—";
  return new Date(fechaStr).toLocaleDateString("es-CR", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function agregarEncabezadoPDF(doc, titulo, fechaGeneracion) {
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 40, doc.internal.pageSize.width, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Nexora Marketplace", 14, 18);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(titulo, 14, 30);
  doc.setFontSize(9);
  doc.text("Generado: " + fechaGeneracion, doc.internal.pageSize.width - 14, 30, { align: "right" });
  doc.setTextColor(30, 41, 59);
}

function agregarPiePagina(doc) {
  const totalPaginas = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    const h = doc.internal.pageSize.height;
    const w = doc.internal.pageSize.width;
    doc.setFillColor(241, 245, 249);
    doc.rect(0, h - 18, w, 18, "F");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Pagina " + i + " de " + totalPaginas, w / 2, h - 7, { align: "center" });
    doc.text("Nexora Admin — Reporte Confidencial", 14, h - 7);
  }
}

// Helper: llama autoTable y retorna finalY
function crearTabla(doc, opciones) {
  autoTable(doc, opciones);
  return doc.lastAutoTable.finalY;
}

// ===== GENERADORES DE REPORTES =====
async function generarReporteUsuarios(doc, fechaDesde, fechaHasta) {
  const respuesta = await servicioAdmin.obtenerUsuarios();
  if (!respuesta.success) throw new Error("No se pudieron obtener los usuarios");
  let datos = respuesta.data || [];

  if (fechaDesde) datos = datos.filter((u) => new Date(u.createdAt) >= new Date(fechaDesde));
  if (fechaHasta) datos = datos.filter((u) => new Date(u.createdAt) <= new Date(fechaHasta + "T23:59:59"));

  const totalActivos = datos.filter((u) => u.activo !== false).length;
  const totalInactivos = datos.length - totalActivos;
  const clientes = datos.filter((u) => u.role === "cliente").length;
  const vendedoresN = datos.filter((u) => u.role === "vendedor").length;
  const admins = datos.filter((u) => u.role === "administrador" || u.role === "admin").length;
  const soporteN = datos.filter((u) => u.role === "soporte").length;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Resumen General", 14, 55);

  const y1 = crearTabla(doc, {
    startY: 60,
    head: [["Metrica", "Valor"]],
    body: [
      ["Total de usuarios", datos.length.toString()],
      ["Activos", totalActivos.toString()],
      ["Inactivos / Bloqueados", totalInactivos.toString()],
      ["Clientes", clientes.toString()],
      ["Vendedores", vendedoresN.toString()],
      ["Administradores", admins.toString()],
      ["Soporte", soporteN.toString()],
    ],
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 120 } },
  });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Detalle de Usuarios", 14, y1 + 15);

  crearTabla(doc, {
    startY: y1 + 20,
    head: [["Nombre", "Email", "Rol", "Estado", "Fecha Registro"]],
    body: datos.map((u) => [
      u.nombre || "—", u.email || "—", u.role || "—",
      u.activo !== false ? "Activo" : "Bloqueado",
      formatearFechaReporte(u.createdAt),
    ]),
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: { 1: { cellWidth: 80 } },
  });
}

async function generarReporteVendedores(doc, fechaDesde, fechaHasta) {
  const respuesta = await servicioAdmin.obtenerVendedores();
  if (!respuesta.success) throw new Error("No se pudieron obtener los vendedores");
  let datos = respuesta.data || [];

  if (fechaDesde) datos = datos.filter((v) => new Date(v.createdAt) >= new Date(fechaDesde));
  if (fechaHasta) datos = datos.filter((v) => new Date(v.createdAt) <= new Date(fechaHasta + "T23:59:59"));

  const aprobados = datos.filter((v) => v.vendorApproved).length;
  const pendientes = datos.filter((v) => !v.vendorApproved).length;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Resumen de Vendedores", 14, 55);

  const y1 = crearTabla(doc, {
    startY: 60,
    head: [["Metrica", "Valor"]],
    body: [
      ["Total vendedores", datos.length.toString()],
      ["Aprobados", aprobados.toString()],
      ["Pendientes", pendientes.toString()],
    ],
    theme: "grid",
    headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 120 } },
  });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Detalle de Vendedores", 14, y1 + 15);

  crearTabla(doc, {
    startY: y1 + 20,
    head: [["Nombre", "Email", "Estado", "Productos", "Fecha Registro"]],
    body: datos.map((v) => [
      v.nombre || "—", v.email || "—",
      v.vendorApproved ? "Aprobado" : "Pendiente",
      (v.totalProductos || 0).toString(),
      formatearFechaReporte(v.createdAt),
    ]),
    theme: "striped",
    headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 4 },
  });
}

async function generarReporteCategorias(doc) {
  const respuesta = await servicioAdmin.obtenerCategorias();
  if (!respuesta.success) throw new Error("No se pudieron obtener las categorias");
  const datos = respuesta.data || [];

  const activas = datos.filter((c) => c.activa).length;
  const inactivas = datos.length - activas;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Resumen de Categorias", 14, 55);

  const y1 = crearTabla(doc, {
    startY: 60,
    head: [["Metrica", "Valor"]],
    body: [
      ["Total categorias", datos.length.toString()],
      ["Activas", activas.toString()],
      ["Inactivas", inactivas.toString()],
    ],
    theme: "grid",
    headStyles: { fillColor: [168, 85, 247], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 120 } },
  });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Detalle de Categorias", 14, y1 + 15);

  crearTabla(doc, {
    startY: y1 + 20,
    head: [["Nombre", "Descripcion", "Estado", "Fecha Creacion"]],
    body: datos.map((c) => [
      c.nombre || "—", c.descripcion || "Sin descripcion",
      c.activa ? "Activa" : "Inactiva",
      formatearFechaReporte(c.createdAt),
    ]),
    theme: "striped",
    headStyles: { fillColor: [168, 85, 247], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 4 },
  });
}

async function generarReporteOrdenes(doc, fechaDesde, fechaHasta) {
  let ordenes = [];
  try {
    const respOrdenes = await api.get("/support/orders");
    if (respOrdenes.data.success) ordenes = respOrdenes.data.data || [];
  } catch (e) {
    console.error("Error al cargar ordenes para reporte:", e);
  }

  if (fechaDesde) ordenes = ordenes.filter((o) => new Date(o.createdAt) >= new Date(fechaDesde));
  if (fechaHasta) ordenes = ordenes.filter((o) => new Date(o.createdAt) <= new Date(fechaHasta + "T23:59:59"));

  const totalVentas = ordenes.reduce((sum, o) => sum + (o.total || 0), 0);
  const porEstado = {};
  ordenes.forEach((o) => {
    const est = o.status || "unknown";
    porEstado[est] = (porEstado[est] || 0) + 1;
  });

  const etiquetas = {
    created: "Creada", pending: "Pendiente", paid: "Pagada",
    packed: "Empacada", shipped: "Enviada", delivered: "Entregada", cancelled: "Cancelada",
  };

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Resumen de Ordenes", 14, 55);

  const y1 = crearTabla(doc, {
    startY: 60,
    head: [["Metrica", "Valor"]],
    body: [
      ["Total de ordenes", ordenes.length.toString()],
      ["Ventas totales", "C" + totalVentas.toLocaleString()],
      ...Object.entries(porEstado).map(([est, cant]) => [etiquetas[est] || est, cant.toString()]),
    ],
    theme: "grid",
    headStyles: { fillColor: [249, 115, 22], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 120 } },
  });

  if (ordenes.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Ultimas Ordenes", 14, y1 + 15);

    crearTabla(doc, {
      startY: y1 + 20,
      head: [["ID", "Cliente", "Estado", "Total", "Fecha"]],
      body: ordenes.slice(0, 50).map((o) => [
        "#" + (o._id || "").slice(-6),
        o.user?.nombre || "—",
        etiquetas[o.status] || o.status || "—",
        "C" + (o.total || 0).toLocaleString(),
        formatearFechaReporte(o.createdAt),
      ]),
      theme: "striped",
      headStyles: { fillColor: [249, 115, 22], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 4 },
    });
  }
}

async function generarReporteAuditoria(doc, fechaDesde, fechaHasta) {
  const filtros = {};
  if (fechaDesde) filtros.fechaDesde = fechaDesde;
  if (fechaHasta) filtros.fechaHasta = fechaHasta;
  filtros.limite = 200;

  const respuesta = await servicioAdmin.obtenerRegistrosAuditoria(filtros);
  if (!respuesta.success) throw new Error("No se pudieron obtener registros de auditoria");
  const datos = respuesta.data || [];

  const mapaAccion = {
    crear_usuario: "Crear usuario", desactivar_usuario: "Desactivar usuario",
    activar_usuario: "Activar usuario", asignar_rol: "Asignar rol",
    aprobar_vendedor: "Aprobar vendedor", suspender_vendedor: "Suspender vendedor",
    crear_categoria: "Crear categoria", editar_categoria: "Editar categoria",
    eliminar_categoria: "Eliminar categoria", cambio_estado: "Cambio de estado",
    crear_producto: "Crear producto", eliminar_producto: "Eliminar producto",
  };

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Resumen de Auditoria", 14, 55);

  const y1 = crearTabla(doc, {
    startY: 60,
    head: [["Metrica", "Valor"]],
    body: [
      ["Total de registros", datos.length.toString()],
      ["Rango", (fechaDesde || "Inicio") + " - " + (fechaHasta || "Hoy")],
    ],
    theme: "grid",
    headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 120 } },
  });

  if (datos.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Registros de Auditoria", 14, y1 + 15);

    crearTabla(doc, {
      startY: y1 + 20,
      head: [["Usuario", "Accion", "Entidad", "Detalles", "Fecha"]],
      body: datos.map((r) => [
        r.usuarioNombre || "Sistema",
        mapaAccion[r.accion] || r.accion || "—",
        r.entidad || "—",
        (r.detalles || "—").substring(0, 60),
        formatearFechaReporte(r.fecha || r.createdAt),
      ]),
      theme: "striped",
      headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: { 3: { cellWidth: 80 } },
    });
  }
}

// ===== COMPONENTE PRINCIPAL =====
export default function AdminReportes() {
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [generando, setGenerando] = useState(false);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [reporteExitoso, setReporteExitoso] = useState(null);

  const generarPDF = useCallback(async (tipoReporte) => {
    setGenerando(true);
    setReporteSeleccionado(tipoReporte);
    setReporteExitoso(null);
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const ahora = new Date();
      const fechaGeneracion = ahora.toLocaleDateString("es-CR", {
        day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
      });

      const config = TIPOS_REPORTE.find((t) => t.id === tipoReporte);
      agregarEncabezadoPDF(doc, config.titulo, fechaGeneracion);

      switch (tipoReporte) {
        case "usuarios":
          await generarReporteUsuarios(doc, fechaDesde, fechaHasta);
          break;
        case "vendedores":
          await generarReporteVendedores(doc, fechaDesde, fechaHasta);
          break;
        case "categorias":
          await generarReporteCategorias(doc);
          break;
        case "ordenes":
          await generarReporteOrdenes(doc, fechaDesde, fechaHasta);
          break;
        case "auditoria":
          await generarReporteAuditoria(doc, fechaDesde, fechaHasta);
          break;
        default:
          break;
      }

      agregarPiePagina(doc);

      const nombreArchivo = "Nexora_" + config.titulo.replace(/ /g, "_") + "_" + ahora.toISOString().slice(0, 10) + ".pdf";
      doc.save(nombreArchivo);
      setReporteExitoso(nombreArchivo);
    } catch (err) {
      console.error("Error generando PDF:", err);
      alert("Error al generar el reporte: " + (err.message || "Error desconocido"));
    } finally {
      setGenerando(false);
    }
  }, [fechaDesde, fechaHasta]);

  return (
    <>
      <div className="encabezado-pagina-admin">
        <h1>Generador de Reportes</h1>
        <p>Genera reportes PDF profesionales con datos del sistema en tiempo real</p>
      </div>

      {/* Filtros de fecha */}
      <div className="reportes-filtros-admin">
        <div className="reportes-filtro-grupo">
          <Calendar size={16} />
          <label>Desde:</label>
          <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="reportes-fecha-input" />
        </div>
        <div className="reportes-filtro-grupo">
          <Calendar size={16} />
          <label>Hasta:</label>
          <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="reportes-fecha-input" />
        </div>
        {(fechaDesde || fechaHasta) && (
          <button className="reportes-limpiar-btn" onClick={() => { setFechaDesde(""); setFechaHasta(""); }}>
            <Filter size={14} /> Limpiar filtros
          </button>
        )}
      </div>

      {/* Notificación de éxito */}
      {reporteExitoso && (
        <div className="reportes-exito-admin">
          <FileText size={18} />
          <span>Reporte descargado exitosamente: <strong>{reporteExitoso}</strong></span>
        </div>
      )}

      {/* Tarjetas de reportes */}
      <div className="reportes-grid-admin">
        {TIPOS_REPORTE.map((tipo) => (
          <div
            key={tipo.id}
            className={"reportes-card-admin" + (reporteSeleccionado === tipo.id ? " seleccionado" : "")}
            onClick={() => setReporteSeleccionado(tipo.id === reporteSeleccionado ? null : tipo.id)}
          >
            <div className={"reportes-card-icono " + tipo.color}>
              {tipo.icono}
            </div>
            <div className="reportes-card-info">
              <h3>{tipo.titulo}</h3>
              <p>{tipo.descripcion}</p>
            </div>
            <button
              className={"reportes-descargar-btn " + tipo.color}
              onClick={(e) => { e.stopPropagation(); generarPDF(tipo.id); }}
              disabled={generando}
            >
              {generando && reporteSeleccionado === tipo.id ? (
                <Loader2 className="animacion-giro" size={18} />
              ) : (
                <Download size={18} />
              )}
              <span>{generando && reporteSeleccionado === tipo.id ? "Generando..." : "Descargar PDF"}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Overlay de generación */}
      {generando && (
        <div className="reportes-overlay-admin">
          <div className="reportes-overlay-contenido">
            <Loader2 className="animacion-giro" size={48} />
            <h3>Generando reporte...</h3>
            <p>Obteniendo datos del servidor y creando el PDF</p>
          </div>
        </div>
      )}
    </>
  );
}
