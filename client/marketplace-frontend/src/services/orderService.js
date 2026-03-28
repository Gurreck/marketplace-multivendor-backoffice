import api from './api';

export const orderService = {
  createOrder: (orderData) => api.post('/orders', orderData),
};
