import React from "react";
import "./AdministradorVendedores.css";
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

export default function AdministradorVendedores({
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
      <div className="encabezado-pagina-administrador">
        <h1>Gestión de Vendedores</h1>
        <p>Aprobar, suspender y ver métricas por vendedor</p>
      </div>

      <div className="contenedor-tabla-administrador">
        <div className="encabezado-tabla-administrador">
          <h3><Store size={18} style={{ marginRight: '8px' }} /> Vendedores ({vendedoresFiltrados.length})</h3>
          <div className="acciones-tabla-administrador">
            <div className="contenedor-entrada-administrador">
              <Search size={18} className="icono-entrada-administrador" />
              <input
                className="entrada-busqueda-administrador"
                type="text"
                placeholder="Buscar vendedor..."
                value={buscarVendedor}
                onChange={(e) => setBuscarVendedor(e.target.value)}
              />
            </div>
          </div>
        </div>

        {cargando ? (
          <div className="cargando-administrador">
            <Loader2 className="animacion-giro" size={40} />
            <p>Cargando vendedores...</p>
          </div>
        ) : (
          <table className="tabla-administrador">
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
                    <div className="info-usuario-administrador">
                      <div className="avatar-administrador">{obtenerIniciales(v.nombre)}</div>
                      <div className="detalles-usuario-administrador">
                        <strong>{v.nombre}</strong>
                        <span>{v.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`insignia-administrador ${v.activo !== false ? "activo" : "suspendido"}`}>
                      {v.activo !== false ? "Activo" : "Suspendido"}
                    </span>
                  </td>
                  <td>
                    <div className="metricas-vendedor-administrador">
                      <span className="pildora-metrica-administrador"><Package size={12} /> {v.metricas?.totalProductos || 0}</span>
                      <span className="pildora-metrica-administrador"><BarChart3 size={12} /> {v.metricas?.totalStock || 0} stock</span>
                      <span className="pildora-metrica-administrador"><Banknote size={12} /> ₡{(v.metricas?.precioPromedio || 0).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="fecha-auditoria-administrador">{formatearFecha(v.createdAt)}</td>
                  <td>
                    <div className="botones-accion-administrador">
                      {v.activo === false ? (
                        <button
                          className="boton-accion-administrador success"
                          onClick={() => manejarAprobarVendedor(v._id)}
                          title="Aprobar"
                        >
                          <Check size={16} style={{ marginRight: '6px' }} /> Aprobar
                        </button>
                      ) : (
                        <button
                          className="boton-accion-administrador danger"
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
                    <div className="vacio-administrador">
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

