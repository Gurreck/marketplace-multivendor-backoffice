import api from "./api";

const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post("/orders", orderData);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get("/orders/myorders");
    return response.data;
  },

  getVendorSales: async () => {
    const response = await api.get("/orders/sales");
    return response.data;
  },

  getOrderDetails: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
};

export default orderService;
