import React from "react";
import {
  Package,
  Search,
  RefreshCcw,
  Loader2,
  CheckCircle2
} from "lucide-react";
import "./SoporteOrdenes.css";

export default function SoporteOrdenes({
  ordenesFiltradas,
  buscarOrden,
  setBuscarOrden,
  filtroEstadoOrden,
  setFiltroEstadoOrden,
  cargarOrdenes,
  cargando,
  coloresEstadoOrden,
  etiquetasEstadoOrden,
  formatearFecha,
  cambiarEstadoOrdenSoporte
}) {
  return (
    <>
      <div className="encabezado-pagina-sop">
        <h1>Gestión de Envíos</h1>
        <p>Actualizar procesos de envío y preparación logística para órdenes</p>
      </div>

      <div className="contenedor-tabla-sop">
        <div className="encabezado-tabla-sop">
          <h3>
            <Package size={18} style={{ marginRight: "8px" }} />
            Envíos Globales ({ordenesFiltradas.length})
          </h3>
          <div className="acciones-tabla-sop">
            <div className="contenedor-entrada-sop">
              <Search size={18} className="icono-entrada-sop" />
              <input
                className="entrada-busqueda-sop"
                type="text"
                placeholder="Buscar por ID u Usuario..."
                value={buscarOrden}
                onChange={(e) => setBuscarOrden(e.target.value)}
              />
            </div>
            <select
              className="select-filtro-sop"
              value={filtroEstadoOrden}
              onChange={(e) => setFiltroEstadoOrden(e.target.value)}
            >
              <option value="todos">Todos los Estados</option>
              <option value="packed">Empacada</option>
              <option value="shipped">Enviada</option>
              <option value="delivered">Entregada</option>
              <option value="paid">Pagada (Pendiente de Empaque)</option>
            </select>
            <button
              className="boton-secundario-sop"
              onClick={cargarOrdenes}
            >
              <RefreshCcw size={16} style={{ marginRight: "6px" }} /> Actualizar
            </button>
          </div>
        </div>

        {cargando ? (
          <div className="cargando-sop">
            <Loader2 className="animacion-giro" size={40} />
            <p>Cargando órdenes...</p>
          </div>
        ) : ordenesFiltradas.length === 0 ? (
          <div className="vacio-sop" style={{ padding: "60px" }}>
            <Package size={48} opacity={0.3} />
            <p>No se encontraron envíos</p>
          </div>
        ) : (
          <table className="tabla-sop">
            <thead>
              <tr>
                <th>ID Orden</th>
                <th>Cliente</th>
                <th>Productos</th>
                <th>Estado Envío</th>
                <th>Fecha Compra</th>
                <th>Cambiar Estado</th>
              </tr>
            </thead>
            <tbody>
              {ordenesFiltradas.map((ord) => (
                <tr key={ord._id}>
                  <td>
                    <strong>#{ord._id?.slice(-8)}</strong>
                  </td>
                  <td>
                    <div className="info-usuario-sop">
                      <div className="detalles-usuario-sop">
                        <strong>{ord.user?.nombre || "Cliente"}</strong>
                        <span>{ord.user?.email || ""}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {ord.items?.length || 0} producto(s)
                  </td>
                  <td>
                    <span
                      className={`insignia-sop ${coloresEstadoOrden[ord.status] || ""}`}
                    >
                      {etiquetasEstadoOrden[ord.status] || ord.status}
                    </span>
                  </td>
                  <td className="fecha-sop">
                    {formatearFecha(ord.createdAt)}
                  </td>
                  <td>
                    <div className="botones-accion-sop">
                      <button
                        className="boton-accion-sop warning"
                        onClick={() => cambiarEstadoOrdenSoporte(ord._id, "packed")}
                        title="Empacada"
                        disabled={ord.status === "packed" || ord.status === "shipped" || ord.status === "delivered"}
                      >
                        Empacar
                      </button>
                      <button
                        className="boton-accion-sop"
                        onClick={() => cambiarEstadoOrdenSoporte(ord._id, "shipped")}
                        title="Enviada"
                        style={{ color: "purple" }}
                        disabled={ord.status === "shipped" || ord.status === "delivered"}
                      >
                        Enviar
                      </button>
                      <button
                        className="boton-accion-sop success"
                        onClick={() => cambiarEstadoOrdenSoporte(ord._id, "delivered")}
                        title="Entregada"
                        disabled={ord.status === "delivered"}
                      >
                        <CheckCircle2 size={16} /> Entregar
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
