import { useState, useCallback } from "react";
import servicioAdministrador from "../../../services/administradorService";

/**
 * Hook para manejar la lógica CRUD de usuarios del módulo Administrador.
 */
export default function useAdministradorUsuarios({ mostrarNotificacion, setCargando }) {
  const [usuarios, setUsuarios] = useState([]);
  const [buscarUsuario, setBuscarUsuario] = useState("");
  const [mostrarModalUsuario, setMostrarModalUsuario] = useState(false);
  const [formularioUsuario, setFormularioUsuario] = useState({ nombre: "", email: "", password: "", role: "cliente" });
  const [mostrarModalRol, setMostrarModalRol] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [nuevoRol, setNuevoRol] = useState("");
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  const cargarUsuarios = useCallback(async () => {
    try {
      setCargando(true);
      const respuesta = await servicioAdministrador.obtenerUsuarios();
      if (respuesta.success) setUsuarios(respuesta.data);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    } finally {
      setCargando(false);
    }
  }, [setCargando]);

  const manejarCrearUsuario = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await servicioAdministrador.crearUsuario(formularioUsuario);
      if (respuesta.success) {
        mostrarNotificacion("Usuario creado exitosamente");
        setMostrarModalUsuario(false);
        setFormularioUsuario({ nombre: "", email: "", password: "", role: "cliente" });
        cargarUsuarios();
      }
    } catch (err) {
      mostrarNotificacion(err.response?.data?.message || "Error al crear usuario", "error");
    }
  };

  const manejarAsignarRol = async (e) => {
    e.preventDefault();
    if (!usuarioSeleccionado || !nuevoRol) return;
    try {
      const respuesta = await servicioAdministrador.asignarRol(usuarioSeleccionado._id, nuevoRol);
      if (respuesta.success) {
        mostrarNotificacion(`Rol actualizado a "${nuevoRol}"`);
        setMostrarModalRol(false);
        setUsuarioSeleccionado(null);
        cargarUsuarios();
      }
    } catch (err) {
      mostrarNotificacion(err.response?.data?.message || "Error al asignar rol", "error");
    }
  };

  const manejarCambiarEstadoUsuario = async (idUsuario, estadoActual) => {
    try {
      const respuesta = await servicioAdministrador.cambiarEstadoUsuario(idUsuario, !estadoActual);
      if (respuesta.success) {
        mostrarNotificacion(respuesta.message);
        cargarUsuarios();
      }
    } catch (err) {
      mostrarNotificacion("Error al cambiar estado", "error");
    }
  };

  const manejarEditarUsuario = async (e) => {
    e.preventDefault();
    if (!usuarioEditando) return;
    try {
      const datos = { ...formularioUsuario };
      if (!datos.password) delete datos.password;
      const respuesta = await servicioAdministrador.actualizarUsuario(usuarioEditando._id, datos);
      if (respuesta.success) {
        mostrarNotificacion("Usuario actualizado exitosamente");
        setMostrarModalUsuario(false);
        setUsuarioEditando(null);
        setFormularioUsuario({ nombre: "", email: "", password: "", role: "cliente" });
        cargarUsuarios();
      }
    } catch (err) {
      mostrarNotificacion(err.response?.data?.message || "Error al actualizar usuario", "error");
    }
  };

  const manejarEliminarUsuario = async (idUsuario, nombreUsuario) => {
    if (!window.confirm(`¿Seguro que deseas eliminar al usuario "${nombreUsuario}"? Esta acción es permanente.`)) return;
    try {
      const respuesta = await servicioAdministrador.eliminarUsuario(idUsuario);
      if (respuesta.success) {
        mostrarNotificacion(respuesta.message || "Usuario eliminado");
        cargarUsuarios();
      }
    } catch (err) {
      mostrarNotificacion(err.response?.data?.message || "Error al eliminar usuario", "error");
    }
  };

  return {
    usuarios,
    buscarUsuario, setBuscarUsuario,
    mostrarModalUsuario, setMostrarModalUsuario,
    formularioUsuario, setFormularioUsuario,
    mostrarModalRol, setMostrarModalRol,
    usuarioSeleccionado, setUsuarioSeleccionado,
    nuevoRol, setNuevoRol,
    usuarioEditando, setUsuarioEditando,
    cargarUsuarios,
    manejarCrearUsuario,
    manejarAsignarRol,
    manejarCambiarEstadoUsuario,
    manejarEditarUsuario,
    manejarEliminarUsuario,
  };
}


