import React from "react";
import { RotateCcw, ArrowLeft, ArrowUpRight, ShieldAlert, Store, MessageSquare, Clock, CheckCircle2, XCircle } from "lucide-react";
import "./SoporteDetalleDevolucion.css";

export default function SoporteDetalleDevolucion({
  rma, setSeccionActiva, obtenerTransicionesRMA, formatearFecha,
  coloresEstadoRMA, etiquetasEstadoRMA, estadosRMA,
  comentarioRMA, setComentarioRMA, cambiarEstadoRMA,
  mostrarEscalarRMA, setMostrarEscalarRMA,
  comentarioEscalarRMA, setComentarioEscalarRMA, escalarRMAHandler
}) {
  if (!rma) return null;
  const transicionesDisponibles = obtenerTransicionesRMA(rma.estado);

  return (
    <>
      <div className="encabezado-pagina-sop" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button className="boton-volver-sop" onClick={() => setSeccionActiva("devoluciones")}><ArrowLeft size={20} /></button>
        <div>
          <h1>RMA #{rma._id?.slice(-6)}</h1>
          <p>Detalle de solicitud de devolución</p>
        </div>
      </div>

      <div className="cuadricula-detalle-sop">
        {/* Info de la RMA */}
        <div className="tarjeta-info-sop">
          <h3><RotateCcw size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} /> Información de la Devolución</h3>
          <div className="detalle-info-grid-sop">
            <div className="detalle-info-item-sop"><span className="detalle-label-sop">ID RMA</span><span className="detalle-valor-sop">{rma._id}</span></div>
            <div className="detalle-info-item-sop"><span className="detalle-label-sop">Orden</span><span className="detalle-valor-sop">#{rma.orden?._id?.slice(-6) || rma.ordenId?.slice(-6) || "—"}</span></div>
            <div className="detalle-info-item-sop"><span className="detalle-label-sop">Cliente</span><span className="detalle-valor-sop">{rma.cliente?.nombre || "—"}</span></div>
            <div className="detalle-info-item-sop"><span className="detalle-label-sop">Email</span><span className="detalle-valor-sop">{rma.cliente?.email || "—"}</span></div>
            <div className="detalle-info-item-sop"><span className="detalle-label-sop">Producto</span><span className="detalle-valor-sop">{rma.producto?.name || rma.productoNombre || "—"}</span></div>
            <div className="detalle-info-item-sop"><span className="detalle-label-sop">Cantidad</span><span className="detalle-valor-sop">{rma.cantidad || 1}</span></div>
            <div className="detalle-info-item-sop">
              <span className="detalle-label-sop">Estado</span>
              <span className={`insignia-sop ${coloresEstadoRMA[rma.estado] || ""}`}>{etiquetasEstadoRMA[rma.estado] || rma.estado}</span>
            </div>
            <div className="detalle-info-item-sop"><span className="detalle-label-sop">Fecha</span><span className="detalle-valor-sop">{formatearFecha(rma.createdAt)}</span></div>
          </div>

          <div className="motivo-rma-sop">
            <h4>Motivo de Devolución</h4>
            <p>{rma.motivo || "No se proporcionó motivo"}</p>
          </div>

          {/* Progreso RMA */}
          <div className="progreso-rma-sop">
            <h4>Progreso</h4>
            <div className="pasos-rma-sop">
              {estadosRMA.map((est, i) => {
                const indexActual = estadosRMA.indexOf(rma.estado);
                const esCompletado = i <= indexActual;
                const esActual = i === indexActual;
                const esRechazado = rma.estado === "rejected";
                if (esRechazado && est !== "requested" && est !== "rejected") return null;
                return (
                  <div key={est} className={`paso-rma-sop ${esCompletado ? "completado" : ""} ${esActual ? "actual" : ""} ${est === "rejected" ? "rechazado" : ""}`}>
                    <div className="circulo-rma-sop">
                      {esCompletado ? (est === "rejected" ? <XCircle size={16} /> : <CheckCircle2 size={16} />) : <span>{i + 1}</span>}
                    </div>
                    <span>{etiquetasEstadoRMA[est]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Acciones y Comentarios */}
        <div className="tarjeta-info-sop">
          <h3><MessageSquare size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} /> Acciones y Comentarios</h3>

          {transicionesDisponibles.length > 0 && (
            <div className="cambiar-estado-sop">
              <h4>Cambiar Estado</h4>
              <textarea className="textarea-sop" placeholder="Comentario o decisión..."
                value={comentarioRMA} onChange={(e) => setComentarioRMA(e.target.value)} rows="2" />
              <div className="botones-estado-sop">
                {transicionesDisponibles.map((est) => (
                  <button key={est} className={`boton-estado-sop ${est === "rejected" ? "rechazar" : ""}`}
                    onClick={() => cambiarEstadoRMA(rma._id, est)}>
                    {etiquetasEstadoRMA[est]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="acciones-rapidas-sop" style={{ marginTop: "20px" }}>
            <button className="boton-escalar-sop" onClick={() => setMostrarEscalarRMA(!mostrarEscalarRMA)}>
              <ArrowUpRight size={16} style={{ marginRight: "8px" }} /> Escalar
            </button>
          </div>

          {mostrarEscalarRMA && (
            <div className="panel-escalar-sop">
              <textarea className="textarea-sop" placeholder="Comentario de escalamiento..."
                value={comentarioEscalarRMA} onChange={(e) => setComentarioEscalarRMA(e.target.value)} rows="2" />
              <div className="botones-escalar-sop">
                <button className="boton-escalar-destino-sop" onClick={() => escalarRMAHandler("administrador")}>
                  <ShieldAlert size={14} style={{ marginRight: "6px" }} /> A Administrador
                </button>
                <button className="boton-escalar-destino-sop vendedor" onClick={() => escalarRMAHandler("vendedor")}>
                  <Store size={14} style={{ marginRight: "6px" }} /> A Vendedor
                </button>
              </div>
            </div>
          )}

          {/* Historial */}
          <div className="historial-rma-sop">
            <h4>Historial</h4>
            {(rma.historial || []).length > 0 ? (
              <div className="lista-historial-sop">
                {rma.historial.map((h, i) => (
                  <div key={i} className="item-historial-sop">
                    <div className="cabecera-historial-sop">
                      <span className={`insignia-sop ${coloresEstadoRMA[h.estado] || "blue"}`}>{etiquetasEstadoRMA[h.estado] || h.estado}</span>
                      <span className="fecha-sop">{formatearFecha(h.fecha)}</span>
                    </div>
                    <p>{h.comentario || "Sin comentario"}</p>
                    <span className="usuario-historial-sop">Por: {h.usuario || "Sistema"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="vacio-sop" style={{ padding: "20px" }}><Clock size={30} opacity={0.2} /><p>No hay historial aún</p></div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
