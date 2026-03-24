import api from "./api";

export const saveAddress = async (addressData) => {
  try {
    const response = await api.post("/address/save", addressData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Error al guardar dirección" };
  }
};
