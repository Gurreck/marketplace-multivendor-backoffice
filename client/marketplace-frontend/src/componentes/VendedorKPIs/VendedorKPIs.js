import React from "react";
import './VendedorKPIs.css';
import {
  TrendingUp,
  ShoppingCart,
  Clock,
  PackageCheck,
  AlertTriangle,
} from "lucide-react";

/**
 * Componente que renderiza las tarjetas KPI del dashboard del vendedor.
 */
export default function VendedorKPIs({ kpis, stockThreshold }) {
  return (
    <div className="cuadricula-kpi-vend">
      <div className="tarjeta-kpi-vend">
        <div className="icono-kpi-vend blue">
          <TrendingUp size={24} />
        </div>
        <div className="info-kpi-vend">
          <h3>₡{(kpis.ventasTotales || 0).toLocaleString()}</h3>
          <p>Ventas Totales</p>
        </div>
      </div>
      <div className="tarjeta-kpi-vend">
        <div className="icono-kpi-vend green">
          <ShoppingCart size={24} />
        </div>
        <div className="info-kpi-vend">
          <h3>{kpis.ordenesTotales}</h3>
          <p>Órdenes Totales</p>
        </div>
      </div>
      <div className="tarjeta-kpi-vend">
        <div className="icono-kpi-vend orange">
          <Clock size={24} />
        </div>
        <div className="info-kpi-vend">
          <h3>{kpis.ordenesPendientes}</h3>
          <p>Órdenes Pendientes</p>
        </div>
      </div>
      <div className="tarjeta-kpi-vend">
        <div className="icono-kpi-vend purple">
          <PackageCheck size={24} />
        </div>
        <div className="info-kpi-vend">
          <h3>{kpis.productosActivos}</h3>
          <p>Productos Activos</p>
        </div>
      </div>
      <div className="tarjeta-kpi-vend">
        <div className="icono-kpi-vend red">
          <AlertTriangle size={24} />
        </div>
        <div className="info-kpi-vend">
          <h3>{kpis.productosStockBajo}</h3>
          <p>Stock Bajo (&le;{stockThreshold})</p>
        </div>
      </div>
    </div>
  );
}

