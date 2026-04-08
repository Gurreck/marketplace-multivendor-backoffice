import React from "react";
import {
  ShoppingCart,
  RefreshCcw,
  Loader2,
  Eye,
  ArrowLeft,
  Truck,
  CheckCircle2,
  Package,
  Clock
} from "lucide-react";
import "./VendedorOrdenes.css";

export function VendedorOrdenesLista({
  ordenesFiltradas,
  filtroEstadoOrden,
  setFiltroEstadoOrden,
  cargarOrdenes,
  cargando,
  getStatusColor,
  etiquetasEstado,
  formatearFecha,
  verDetalleOrden
}) {
  return (
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
            <button className="boton-secundario-vend" onClick={cargarOrdenes}>
              <RefreshCcw size={16} style={{ marginRight: "6px" }} /> Actualizar
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
                      <strong>{orden.cliente?.nombre || "Cliente"}</strong>
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

export function VendedorDetalleOrden({
  orden,
  setSeccionActiva,
  formatearFecha,
  getStatusColor,
  etiquetasEstado,
  estadosOrden,
  historialOrden
}) {
  if (!orden) return null;

  return (
    <>
      <div
        className="encabezado-pagina-vend"
        style={{ display: "flex", alignItems: "center", gap: "16px" }}
      >
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

          <div
            className="actualizar-estado-vend"
            style={{
              padding: "15px",
              background: "var(--vend-card)",
              borderRadius: "8px",
              border: "1px solid var(--vend-borde)",
              marginTop: "20px",
            }}
          >
            <p
              style={{
                color: "var(--vend-texto)",
                margin: 0,
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <CheckCircle2 size={18} color="var(--vend-azul)" />
              El proceso de envío y logística es gestionado directamente por
              el equipo de Soporte.
            </p>
          </div>
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
      <div className="contenedor-tabla-vend" style={{ marginTop: "20px" }}>
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
                    <span className={`insignia-vend ${getStatusColor(h.de)}`}>
                      {etiquetasEstado[h.de] || h.de}
                    </span>
                  </td>
                  <td>
                    <span className={`insignia-vend ${getStatusColor(h.a)}`}>
                      {etiquetasEstado[h.a] || h.a}
                    </span>
                  </td>
                  <td>{h.comentario || "—"}</td>
                  <td className="fecha-vend">{formatearFecha(h.fecha)}</td>
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
}
