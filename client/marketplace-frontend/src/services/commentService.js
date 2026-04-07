import api from "./api";

export const servicioComentarios = {
  // Obtener comentarios de un producto
  obtenerComentariosPorProducto: (idProducto) => 
    api.get(`/comments/product/${idProducto}`),
  
  // Crear un nuevo comentario
  crearComentario: (datos) => 
    api.post("/comments", datos),
  
  // Eliminar un comentario
  eliminarComentario: (idComentario) => 
    api.delete(`/comments/${idComentario}`),

  // Verificar si el usuario ya dejó una reseña
  verificarEstadoResena: (idProducto) =>
    api.get(`/comments/status/${idProducto}`),

  // Alias para compatibilidad con código existente
  getCommentsByProduct: (idProducto) => 
    api.get(`/comments/product/${idProducto}`),
  createComment: (datos) => 
    api.post("/comments", datos),
  deleteComment: (idComentario) => 
    api.delete(`/comments/${idComentario}`),
  checkUserReviewStatus: (idProducto) =>
    api.get(`/comments/status/${idProducto}`),
};

// Alias para compatibilidad
export const commentService = servicioComentarios;
