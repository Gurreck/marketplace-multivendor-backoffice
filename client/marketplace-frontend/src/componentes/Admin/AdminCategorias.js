import React from "react";
import "./AdminCategorias.css";
import { 
  Tag, 
  PlusCircle, 
  Pencil, 
  Play, 
  Pause, 
  Trash2,
  Loader2
} from 'lucide-react';

export default function AdminCategorias({
  categorias,
  setCategoriaEditando,
  setFormularioCategoria,
  setMostrarModalCategoria,
  cargando,
  manejarAlternarCategoria,
  manejarEliminarCategoria,
  formatearFecha
}) {
  return (
    <>
      <div className="encabezado-pagina-admin">
        <h1>Gestión de Categorías</h1>
        <p>Crear, editar, activar y desactivar categorías</p>
      </div>

      <div className="contenedor-tabla-admin">
        <div className="encabezado-tabla-admin">
          <h3><Tag size={18} style={{ marginRight: '8px' }} /> Categorías ({categorias.length})</h3>
          <div className="acciones-tabla-admin">
            <button
              className="boton-primario-admin"
              onClick={() => {
                setCategoriaEditando(null);
                setFormularioCategoria({ nombre: "", descripcion: "" });
                setMostrarModalCategoria(true);
              }}
            >
              <PlusCircle size={18} style={{ marginRight: '8px' }} /> Nueva Categoría
            </button>
          </div>
        </div>

        {cargando ? (
          <div className="cargando-admin">
            <Loader2 className="animacion-giro" size={40} />
            <p>Cargando categorías...</p>
          </div>
        ) : (
          <table className="tabla-admin">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((cat) => (
                <tr key={cat._id}>
                  <td><strong>{cat.nombre}</strong></td>
                  <td className="detalles-auditoria-admin">{cat.descripcion || "—"}</td>
                  <td>
                    <span className={`insignia-admin ${cat.activa ? "activo" : "inactivo"}`}>
                      {cat.activa ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="fecha-auditoria-admin">{formatearFecha(cat.createdAt)}</td>
                  <td>
                    <div className="botones-accion-admin">
                      <button
                        className="boton-accion-admin"
                        onClick={() => {
                          setCategoriaEditando(cat);
                          setFormularioCategoria({ nombre: cat.nombre, descripcion: cat.descripcion || "" });
                          setMostrarModalCategoria(true);
                        }}
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className={`boton-accion-admin ${cat.activa ? "warning" : "success"}`}
                        onClick={() => manejarAlternarCategoria(cat._id)}
                        title={cat.activa ? "Desactivar" : "Activar"}
                      >
                        {cat.activa ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <button
                        className="boton-accion-admin danger"
                        onClick={() => manejarEliminarCategoria(cat._id)}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categorias.length === 0 && (
                <tr>
                  <td colSpan="5">
                    <div className="vacio-admin">
                      <Tag size={40} opacity={0.2} />
                      <p>No hay categorías registradas</p>
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
