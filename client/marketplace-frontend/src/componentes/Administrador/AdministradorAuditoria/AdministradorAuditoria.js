import React from "react";
import "./AdministradorAuditoria.css";
import { 
  ClipboardList, 
  Filter, 
  RefreshCcw, 
  ArrowLeft, 
  ArrowRight,
  Loader2
} from 'lucide-react';

export default function AdministradorAuditoria({
  filtrosAuditoria,
  setFiltrosAuditoria,
  cargarAuditoria,
  cargando,
  paginacionAuditoria,
  registrosAuditoria,
  obtenerIniciales,
  formatearAccion,
  formatearFecha
}) {
  return (
    <>
      <div className="encabezado-pagina-administrador">
        <h1>Auditoría</h1>
        <p>Registro de acciones críticas del sistema</p>
      </div>

      {/* Filtros */}
      <div className="filtros-administrador">
        <div className="grupo-filtro-administrador">
          <label>Tipo de Acción</label>
          <select
            value={filtrosAuditoria.accion}
            onChange={(e) => setFiltrosAuditoria({ ...filtrosAuditoria, accion: e.target.value })}
          >
            <option value="">Todas</option>
            <option value="crear_usuario">Crear usuario</option>
            <option value="desactivar_usuario">Desactivar usuario</option>
            <option value="activar_usuario">Activar usuario</option>
            <option value="asignar_rol">Asignar rol</option>
            <option value="aprobar_vendedor">Aprobar vendedor</option>
            <option value="suspender_vendedor">Suspender vendedor</option>
            <option value="crear_categoria">Crear categoría</option>
            <option value="editar_categoria">Editar categoría</option>
            <option value="activar_categoria">Activar categoría</option>
            <option value="desactivar_categoria">Desactivar categoría</option>
            <option value="eliminar_categoria">Eliminar categoría</option>
          </select>
        </div>
        <div className="grupo-filtro-administrador">
          <label>Entidad</label>
          <select
            value={filtrosAuditoria.entidad}
            onChange={(e) => setFiltrosAuditoria({ ...filtrosAuditoria, entidad: e.target.value })}
          >
            <option value="">Todas</option>
            <option value="usuario">Usuario</option>
            <option value="vendedor">Vendedor</option>
            <option value="categoria">Categoría</option>
            <option value="producto">Producto</option>
            <option value="orden">Orden</option>
            <option value="cupon">Cupón</option>
          </select>
        </div>
        <div className="grupo-filtro-administrador">
          <label>Fecha Desde</label>
          <input
            type="date"
            value={filtrosAuditoria.fechaDesde}
            onChange={(e) => setFiltrosAuditoria({ ...filtrosAuditoria, fechaDesde: e.target.value })}
          />
        </div>
        <div className="grupo-filtro-administrador">
          <label>Fecha Hasta</label>
          <input
            type="date"
            value={filtrosAuditoria.fechaHasta}
            onChange={(e) => setFiltrosAuditoria({ ...filtrosAuditoria, fechaHasta: e.target.value })}
          />
        </div>
        <button
          className="boton-filtro-administrador"
          onClick={() => cargarAuditoria(1)}
        >
          <Filter size={16} style={{ marginRight: '6px' }} /> Filtrar
        </button>
        <button
          className="boton-filtro-administrador"
          onClick={() => {
            setFiltrosAuditoria({ usuario: "", accion: "", entidad: "", fechaDesde: "", fechaHasta: "" });
            setTimeout(() => cargarAuditoria(1), 100);
          }}
        >
          <RefreshCcw size={16} style={{ marginRight: '6px' }} /> Limpiar
        </button>
      </div>

      <div className="contenedor-tabla-administrador">
        <div className="encabezado-tabla-administrador">
          <h3><ClipboardList size={18} style={{ marginRight: '8px' }} /> Registros de Auditoría ({paginacionAuditoria.total})</h3>
        </div>

        {cargando ? (
          <div className="cargando-administrador">
            <Loader2 className="animacion-giro" size={40} />
            <p>Cargando registros...</p>
          </div>
        ) : (
          <>
            <table className="tabla-administrador">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Entidad</th>
                  <th>Detalles</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {registrosAuditoria.map((registro) => (
                  <tr key={registro._id}>
                    <td>
                      <div className="info-usuario-administrador">
                        <div className="avatar-administrador">{obtenerIniciales(registro.usuarioNombre)}</div>
                        <div className="detalles-usuario-administrador">
                          <strong>{registro.usuarioNombre}</strong>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="insignia-administrador vendedor">
                        {formatearAccion(registro.accion)}
                      </span>
                    </td>
                    <td>
                      <span className="insignia-administrador cliente" style={{ textTransform: "capitalize" }}>
                        {registro.entidad}
                      </span>
                    </td>
                    <td className="detalles-auditoria-administrador" title={registro.detalles}>
                      {registro.detalles || "—"}
                    </td>
                    <td className="fecha-auditoria-administrador">{formatearFecha(registro.createdAt)}</td>
                  </tr>
                ))}
                {registrosAuditoria.length === 0 && (
                  <tr>
                    <td colSpan="5">
                      <div className="vacio-administrador">
                        <ClipboardList size={40} opacity={0.2} />
                        <p>No se encontraron registros de auditoría</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Paginación */}
            {paginacionAuditoria.totalPaginas > 1 && (
              <div className="paginacion-administrador">
                <button
                  className="boton-pagina-administrador"
                  disabled={paginacionAuditoria.paginaActual === 1}
                  onClick={() => cargarAuditoria(paginacionAuditoria.paginaActual - 1)}
                >
                  <ArrowLeft size={16} />
                </button>
                {Array.from({ length: paginacionAuditoria.totalPaginas }, (_, i) => i + 1)
                  .filter((p) =>
                    p === 1 ||
                    p === paginacionAuditoria.totalPaginas ||
                    Math.abs(p - paginacionAuditoria.paginaActual) <= 2
                  )
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ color: "#9ca3af" }}>...</span>}
                      <button
                        className={`boton-pagina-administrador ${paginacionAuditoria.paginaActual === p ? "activo" : ""}`}
                        onClick={() => cargarAuditoria(p)}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  className="boton-pagina-administrador"
                  disabled={paginacionAuditoria.paginaActual === paginacionAuditoria.totalPaginas}
                  onClick={() => cargarAuditoria(paginacionAuditoria.paginaActual + 1)}
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

