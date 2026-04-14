import React from "react";
import { RotateCcw, Search, RefreshCcw, Loader2, Eye, CheckCircle2, XCircle } from "lucide-react";
import "./SoporteDevolucionesLista.css";

export default function SoporteDevolucionesLista({
  devolucionesFiltradas, buscarRMA, setBuscarRMA,
  filtroEstadoRMA, setFiltroEstadoRMA, cargarDevoluciones,
  cargando, obtenerIniciales, formatearFecha,
  coloresEstadoRMA, etiquetasEstadoRMA,
  setRmaSeleccionada, setSeccionActiva, cambiarEstadoRMA
}) {
  return (
    <>
      <div className="encabezado-pagina-sop">
        <h1>Gestión de Devoluciones (RMA)</h1>
        <p>Revisar, aprobar/rechazar y gestionar solicitudes de devolución</p>
      </div>

      <div className="contenedor-tabla-sop">
        <div className="encabezado-tabla-sop">
          <h3><RotateCcw size={18} style={{ marginRight: "8px" }} /> Devoluciones ({devolucionesFiltradas.length})</h3>
          <div className="acciones-tabla-sop">
            <div className="contenedor-entrada-sop">
              <Search size={18} className="icono-entrada-sop" />
              <input className="entrada-busqueda-sop" type="text" placeholder="Buscar devolución..."
                value={buscarRMA} onChange={(e) => setBuscarRMA(e.target.value)} />
            </div>
            <select className="select-filtro-sop" value={filtroEstadoRMA} onChange={(e) => setFiltroEstadoRMA(e.target.value)}>
              <option value="todos">Todos los Estados</option>
              <option value="requested">Solicitadas</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
              <option value="received">Recibidas</option>
              <option value="refunded">Reembolsadas</option>
            </select>
            <button className="boton-secundario-sop" onClick={cargarDevoluciones}>
              <RefreshCcw size={16} style={{ marginRight: "6px" }} /> Actualizar
            </button>
          </div>
        </div>

        {cargando ? (
          <div className="cargando-sop"><Loader2 className="animacion-giro" size={40} /><p>Cargando devoluciones...</p></div>
        ) : devolucionesFiltradas.length === 0 ? (
          <div className="vacio-sop" style={{ padding: "60px" }}><RotateCcw size={48} opacity={0.3} /><p>No hay devoluciones disponibles</p></div>
        ) : (
          <table className="tabla-sop">
            <thead>
              <tr><th>ID</th><th>Orden</th><th>Cliente</th><th>Producto</th><th>Motivo</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {devolucionesFiltradas.map((rma) => (
                <tr key={rma._id}>
                  <td><strong>#{rma._id?.slice(-6)}</strong></td>
                  <td><span className="insignia-sop blue">#{rma.orden?._id?.slice(-6) || rma.ordenId?.slice(-6) || "—"}</span></td>
                  <td>
                    <div className="info-usuario-sop">
                      <div className="avatar-sop">{obtenerIniciales(rma.cliente?.nombre)}</div>
                      <div className="detalles-usuario-sop"><strong>{rma.cliente?.nombre || "Cliente"}</strong></div>
                    </div>
                  </td>
                  <td><strong>{rma.producto?.name || rma.productoNombre || "—"}</strong></td>
                  <td className="texto-truncado-sop">{rma.motivo || "—"}</td>
                  <td><span className={`insignia-sop ${coloresEstadoRMA[rma.estado] || ""}`}>{etiquetasEstadoRMA[rma.estado] || rma.estado}</span></td>
                  <td className="fecha-sop">{formatearFecha(rma.createdAt)}</td>
                  <td>
                    <div className="botones-accion-sop">
                      <button className="boton-accion-sop" onClick={() => { setRmaSeleccionada(rma); setSeccionActiva("detalleRMA"); }} title="Ver detalle"><Eye size={16} /></button>
                      {rma.estado === "requested" && (
                        <>
                          <button className="boton-accion-sop success" onClick={() => cambiarEstadoRMA(rma._id, "approved")} title="Aprobar"><CheckCircle2 size={16} /></button>
                          <button className="boton-accion-sop danger" onClick={() => cambiarEstadoRMA(rma._id, "rejected")} title="Rechazar"><XCircle size={16} /></button>
                        </>
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
}
