import React from "react";
import "./ModalesAdmin.css";
import { UserPlus, X, Key, Pencil, Plus } from "lucide-react";

export function ModalCrearUsuario({
  mostrar,
  cerrar,
  formulario,
  setFormulario,
  manejarSubmit,
  editando
}) {
  if (!mostrar) return null;

  return (
    <div className="superposicion-modal-admin">
      <div className="modal-admin">
        <div className="encabezado-modal-admin">
          <h2>
            {editando ? (
              <><Pencil size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Editar Usuario</>
            ) : (
              <><UserPlus size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Nuevo Usuario</>
            )}
          </h2>
          <button className="cerrar-modal-admin" onClick={cerrar}><X size={20} /></button>
        </div>
        <form className="formulario-admin" onSubmit={manejarSubmit}>
          <div className="grupo-formulario-admin">
            <label>Nombre completo</label>
            <input
              type="text"
              value={formulario.nombre}
              onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>
          <div className="grupo-formulario-admin">
            <label>Email</label>
            <input
              type="email"
              value={formulario.email}
              onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
              placeholder="usuario@example.com"
              required
            />
          </div>
          <div className="fila-formulario-admin">
            <div className="grupo-formulario-admin">
              <label>{editando ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña"}</label>
              <input
                type="password"
                value={formulario.password}
                onChange={(e) => setFormulario({ ...formulario, password: e.target.value })}
                placeholder={editando ? "Sin cambios" : "Mín. 6 caracteres"}
                minLength={editando ? 0 : 6}
                required={!editando}
              />
            </div>
            <div className="grupo-formulario-admin">
              <label>Rol</label>
              <select
                value={formulario.role}
                onChange={(e) => setFormulario({ ...formulario, role: e.target.value })}
              >
                <option value="cliente">Cliente</option>
                <option value="vendedor">Vendedor</option>
                <option value="administrador">Administrador</option>
                <option value="soporte">Soporte</option>
              </select>
            </div>
          </div>
          <div className="acciones-formulario-admin">
            <button type="button" className="boton-cancelar-admin" onClick={cerrar}>
              Cancelar
            </button>
            <button type="submit" className="boton-enviar-admin">
              {editando ? "Guardar Cambios" : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ModalAsignarRol({
  mostrar,
  cerrar,
  usuarioSeleccionado,
  nuevoRol,
  setNuevoRol,
  manejarAsignarRol
}) {
  if (!mostrar || !usuarioSeleccionado) return null;

  return (
    <div className="superposicion-modal-admin">
      <div className="modal-admin">
        <div className="encabezado-modal-admin">
          <h2><Key size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Asignar Rol</h2>
          <button className="cerrar-modal-admin" onClick={cerrar}><X size={20} /></button>
        </div>
        <div className="formulario-admin">
          <p style={{ color: "#9ca3af", margin: "0 0 16px 0" }}>
            Cambiar rol de <strong style={{ color: "var(--admin-azul)" }}>{usuarioSeleccionado.nombre}</strong>
          </p>
          <div className="grupo-formulario-admin">
            <label>Nuevo Rol</label>
            <select value={nuevoRol} onChange={(e) => setNuevoRol(e.target.value)}>
              <option value="cliente">Cliente</option>
              <option value="vendedor">Vendedor</option>
              <option value="administrador">Administrador</option>
              <option value="soporte">Soporte</option>
            </select>
          </div>
          <div className="acciones-formulario-admin">
            <button className="boton-cancelar-admin" onClick={cerrar}>
              Cancelar
            </button>
            <button className="boton-enviar-admin" onClick={manejarAsignarRol}>
              Guardar Rol
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModalCategoria({
  mostrar,
  cerrar,
  categoriaEditando,
  formularioCategoria,
  setFormularioCategoria,
  manejarGuardarCategoria
}) {
  if (!mostrar) return null;

  return (
    <div className="superposicion-modal-admin">
      <div className="modal-admin">
        <div className="encabezado-modal-admin">
          <h2>{categoriaEditando ? <><Pencil size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Editar Categoría</> : <><Plus size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Nueva Categoría</>}</h2>
          <button className="cerrar-modal-admin" onClick={cerrar}><X size={20} /></button>
        </div>
        <form className="formulario-admin" onSubmit={manejarGuardarCategoria}>
          <div className="grupo-formulario-admin">
            <label>Nombre</label>
            <input
              type="text"
              value={formularioCategoria.nombre}
              onChange={(e) => setFormularioCategoria({ ...formularioCategoria, nombre: e.target.value })}
              placeholder="Ej: Computadoras"
              required
            />
          </div>
          <div className="grupo-formulario-admin">
            <label>Descripción (opcional)</label>
            <textarea
              value={formularioCategoria.descripcion}
              onChange={(e) => setFormularioCategoria({ ...formularioCategoria, descripcion: e.target.value })}
              placeholder="Descripción breve de la categoría..."
              rows="3"
            />
          </div>
          <div className="acciones-formulario-admin">
            <button type="button" className="boton-cancelar-admin" onClick={cerrar}>
              Cancelar
            </button>
            <button type="submit" className="boton-enviar-admin">
              {categoriaEditando ? "Guardar Cambios" : "Crear Categoría"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
