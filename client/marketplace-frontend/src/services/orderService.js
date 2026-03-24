import api from "./api";

export const orderService = {
  // Crear un nuevo pedido
  createOrder: (data) => 
    api.post("/orders", data),
  
  // Obtener pedidos del usuario actual
  getUserOrders: () => 
    api.get("/orders"),
  
  // Verificar si el usuario ha comprado un producto
  verifyPurchase: (productId) => 
    api.get(`/orders/verify-purchase/${productId}`),
};
