import React from "react";
import {
  TrendingUp,
  ShoppingCart,
  PackageCheck,
  AlertTriangle,
  BarChart3,
  Package,
  Loader2,
} from "lucide-react";
import VendedorKPIs from "../../VendedorKPIs/VendedorKPIs";
import "./VendedorDashboard.css";

export default function VendedorDashboard({ 
  kpis, 
  cargando, 
  stockThreshold, 
  etiquetasEstado, 
  getStatusColor, 
  ordenes, 
  verDetalleOrden, 
  formatearFecha 
}) {
  if (cargando && !kpis) {
    return (
      <div className="cargando-vend">
        <Loader2 className="animacion-giro" size={40} />
        <p>Cargando métricas...</p>
      </div>
    );
  }

  if (!kpis) return null;

  const maxVentas =
    (kpis.topProductos || []).length > 0
      ? Math.max(...(kpis.topProductos || []).map((p) => p.sold || 0))
      : 1;

  const totalOrdEstado = Object.values(kpis.ordenesPorEstado || {}).reduce(
    (a, b) => a + b,
    0,
  );

  return (
    <>
      <div className="encabezado-pagina-vend">
        <h1>Dashboard del Vendedor</h1>
        <p>Resumen de tu tienda y métricas de rendimiento</p>
      </div>

      {/* KPIs */}
      <VendedorKPIs kpis={kpis} stockThreshold={stockThreshold} />

      {/* Gráficos */}
      <div className="cuadricula-graficos-vend">
        {/* Órdenes por Estado (Donut visual) */}
        <div className="tarjeta-grafico-vend">
          <h3>
            <BarChart3
              size={18}
              style={{ marginRight: "8px", verticalAlign: "middle" }}
            />
            Órdenes por Estado
          </h3>
          <div className="grafico-barras-vend">
            {Object.entries(kpis.ordenesPorEstado || {}).map(
              ([estado, cantidad], i) => (
                <div className="item-barra-vend" key={estado}>
                  <span className="etiqueta-barra-vend">
                    {etiquetasEstado[estado] || estado}
                  </span>
                  <div className="pista-barra-vend">
                    <div
                      className={`relleno-barra-vend ${getStatusColor(estado)}`}
                      style={{
                        width: `${totalOrdEstado > 0 ? (cantidad / totalOrdEstado) * 100 : 0}%`,
                      }}
                    >
                      <span className="valor-barra-vend">{cantidad}</span>
                    </div>
                  </div>
                </div>
              ),
            )}
            {totalOrdEstado === 0 && (
              <div className="vacio-vend">
                <ShoppingCart size={40} opacity={0.2} />
                <p>Aún no hay datos de órdenes</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Productos más vendidos */}
        <div className="tarjeta-grafico-vend">
          <h3>
            <TrendingUp
              size={18}
              style={{ marginRight: "8px", verticalAlign: "middle" }}
            />
            Top Productos Más Vendidos
          </h3>
          <div className="grafico-barras-vend">
            {(kpis.topProductos || []).map((p, i) => (
              <div className="item-barra-vend" key={p._id}>
                <span className="etiqueta-barra-vend">{p.name}</span>
                <div className="pista-barra-vend">
                  <div
                    className={`relleno-barra-vend ${["blue", "green", "purple", "orange", "red"][i % 5]}`}
                    style={{
                      width: `${maxVentas > 0 ? ((p.sold || 0) / maxVentas) * 100 : 0}%`,
                    }}
                  >
                    <span className="valor-barra-vend">{p.sold || 0}</span>
                  </div>
                </div>
              </div>
            ))}
            {(!kpis.topProductos || kpis.topProductos.length === 0) && (
              <div className="vacio-vend">
                <Package size={40} opacity={0.2} />
                <p>Aún no hay productos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tablas: Órdenes recientes y Stock bajo */}
      <div className="cuadricula-graficos-vend">
        <div className="tarjeta-grafico-vend">
          <h3>
            <ShoppingCart
              size={18}
              style={{ marginRight: "8px", verticalAlign: "middle" }}
            />
            Órdenes Recientes
          </h3>
          {ordenes && ordenes.length > 0 ? (
            <table className="tabla-vend mini">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.slice(0, 5).map((o) => (
                  <tr
                    key={o._id}
                    onClick={() => verDetalleOrden(o)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <strong>#{o._id?.slice(-6)}</strong>
                    </td>
                    <td>
                      <span
                        className={`insignia-vend ${getStatusColor(o.estado)}`}
                      >
                        {etiquetasEstado[o.estado] || o.estado}
                      </span>
                    </td>
                    <td className="fecha-vend">
                      {formatearFecha(o.createdAt)}
                    </td>
                    <td className="monto-vend">
                      ₡{(o.total || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="vacio-vend">
              <ShoppingCart size={40} opacity={0.2} />
              <p>No hay órdenes recientes</p>
            </div>
          )}
        </div>

        <div className="tarjeta-grafico-vend">
          <h3>
            <AlertTriangle
              size={18}
              style={{ marginRight: "8px", verticalAlign: "middle" }}
            />
            Productos con Stock Bajo
          </h3>
          {kpis.productosStockBajoLista && kpis.productosStockBajoLista.length > 0 ? (
            <table className="tabla-vend mini">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Stock</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {(kpis.productosStockBajoLista || []).map((p) => (
                  <tr key={p._id}>
                    <td>
                      <strong>{p.name}</strong>
                    </td>
                    <td>
                      <span className="insignia-vend red">{p.stock}</span>
                    </td>
                    <td className="monto-vend">
                      ₡{p.price?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="vacio-vend">
              <PackageCheck size={40} opacity={0.2} />
              <p>No hay productos con stock bajo</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
