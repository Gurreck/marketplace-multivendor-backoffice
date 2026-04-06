import api from "./api";

const servicioCarrito = {
  // Obtener el carrito del usuario
  obtenerCarrito: async () => {
    const respuesta = await api.get("/cart");
    return respuesta.data;
  },

  // Agregar producto al carrito
  agregarAlCarrito: async (idProducto, cantidad = 1) => {
    const respuesta = await api.post("/cart", { productId: idProducto, quantity: cantidad });
    return respuesta.data;
  },

  // Actualizar cantidad de producto en carrito
  actualizarItemCarrito: async (idProducto, cantidad) => {
    const respuesta = await api.put(`/cart/${idProducto}`, { quantity: cantidad });
    return respuesta.data;
  },

  // Eliminar producto del carrito
  eliminarDelCarrito: async (idProducto) => {
    const respuesta = await api.delete(`/cart/${idProducto}`);
    return respuesta.data;
  },

  // Limpiar carrito completo
  vaciarCarrito: async () => {
    const respuesta = await api.delete("/cart");
    return respuesta.data;
  },

  // Alias para compatibilidad
  getCart: async () => {
    const respuesta = await api.get("/cart");
    return respuesta.data;
  },
  addToCart: async (idProducto, cantidad = 1) => {
    const respuesta = await api.post("/cart", { productId: idProducto, quantity: cantidad });
    return respuesta.data;
  },
  updateCartItem: async (idProducto, cantidad) => {
    const respuesta = await api.put(`/cart/${idProducto}`, { quantity: cantidad });
    return respuesta.data;
  },
  removeFromCart: async (idProducto) => {
    const respuesta = await api.delete(`/cart/${idProducto}`);
    return respuesta.data;
  },
  clearCart: async () => {
    const respuesta = await api.delete("/cart");
    return respuesta.data;
  },
};

export default servicioCarrito;