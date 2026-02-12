import api from "./api";

const productService = {
  // Obtener productos (con filtro opcional para vendedor)
  getProducts: async (vendor = null) => {
    let url = "/products";
    if (vendor === "me") {
      url += "?vendor=me";
    }
    const response = await api.get(url);
    return response.data;
  },

  // Obtener un producto por ID
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Crear producto
  createProduct: async (productData) => {
    const response = await api.post("/products", productData);
    return response.data;
  },

  // Actualizar producto
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Eliminar producto
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export default productService;
