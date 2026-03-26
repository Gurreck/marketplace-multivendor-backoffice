import api from "./api";

export const commentService = {
  // Obtener comentarios de un producto
  getCommentsByProduct: (productId) => 
    api.get(`/comments/product/${productId}`),
  
  // Crear un nuevo comentario
  createComment: (data) => 
    api.post("/comments", data),
  
  // Eliminar un comentario
  deleteComment: (commentId) => 
    api.delete(`/comments/${commentId}`),
};
