import React from "react";
import "./AdminUsuarios.css";
import { 
  Users, 
  Search, 
  PlusCircle, 
  Key, 
  Ban, 
  Check, 
  Loader2 
} from 'lucide-react';

export default function AdminUsuarios({
  usuarios,
  buscarUsuario,
  setBuscarUsuario,
  setFormularioUsuario,
  setMostrarModalUsuario,
  cargando,
  setUsuarioSeleccionado,
  setNuevoRol,
  setMostrarModalRol,
  manejarCambiarEstadoUsuario,
  obtenerIniciales,
  formatearFecha
}) {
  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre?.toLowerCase().includes(buscarUsuario.toLowerCase()) ||
    u.email?.toLowerCase().includes(buscarUsuario.toLowerCase())
  );

  return (
    <>
      <div className="encabezado-pagina-admin">
        <h1>Gestión de Usuarios</h1>
        <p>Crear, listar, asignar roles y desactivar usuarios</p>
      </div>

      <div className="contenedor-tabla-admin">
        <div className="encabezado-tabla-admin">
          <h3><Users size={18} style={{ marginRight: '8px' }} /> Usuarios ({usuariosFiltrados.length})</h3>
          <div className="acciones-tabla-admin">
            <div className="contenedor-entrada-admin">
              <Search size={18} className="icono-entrada-admin" />
              <input
                className="entrada-busqueda-admin"
                type="text"
                placeholder="Buscar usuario..."
                value={buscarUsuario}
                onChange={(e) => setBuscarUsuario(e.target.value)}
              />
            </div>
            <button
              className="boton-primario-admin"
              onClick={() => {
                setFormularioUsuario({ nombre: "", email: "", password: "", role: "cliente" });
                setMostrarModalUsuario(true);
              }}
            >
              <PlusCircle size={18} style={{ marginRight: '8px' }} /> Nuevo Usuario
            </button>
          </div>
        </div>

        {cargando ? (
          <div className="cargando-admin">
            <Loader2 className="animacion-giro" size={40} />
            <p>Cargando usuarios...</p>
          </div>
        ) : (
          <table className="tabla-admin">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="info-usuario-admin">
                      <div className="avatar-admin">{obtenerIniciales(u.nombre)}</div>
                      <div className="detalles-usuario-admin">
                        <strong>{u.nombre}</strong>
                        <span>{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`insignia-admin ${u.role === "administrador" ? "admin" : u.role}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`insignia-admin ${u.activo !== false ? "activo" : "inactivo"}`}>
                      {u.activo !== false ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="fecha-auditoria-admin">{formatearFecha(u.createdAt)}</td>
                  <td>
                    <div className="botones-accion-admin">
                      <button
                        className="boton-accion-admin"
                        onClick={() => {
                          setUsuarioSeleccionado(u);
                          setNuevoRol(u.role);
                          setMostrarModalRol(true);
                        }}
                        title="Asignar rol"
                      >
                        <Key size={16} />
                      </button>
                      <button
                        className={`boton-accion-admin ${u.activo !== false ? "danger" : "success"}`}
                        onClick={() => manejarCambiarEstadoUsuario(u._id, u.activo !== false)}
                        title={u.activo !== false ? "Desactivar" : "Activar"}
                      >
                        {u.activo !== false ? <Ban size={16} /> : <Check size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="5">
                    <div className="vacio-admin">
                      <Users size={40} opacity={0.2} />
                      <p>No se encontraron usuarios</p>
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
