import React, { useState, useEffect, useCallback } from "react";
import "./AdminDashboard.css";
import servicioAdmin from "../../services/adminService";
import { 
  Users, 
  Store, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Trophy, 
  Star, 
  Loader2 
} from 'lucide-react';

export default function AdminDashboard() {
  const [cargando, setCargando] = useState(false);
  const [kpis, setKpis] = useState(null);

  const cargarKPIs = useCallback(async () => {
    try {
      setCargando(true);
      const respuesta = await servicioAdmin.obtenerKPIs();
      if (respuesta.success) setKpis(respuesta.data);
    } catch (err) {
      console.error("Error al cargar KPIs:", err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarKPIs();
  }, [cargarKPIs]);

  if (cargando && !kpis) {
    return (
      <div className="cargando-admin">
        <Loader2 className="animacion-giro" size={40} />
        <p>Cargando métricas...</p>
      </div>
    );
  }

  if (!kpis) return null;

  const resumen = kpis.resumen || { totalUsuarios: 0, totalVendedores: 0, totalClientes: 0, totalProductos: 0 };
  const productosPorCategoria = kpis.productosPorCategoria || [];
  const topProductos = kpis.topProductos || [];
  const topVendedores = kpis.topVendedores || [];
  const maximoCategoria = productosPorCategoria.length > 0
    ? Math.max(...productosPorCategoria.map((c) => c.count))
    : 1;

  return (
    <>
      <div className="encabezado-pagina-admin">
        <h1>Dashboard Administrativo</h1>
        <p>Resumen general de la plataforma</p>
      </div>

      {/* Tarjetas KPI */}
      <div className="cuadricula-kpi-admin">
        <div className="tarjeta-kpi-admin">
          <div className="icono-kpi-admin blue"><Users size={24} /></div>
          <div className="info-kpi-admin">
            <h3>{resumen.totalUsuarios}</h3>
            <p>Usuarios totales</p>
          </div>
        </div>
        <div className="tarjeta-kpi-admin">
          <div className="icono-kpi-admin green"><Store size={24} /></div>
          <div className="info-kpi-admin">
            <h3>{resumen.totalVendedores}</h3>
            <p>Vendedores</p>
          </div>
        </div>
        <div className="tarjeta-kpi-admin">
          <div className="icono-kpi-admin purple"><ShoppingCart size={24} /></div>
          <div className="info-kpi-admin">
            <h3>{resumen.totalClientes}</h3>
            <p>Clientes</p>
          </div>
        </div>
        <div className="tarjeta-kpi-admin">
          <div className="icono-kpi-admin orange"><Package size={24} /></div>
          <div className="info-kpi-admin">
            <h3>{resumen.totalProductos}</h3>
            <p>Productos</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="cuadricula-graficos-admin">
        {/* Productos por Categoría */}
        <div className="tarjeta-grafico-admin">
          <h3><BarChart3 size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Productos por Categoría</h3>
          <div className="grafico-barras-admin">
            {productosPorCategoria.slice(0, 8).map((cat, i) => (
              <div className="item-barra-admin" key={cat._id}>
                <span className="etiqueta-barra-admin">{cat._id}</span>
                <div className="pista-barra-admin">
                  <div
                    className={`relleno-barra-admin ${["", "green", "purple", "orange"][i % 4]}`}
                    style={{ width: `${(cat.count / maximoCategoria) * 100}%` }}
                  >
                    <span className="valor-barra-admin">{cat.count}</span>
                  </div>
                </div>
              </div>
            ))}
            {productosPorCategoria.length === 0 && (
              <div className="vacio-admin">
                <BarChart3 size={40} opacity={0.2} />
                <p>Aún no hay datos de categorías</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Vendedores */}
        <div className="tarjeta-grafico-admin">
          <h3><Trophy size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Top Vendedores</h3>
          <div className="lista-ranking-admin">
            {topVendedores.slice(0, 5).map((v, i) => (
              <div className="item-ranking-admin" key={v._id}>
                <div className={`pos-ranking-admin ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""}`}>
                  {i + 1}
                </div>
                <div className="info-ranking-admin">
                  <strong>{v.nombre}</strong>
                  <span>{v.totalProductos} productos · {v.totalStock} stock</span>
                </div>
              </div>
            ))}
            {topVendedores.length === 0 && (
              <div className="vacio-admin">
                <Trophy size={40} opacity={0.2} />
                <p>Aún no hay vendedores</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Productos */}
        <div className="tarjeta-grafico-admin">
          <h3><Star size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Top Productos (por stock)</h3>
          <div className="lista-ranking-admin">
            {topProductos.slice(0, 5).map((p, i) => (
              <div className="item-ranking-admin" key={p._id}>
                <div className={`pos-ranking-admin ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""}`}>
                  {i + 1}
                </div>
                <div className="info-ranking-admin">
                  <strong>{p.name}</strong>
                  <span>{p.category} · ₡{p.price?.toLocaleString()}</span>
                </div>
                <div className="valor-ranking-admin">
                  {p.stock} uds
                </div>
              </div>
            ))}
            {topProductos.length === 0 && (
              <div className="vacio-admin">
                <Star size={40} opacity={0.2} />
                <p>Aún no hay productos</p>
              </div>
            )}
          </div>
        </div>

        {/* Distribución de Usuarios */}
        <div className="tarjeta-grafico-admin">
          <h3><BarChart3 size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Distribución de Usuarios</h3>
          <div className="grafico-barras-admin">
            <div className="item-barra-admin">
              <span className="etiqueta-barra-admin">Clientes</span>
              <div className="pista-barra-admin">
                <div
                  className="relleno-barra-admin green"
                  style={{ width: `${resumen.totalUsuarios > 0 ? (resumen.totalClientes / resumen.totalUsuarios) * 100 : 0}%` }}
                >
                  <span className="valor-barra-admin">{resumen.totalClientes}</span>
                </div>
              </div>
            </div>
            <div className="item-barra-admin">
              <span className="etiqueta-barra-admin">Vendedores</span>
              <div className="pista-barra-admin">
                <div
                  className="relleno-barra-admin"
                  style={{ width: `${resumen.totalUsuarios > 0 ? (resumen.totalVendedores / resumen.totalUsuarios) * 100 : 0}%` }}
                >
                  <span className="valor-barra-admin">{resumen.totalVendedores}</span>
                </div>
              </div>
            </div>
            <div className="item-barra-admin">
              <span className="etiqueta-barra-admin">Admins</span>
              <div className="pista-barra-admin">
                <div
                  className="relleno-barra-admin purple"
                  style={{ width: `${resumen.totalUsuarios > 0 ? ((resumen.totalUsuarios - resumen.totalClientes - resumen.totalVendedores) / resumen.totalUsuarios) * 100 : 0}%` }}
                >
                  <span className="valor-barra-admin">{resumen.totalUsuarios - resumen.totalClientes - resumen.totalVendedores}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
