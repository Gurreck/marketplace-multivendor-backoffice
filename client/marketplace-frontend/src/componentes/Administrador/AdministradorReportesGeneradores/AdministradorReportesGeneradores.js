import servicioAdministrador from "../../../services/administradorService";
import api from "../../../services/api";
import { formatearFechaReporte, crearTabla } from '../AdministradorReportesPdfUtils/AdministradorReportesPdfUtils';

// ===== GENERADORES DE REPORTES =====
export async function generarReporteUsuarios(doc, fechaDesde, fechaHasta) {
  const respuesta = await servicioAdministrador.obtenerUsuarios();
  if (!respuesta.success) throw new Error("No se pudieron obtener los usuarios");
  let datos = respuesta.data || [];

  if (fechaDesde) datos = datos.filter((u) => new Date(u.createdAt) >= new Date(fechaDesde));
  if (fechaHasta) datos = datos.filter((u) => new Date(u.createdAt) <= new Date(fechaHasta + "T23:59:59"));

  const totalActivos = datos.filter((u) => u.activo !== false).length;
  const totalInactivos = datos.length - totalActivos;
  const clientes = datos.filter((u) => u.role === "cliente").length;
  const vendedoresN = datos.filter((u) => u.role === "vendedor").length;
  const administradors = datos.filter((u) => u.role === "administrador" || u.role === "administrador").length;
  const soporteN = datos.filter((u) => u.role === "soporte").length;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Resumen General", 14, 55);

  const y1 = crearTabla(doc, {
    startY: 60, head: [["Metrica", "Valor"]],
    body: [ ["Total de usuarios", datos.length.toString()], ["Activos", totalActivos.toString()], ["Inactivos / Bloqueados", totalInactivos.toString()], ["Clientes", clientes.toString()], ["Vendedores", vendedoresN.toString()], ["Administradores", administradors.toString()], ["Soporte", soporteN.toString()] ],
    theme: "grid", headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: "bold" }, alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 10, cellPadding: 5 }, columnStyles: { 0: { fontStyle: "bold", cellWidth: 120 } },
  });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Detalle de Usuarios", 14, y1 + 15);

  crearTabla(doc, {
    startY: y1 + 20, head: [["Nombre", "Email", "Rol", "Estado", "Fecha Registro"]],
    body: datos.map((u) => [ u.nombre || "—", u.email || "—", u.role || "—", u.activo !== false ? "Activo" : "Bloqueado", formatearFechaReporte(u.createdAt) ]),
    theme: "striped", headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 4 }, columnStyles: { 1: { cellWidth: 80 } },
  });
}

export async function generarReporteVendedores(doc, fechaDesde, fechaHasta) {
  const respuesta = await servicioAdministrador.obtenerVendedores();
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
    startY: 60, head: [["Metrica", "Valor"]],
    body: [ ["Total vendedores", datos.length.toString()], ["Aprobados", aprobados.toString()], ["Pendientes", pendientes.toString()] ],
    theme: "grid", headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] }, styles: { fontSize: 10, cellPadding: 5 }, columnStyles: { 0: { fontStyle: "bold", cellWidth: 120 } },
  });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Detalle de Vendedores", 14, y1 + 15);

  crearTabla(doc, {
    startY: y1 + 20, head: [["Nombre", "Email", "Estado", "Productos", "Fecha Registro"]],
    body: datos.map((v) => [ v.nombre || "—", v.email || "—", v.vendorApproved ? "Aprobado" : "Pendiente", (v.totalProductos || 0).toString(), formatearFechaReporte(v.createdAt) ]),
    theme: "striped", headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255], fontStyle: "bold" }, styles: { fontSize: 9, cellPadding: 4 },
  });
}

export async function generarReporteCategorias(doc) {
  const respuesta = await servicioAdministrador.obtenerCategorias();
  if (!respuesta.success) throw new Error("No se pudieron obtener las categorias");
  const datos = respuesta.data || [];

  const activas = datos.filter((c) => c.activa).length;
  const inactivas = datos.length - activas;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Resumen de Categorias", 14, 55);

  const y1 = crearTabla(doc, {
    startY: 60, head: [["Metrica", "Valor"]],
    body: [ ["Total categorias", datos.length.toString()], ["Activas", activas.toString()], ["Inactivas", inactivas.toString()] ],
    theme: "grid", headStyles: { fillColor: [168, 85, 247], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] }, styles: { fontSize: 10, cellPadding: 5 }, columnStyles: { 0: { fontStyle: "bold", cellWidth: 120 } },
  });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Detalle de Categorias", 14, y1 + 15);

  crearTabla(doc, {
    startY: y1 + 20, head: [["Nombre", "Descripcion", "Estado", "Fecha Creacion"]],
    body: datos.map((c) => [ c.nombre || "—", c.descripcion || "Sin descripcion", c.activa ? "Activa" : "Inactiva", formatearFechaReporte(c.createdAt) ]),
    theme: "striped", headStyles: { fillColor: [168, 85, 247], textColor: [255, 255, 255], fontStyle: "bold" }, styles: { fontSize: 9, cellPadding: 4 },
  });
}

export async function generarReporteOrdenes(doc, fechaDesde, fechaHasta) {
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

export async function generarReporteAuditoria(doc, fechaDesde, fechaHasta) {
  const filtros = {};
  if (fechaDesde) filtros.fechaDesde = fechaDesde;
  if (fechaHasta) filtros.fechaHasta = fechaHasta;
  filtros.limite = 200;

  const respuesta = await servicioAdministrador.obtenerRegistrosAuditoria(filtros);
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


