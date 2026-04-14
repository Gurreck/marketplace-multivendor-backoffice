import React from "react";
import "./AdministradorCategorias.css";
import { 
  Tag, 
  PlusCircle, 
  Pencil, 
  Play, 
  Pause, 
  Trash2,
  Loader2
} from 'lucide-react';

export default function AdministradorCategorias({
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
      <div className="encabezado-pagina-administrador">
        <h1>Gestión de Categorías</h1>
        <p>Crear, editar, activar y desactivar categorías</p>
      </div>

      <div className="contenedor-tabla-administrador">
        <div className="encabezado-tabla-administrador">
          <h3><Tag size={18} style={{ marginRight: '8px' }} /> Categorías ({categorias.length})</h3>
          <div className="acciones-tabla-administrador">
            <button
              className="boton-primario-administrador"
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
          <div className="cargando-administrador">
            <Loader2 className="animacion-giro" size={40} />
            <p>Cargando categorías...</p>
          </div>
        ) : (
          <table className="tabla-administrador">
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
                  <td className="detalles-auditoria-administrador">{cat.descripcion || "—"}</td>
                  <td>
                    <span className={`insignia-administrador ${cat.activa ? "activo" : "inactivo"}`}>
                      {cat.activa ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="fecha-auditoria-administrador">{formatearFecha(cat.createdAt)}</td>
                  <td>
                    <div className="botones-accion-administrador">
                      <button
                        className="boton-accion-administrador"
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
                        className={`boton-accion-administrador ${cat.activa ? "warning" : "success"}`}
                        onClick={() => manejarAlternarCategoria(cat._id)}
                        title={cat.activa ? "Desactivar" : "Activar"}
                      >
                        {cat.activa ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <button
                        className="boton-accion-administrador danger"
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
                    <div className="vacio-administrador">
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

