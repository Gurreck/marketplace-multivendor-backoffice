import React from "react";
import {
  RotateCcw,
  Search,
  RefreshCcw,
  Loader2,
  Eye,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowUpRight,
  ShieldAlert,
  Store,
  MessageSquare,
  Clock
} from "lucide-react";
import "./SoporteDevoluciones.css";

export function SoporteDevolucionesLista({
  devolucionesFiltradas,
  buscarRMA,
  setBuscarRMA,
  filtroEstadoRMA,
  setFiltroEstadoRMA,
  cargarDevoluciones,
  cargando,
  obtenerIniciales,
  formatearFecha,
  coloresEstadoRMA,
  etiquetasEstadoRMA,
  setRmaSeleccionada,
  setSeccionActiva,
  cambiarEstadoRMA
}) {
  return (
    <>
      <div className="encabezado-pagina-sop">
        <h1>Gestión de Devoluciones (RMA)</h1>
        <p>Revisar, aprobar/rechazar y gestionar solicitudes de devolución</p>
      </div>

      <div className="contenedor-tabla-sop">
        <div className="encabezado-tabla-sop">
          <h3>
            <RotateCcw size={18} style={{ marginRight: "8px" }} />
            Devoluciones ({devolucionesFiltradas.length})
          </h3>
          <div className="acciones-tabla-sop">
            <div className="contenedor-entrada-sop">
              <Search size={18} className="icono-entrada-sop" />
              <input
                className="entrada-busqueda-sop"
                type="text"
                placeholder="Buscar devolución..."
                value={buscarRMA}
                onChange={(e) => setBuscarRMA(e.target.value)}
              />
            </div>
            <select
              className="select-filtro-sop"
              value={filtroEstadoRMA}
              onChange={(e) => setFiltroEstadoRMA(e.target.value)}
            >
              <option value="todos">Todos los Estados</option>
              <option value="requested">Solicitadas</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
              <option value="received">Recibidas</option>
              <option value="refunded">Reembolsadas</option>
            </select>
            <button
              className="boton-secundario-sop"
              onClick={cargarDevoluciones}
            >
              <RefreshCcw size={16} style={{ marginRight: "6px" }} />{" "}
              Actualizar
            </button>
          </div>
        </div>

        {cargando ? (
          <div className="cargando-sop">
            <Loader2 className="animacion-giro" size={40} />
            <p>Cargando devoluciones...</p>
          </div>
        ) : devolucionesFiltradas.length === 0 ? (
          <div className="vacio-sop" style={{ padding: "60px" }}>
            <RotateCcw size={48} opacity={0.3} />
            <p>No hay devoluciones disponibles</p>
          </div>
        ) : (
          <table className="tabla-sop">
            <thead>
              <tr>
                <th>ID</th>
                <th>Orden</th>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {devolucionesFiltradas.map((rma) => (
                <tr key={rma._id}>
                  <td>
                    <strong>#{rma._id?.slice(-6)}</strong>
                  </td>
                  <td>
                    <span className="insignia-sop blue">
                      #{rma.orden?._id?.slice(-6) || rma.ordenId?.slice(-6) || "—"}
                    </span>
                  </td>
                  <td>
                    <div className="info-usuario-sop">
                      <div className="avatar-sop">
                        {obtenerIniciales(rma.cliente?.nombre)}
                      </div>
                      <div className="detalles-usuario-sop">
                        <strong>
                          {rma.cliente?.nombre || "Cliente"}
                        </strong>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>
                      {rma.producto?.name || rma.productoNombre || "—"}
                    </strong>
                  </td>
                  <td className="texto-truncado-sop">
                    {rma.motivo || "—"}
                  </td>
                  <td>
                    <span
                      className={`insignia-sop ${coloresEstadoRMA[rma.estado] || ""}`}
                    >
                      {etiquetasEstadoRMA[rma.estado] || rma.estado}
                    </span>
                  </td>
                  <td className="fecha-sop">
                    {formatearFecha(rma.createdAt)}
                  </td>
                  <td>
                    <div className="botones-accion-sop">
                      <button
                        className="boton-accion-sop"
                        onClick={() => {
                          setRmaSeleccionada(rma);
                          setSeccionActiva("detalleRMA");
                        }}
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                      {rma.estado === "requested" && (
                        <>
                          <button
                            className="boton-accion-sop success"
                            onClick={() =>
                              cambiarEstadoRMA(rma._id, "approved")
                            }
                            title="Aprobar"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button
                            className="boton-accion-sop danger"
                            onClick={() =>
                              cambiarEstadoRMA(rma._id, "rejected")
                            }
                            title="Rechazar"
                          >
                            <XCircle size={16} />
                          </button>
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

export function SoporteDetalleDevolucion({
  rma,
  setSeccionActiva,
  obtenerTransicionesRMA,
  formatearFecha,
  coloresEstadoRMA,
  etiquetasEstadoRMA,
  estadosRMA,
  comentarioRMA,
  setComentarioRMA,
  cambiarEstadoRMA,
  mostrarEscalarRMA,
  setMostrarEscalarRMA,
  comentarioEscalarRMA,
  setComentarioEscalarRMA,
  escalarRMAHandler
}) {
  if (!rma) return null;
  const transicionesDisponibles = obtenerTransicionesRMA(rma.estado);

  return (
    <>
      <div
        className="encabezado-pagina-sop"
        style={{ display: "flex", alignItems: "center", gap: "16px" }}
      >
        <button
          className="boton-volver-sop"
          onClick={() => setSeccionActiva("devoluciones")}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1>RMA #{rma._id?.slice(-6)}</h1>
          <p>Detalle de solicitud de devolución</p>
        </div>
      </div>

      <div className="cuadricula-detalle-sop">
        {/* Info de la RMA */}
        <div className="tarjeta-info-sop">
          <h3>
            <RotateCcw
              size={18}
              style={{ marginRight: "8px", verticalAlign: "middle" }}
            />
            Información de la Devolución
          </h3>
          <div className="detalle-info-grid-sop">
            <div className="detalle-info-item-sop">
              <span className="detalle-label-sop">ID RMA</span>
              <span className="detalle-valor-sop">{rma._id}</span>
            </div>
            <div className="detalle-info-item-sop">
              <span className="detalle-label-sop">Orden</span>
              <span className="detalle-valor-sop">
                #{rma.orden?._id?.slice(-6) || rma.ordenId?.slice(-6) || "—"}
              </span>
            </div>
            <div className="detalle-info-item-sop">
              <span className="detalle-label-sop">Cliente</span>
              <span className="detalle-valor-sop">
                {rma.cliente?.nombre || "—"}
              </span>
            </div>
            <div className="detalle-info-item-sop">
              <span className="detalle-label-sop">Email</span>
              <span className="detalle-valor-sop">
                {rma.cliente?.email || "—"}
              </span>
            </div>
            <div className="detalle-info-item-sop">
              <span className="detalle-label-sop">Producto</span>
              <span className="detalle-valor-sop">
                {rma.producto?.name || rma.productoNombre || "—"}
              </span>
            </div>
            <div className="detalle-info-item-sop">
              <span className="detalle-label-sop">Cantidad</span>
              <span className="detalle-valor-sop">
                {rma.cantidad || 1}
              </span>
            </div>
            <div className="detalle-info-item-sop">
              <span className="detalle-label-sop">Estado</span>
              <span
                className={`insignia-sop ${coloresEstadoRMA[rma.estado] || ""}`}
              >
                {etiquetasEstadoRMA[rma.estado] || rma.estado}
              </span>
            </div>
            <div className="detalle-info-item-sop">
              <span className="detalle-label-sop">Fecha</span>
              <span className="detalle-valor-sop">
                {formatearFecha(rma.createdAt)}
              </span>
            </div>
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

                if (esRechazado && est !== "requested" && est !== "rejected")
                  return null;

                return (
                  <div
                    key={est}
                    className={`paso-rma-sop ${esCompletado ? "completado" : ""} ${esActual ? "actual" : ""} ${est === "rejected" ? "rechazado" : ""}`}
                  >
                    <div className="circulo-rma-sop">
                      {esCompletado ? (
                        est === "rejected" ? (
                          <XCircle size={16} />
                        ) : (
                          <CheckCircle2 size={16} />
                        )
                      ) : (
                        <span>{i + 1}</span>
                      )}
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
          <h3>
            <MessageSquare
              size={18}
              style={{ marginRight: "8px", verticalAlign: "middle" }}
            />
            Acciones y Comentarios
          </h3>

          {/* Cambiar estado */}
          {transicionesDisponibles.length > 0 && (
            <div className="cambiar-estado-sop">
              <h4>Cambiar Estado</h4>
              <textarea
                className="textarea-sop"
                placeholder="Comentario o decisión..."
                value={comentarioRMA}
                onChange={(e) => setComentarioRMA(e.target.value)}
                rows="2"
              />
              <div className="botones-estado-sop">
                {transicionesDisponibles.map((est) => (
                  <button
                    key={est}
                    className={`boton-estado-sop ${est === "rejected" ? "rechazar" : ""}`}
                    onClick={() => cambiarEstadoRMA(rma._id, est)}
                  >
                    {etiquetasEstadoRMA[est]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Escalar */}
          <div className="acciones-rapidas-sop" style={{ marginTop: "20px" }}>
            <button
              className="boton-escalar-sop"
              onClick={() => setMostrarEscalarRMA(!mostrarEscalarRMA)}
            >
              <ArrowUpRight
                size={16}
                style={{ marginRight: "8px" }}
              />
              Escalar
            </button>
          </div>

          {mostrarEscalarRMA && (
            <div className="panel-escalar-sop">
              <textarea
                className="textarea-sop"
                placeholder="Comentario de escalamiento..."
                value={comentarioEscalarRMA}
                onChange={(e) => setComentarioEscalarRMA(e.target.value)}
                rows="2"
              />
              <div className="botones-escalar-sop">
                <button
                  className="boton-escalar-destino-sop"
                  onClick={() => escalarRMAHandler("administrador")}
                >
                  <ShieldAlert
                    size={14}
                    style={{ marginRight: "6px" }}
                  />
                  A Administrador
                </button>
                <button
                  className="boton-escalar-destino-sop vendedor"
                  onClick={() => escalarRMAHandler("vendedor")}
                >
                  <Store
                    size={14}
                    style={{ marginRight: "6px" }}
                  />
                  A Vendedor
                </button>
              </div>
            </div>
          )}

          {/* Historial de comentarios */}
          <div className="historial-rma-sop">
            <h4>Historial</h4>
            {(rma.historial || []).length > 0 ? (
              <div className="lista-historial-sop">
                {rma.historial.map((h, i) => (
                  <div key={i} className="item-historial-sop">
                    <div className="cabecera-historial-sop">
                      <span
                        className={`insignia-sop ${coloresEstadoRMA[h.estado] || "blue"}`}
                      >
                        {etiquetasEstadoRMA[h.estado] || h.estado}
                      </span>
                      <span className="fecha-sop">
                        {formatearFecha(h.fecha)}
                      </span>
                    </div>
                    <p>{h.comentario || "Sin comentario"}</p>
                    <span className="usuario-historial-sop">
                      Por: {h.usuario || "Sistema"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="vacio-sop" style={{ padding: "20px" }}>
                <Clock size={30} opacity={0.2} />
                <p>No hay historial aún</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
