import api from "./api";

const servicioGamificacion = {
  girarRuleta: async () => {
    const respuesta = await api.post("/gamification/spin");
    return respuesta.data;
  },

  validarCupon: async (codigo) => {
    const respuesta = await api.get(`/gamification/validate?code=${encodeURIComponent(codigo)}`);
    return respuesta.data;
  },

  // Alias para compatibilidad
  spinWheel: async () => {
    const respuesta = await api.post("/gamification/spin");
    return respuesta.data;
  },

  validateCoupon: async (codigo) => {
    const respuesta = await api.get(`/gamification/validate?code=${encodeURIComponent(codigo)}`);
    return respuesta.data;
  },
};

export default servicioGamificacion;
