import api from "./api";

export const orderService = {
  createOrder: async (orderData) => {
    return await api.post("/orders", orderData);
  },

  markOrderAsPaid: async (orderId) => {
    return await api.put(`/orders/${orderId}/pay`);
  },

  sendInvoiceEmail: async (orderId) => {
    return await api.put(`/orders/${orderId}/send-invoice`);
  },
};