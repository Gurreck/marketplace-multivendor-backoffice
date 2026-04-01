import api from "./api";

const servicioGamificacion = {
  spinWheel: async () => {
    const respuesta = await api.post("/gamification/spin");
    return respuesta.data;
  },

  validateCoupon: async (code) => {
    const respuesta = await api.get(`/gamification/validate?code=${encodeURIComponent(code)}`);
    return respuesta.data;
  },
};

export default servicioGamificacion;
