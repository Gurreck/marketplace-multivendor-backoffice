import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ===== UTILIDADES PDF =====
export function formatearFechaReporte(fechaStr) {
  if (!fechaStr) return "—";
  return new Date(fechaStr).toLocaleDateString("es-CR", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export function agregarEncabezadoPDF(doc, titulo, fechaGeneracion) {
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

export function agregarPiePagina(doc) {
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
    doc.text("Nexora Administrador — Reporte Confidencial", 14, h - 7);
  }
}

// Helper: llama autoTable y retorna finalY
export function crearTabla(doc, opciones) {
  autoTable(doc, opciones);
  return doc.lastAutoTable.finalY;
}

export function crearDocumentoPDF() {
  return new jsPDF("p", "mm", "a4");
}


