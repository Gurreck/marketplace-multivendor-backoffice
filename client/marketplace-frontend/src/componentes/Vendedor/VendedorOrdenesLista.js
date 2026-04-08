import React from "react";
import {
  ShoppingCart,
  RefreshCcw,
  Loader2,
  Eye,
} from "lucide-react";
import "./VendedorOrdenesLista.css";

export default function VendedorOrdenesLista({
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
                  <td><strong>#{orden._id?.slice(-6)}</strong></td>
                  <td>
                    <div className="info-usuario-vend">
                      <strong>{orden.cliente?.nombre || "Cliente"}</strong>
                      <span>{orden.cliente?.email || ""}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`insignia-vend ${getStatusColor(orden.estado)}`}>
                      {etiquetasEstado[orden.estado] || orden.estado}
                    </span>
                  </td>
                  <td>{orden.itemsPropios || 0}</td>
                  <td className="monto-vend">₡{(orden.total || 0).toLocaleString()}</td>
                  <td className="fecha-vend">{formatearFecha(orden.createdAt)}</td>
                  <td>
                    <div className="botones-accion-vend">
                      <button className="boton-accion-vend" onClick={() => verDetalleOrden(orden)} title="Ver detalle">
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
