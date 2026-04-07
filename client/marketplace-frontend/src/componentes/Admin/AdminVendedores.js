import React from "react";
import "./AdminVendedores.css";
import { 
  Store, 
  Search, 
  Check, 
  ShieldAlert, 
  Package, 
  BarChart3, 
  Banknote,
  Loader2
} from 'lucide-react';

export default function AdminVendedores({
  vendedores,
  buscarVendedor,
  setBuscarVendedor,
  cargando,
  manejarAprobarVendedor,
  manejarSuspenderVendedor,
  obtenerIniciales,
  formatearFecha
}) {
  const vendedoresFiltrados = vendedores.filter((v) =>
    v.nombre?.toLowerCase().includes(buscarVendedor.toLowerCase()) ||
    v.email?.toLowerCase().includes(buscarVendedor.toLowerCase())
  );

  return (
    <>
      <div className="encabezado-pagina-admin">
        <h1>Gestión de Vendedores</h1>
        <p>Aprobar, suspender y ver métricas por vendedor</p>
      </div>

      <div className="contenedor-tabla-admin">
        <div className="encabezado-tabla-admin">
          <h3><Store size={18} style={{ marginRight: '8px' }} /> Vendedores ({vendedoresFiltrados.length})</h3>
          <div className="acciones-tabla-admin">
            <div className="contenedor-entrada-admin">
              <Search size={18} className="icono-entrada-admin" />
              <input
                className="entrada-busqueda-admin"
                type="text"
                placeholder="Buscar vendedor..."
                value={buscarVendedor}
                onChange={(e) => setBuscarVendedor(e.target.value)}
              />
            </div>
          </div>
        </div>

        {cargando ? (
          <div className="cargando-admin">
            <Loader2 className="animacion-giro" size={40} />
            <p>Cargando vendedores...</p>
          </div>
        ) : (
          <table className="tabla-admin">
            <thead>
              <tr>
                <th>Vendedor</th>
                <th>Estado</th>
                <th>Métricas</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vendedoresFiltrados.map((v) => (
                <tr key={v._id}>
                  <td>
                    <div className="info-usuario-admin">
                      <div className="avatar-admin">{obtenerIniciales(v.nombre)}</div>
                      <div className="detalles-usuario-admin">
                        <strong>{v.nombre}</strong>
                        <span>{v.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`insignia-admin ${v.activo !== false ? "activo" : "suspendido"}`}>
                      {v.activo !== false ? "Activo" : "Suspendido"}
                    </span>
                  </td>
                  <td>
                    <div className="metricas-vendedor-admin">
                      <span className="pildora-metrica-admin"><Package size={12} /> {v.metricas?.totalProductos || 0}</span>
                      <span className="pildora-metrica-admin"><BarChart3 size={12} /> {v.metricas?.totalStock || 0} stock</span>
                      <span className="pildora-metrica-admin"><Banknote size={12} /> ₡{(v.metricas?.precioPromedio || 0).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="fecha-auditoria-admin">{formatearFecha(v.createdAt)}</td>
                  <td>
                    <div className="botones-accion-admin">
                      {v.activo === false ? (
                        <button
                          className="boton-accion-admin success"
                          onClick={() => manejarAprobarVendedor(v._id)}
                          title="Aprobar"
                        >
                          <Check size={16} style={{ marginRight: '6px' }} /> Aprobar
                        </button>
                      ) : (
                        <button
                          className="boton-accion-admin danger"
                          onClick={() => manejarSuspenderVendedor(v._id)}
                          title="Suspender"
                        >
                          <ShieldAlert size={16} style={{ marginRight: '6px' }} /> Suspender
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {vendedoresFiltrados.length === 0 && (
                <tr>
                  <td colSpan="5">
                    <div className="vacio-admin">
                      <Store size={40} opacity={0.2} />
                      <p>No se encontraron vendedores</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
