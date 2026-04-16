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
import { crearDocumentoPDF, agregarEncabezadoPDF, agregarPiePagina } from '../AdministradorReportesPdfUtils/AdministradorReportesPdfUtils';
import {
  generarReporteUsuarios,
  generarReporteVendedores,
  generarReporteCategorias,
  generarReporteOrdenes,
  generarReporteAuditoria,
} from '../AdministradorReportesGeneradores/AdministradorReportesGeneradores';
import "./AdministradorReportes.css";

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
    descripcion: "Registro de acciones administradoristrativas realizadas en el sistema.",
    icono: <ClipboardList size={28} />,
    color: "red",
  },
];

// ===== COMPONENTE PRINCIPAL =====
export default function AdministradorReportes() {
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
      const doc = crearDocumentoPDF();
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
      <div className="encabezado-pagina-administrador">
        <h1>Generador de Reportes</h1>
        <p>Genera reportes PDF profesionales con datos del sistema en tiempo real</p>
      </div>

      {/* Filtros de fecha */}
      <div className="reportes-filtros-administrador">
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
        <div className="reportes-exito-administrador">
          <FileText size={18} />
          <span>Reporte descargado exitosamente: <strong>{reporteExitoso}</strong></span>
        </div>
      )}

      {/* Tarjetas de reportes */}
      <div className="reportes-grid-administrador">
        {TIPOS_REPORTE.map((tipo) => (
          <div
            key={tipo.id}
            className={"reportes-card-administrador" + (reporteSeleccionado === tipo.id ? " seleccionado" : "")}
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
        <div className="reportes-overlay-administrador">
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

