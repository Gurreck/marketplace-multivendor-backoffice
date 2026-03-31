import api from "./api";

const cartService = {
  // Obtener el carrito del usuario
  getCart: async () => {
    const response = await api.get("/cart");
    return response.data;
  },

  // Agregar producto al carrito
  addToCart: async (productId, quantity = 1) => {
    const response = await api.post("/cart", { productId, quantity });
    return response.data;
  },

  // Actualizar cantidad de producto en carrito
  updateCartItem: async (productId, quantity) => {
    const response = await api.put(`/cart/${productId}`, { quantity });
    return response.data;
  },

  // Eliminar producto del carrito
  removeFromCart: async (productId) => {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
  },

  // Limpiar carrito completo
  clearCart: async () => {
    const response = await api.delete("/cart");
    return response.data;
  },
};

export default cartService;