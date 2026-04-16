import React, { useState, useEffect, useCallback } from "react";
import "./AdministradorDashboard.css";
import servicioAdministrador from "../../../services/administradorService";
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

export default function AdministradorDashboard() {
  const [cargando, setCargando] = useState(false);
  const [kpis, setKpis] = useState(null);

  const cargarKPIs = useCallback(async () => {
    try {
      setCargando(true);
      const respuesta = await servicioAdministrador.obtenerKPIs();
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
      <div className="cargando-administrador">
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
      <div className="encabezado-pagina-administrador">
        <h1>Dashboard Administradoristrativo</h1>
        <p>Resumen general de la plataforma</p>
      </div>

      {/* Tarjetas KPI */}
      <div className="cuadricula-kpi-administrador">
        <div className="tarjeta-kpi-administrador">
          <div className="icono-kpi-administrador blue"><Users size={24} /></div>
          <div className="info-kpi-administrador">
            <h3>{resumen.totalUsuarios}</h3>
            <p>Usuarios totales</p>
          </div>
        </div>
        <div className="tarjeta-kpi-administrador">
          <div className="icono-kpi-administrador green"><Store size={24} /></div>
          <div className="info-kpi-administrador">
            <h3>{resumen.totalVendedores}</h3>
            <p>Vendedores</p>
          </div>
        </div>
        <div className="tarjeta-kpi-administrador">
          <div className="icono-kpi-administrador purple"><ShoppingCart size={24} /></div>
          <div className="info-kpi-administrador">
            <h3>{resumen.totalClientes}</h3>
            <p>Clientes</p>
          </div>
        </div>
        <div className="tarjeta-kpi-administrador">
          <div className="icono-kpi-administrador orange"><Package size={24} /></div>
          <div className="info-kpi-administrador">
            <h3>{resumen.totalProductos}</h3>
            <p>Productos</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="cuadricula-graficos-administrador">
        {/* Productos por Categoría */}
        <div className="tarjeta-grafico-administrador">
          <h3><BarChart3 size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Productos por Categoría</h3>
          <div className="grafico-barras-administrador">
            {productosPorCategoria.slice(0, 8).map((cat, i) => (
              <div className="item-barra-administrador" key={cat._id}>
                <span className="etiqueta-barra-administrador">{cat._id}</span>
                <div className="pista-barra-administrador">
                  <div
                    className={`relleno-barra-administrador ${["", "green", "purple", "orange"][i % 4]}`}
                    style={{ width: `${(cat.count / maximoCategoria) * 100}%` }}
                  >
                    <span className="valor-barra-administrador">{cat.count}</span>
                  </div>
                </div>
              </div>
            ))}
            {productosPorCategoria.length === 0 && (
              <div className="vacio-administrador">
                <BarChart3 size={40} opacity={0.2} />
                <p>Aún no hay datos de categorías</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Vendedores */}
        <div className="tarjeta-grafico-administrador">
          <h3><Trophy size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Top Vendedores</h3>
          <div className="lista-ranking-administrador">
            {topVendedores.slice(0, 5).map((v, i) => (
              <div className="item-ranking-administrador" key={v._id}>
                <div className={`pos-ranking-administrador ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""}`}>
                  {i + 1}
                </div>
                <div className="info-ranking-administrador">
                  <strong>{v.nombre}</strong>
                  <span>{v.totalProductos} productos · {v.totalStock} stock</span>
                </div>
              </div>
            ))}
            {topVendedores.length === 0 && (
              <div className="vacio-administrador">
                <Trophy size={40} opacity={0.2} />
                <p>Aún no hay vendedores</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Productos */}
        <div className="tarjeta-grafico-administrador">
          <h3><Star size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Top Productos (por stock)</h3>
          <div className="lista-ranking-administrador">
            {topProductos.slice(0, 5).map((p, i) => (
              <div className="item-ranking-administrador" key={p._id}>
                <div className={`pos-ranking-administrador ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""}`}>
                  {i + 1}
                </div>
                <div className="info-ranking-administrador">
                  <strong>{p.name}</strong>
                  <span>{p.category} · ₡{p.price?.toLocaleString()}</span>
                </div>
                <div className="valor-ranking-administrador">
                  {p.stock} uds
                </div>
              </div>
            ))}
            {topProductos.length === 0 && (
              <div className="vacio-administrador">
                <Star size={40} opacity={0.2} />
                <p>Aún no hay productos</p>
              </div>
            )}
          </div>
        </div>

        {/* Distribución de Usuarios */}
        <div className="tarjeta-grafico-administrador">
          <h3><BarChart3 size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Distribución de Usuarios</h3>
          <div className="grafico-barras-administrador">
            <div className="item-barra-administrador">
              <span className="etiqueta-barra-administrador">Clientes</span>
              <div className="pista-barra-administrador">
                <div
                  className="relleno-barra-administrador green"
                  style={{ width: `${resumen.totalUsuarios > 0 ? (resumen.totalClientes / resumen.totalUsuarios) * 100 : 0}%` }}
                >
                  <span className="valor-barra-administrador">{resumen.totalClientes}</span>
                </div>
              </div>
            </div>
            <div className="item-barra-administrador">
              <span className="etiqueta-barra-administrador">Vendedores</span>
              <div className="pista-barra-administrador">
                <div
                  className="relleno-barra-administrador"
                  style={{ width: `${resumen.totalUsuarios > 0 ? (resumen.totalVendedores / resumen.totalUsuarios) * 100 : 0}%` }}
                >
                  <span className="valor-barra-administrador">{resumen.totalVendedores}</span>
                </div>
              </div>
            </div>
            <div className="item-barra-administrador">
              <span className="etiqueta-barra-administrador">Administradors</span>
              <div className="pista-barra-administrador">
                <div
                  className="relleno-barra-administrador purple"
                  style={{ width: `${resumen.totalUsuarios > 0 ? ((resumen.totalUsuarios - resumen.totalClientes - resumen.totalVendedores) / resumen.totalUsuarios) * 100 : 0}%` }}
                >
                  <span className="valor-barra-administrador">{resumen.totalUsuarios - resumen.totalClientes - resumen.totalVendedores}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

