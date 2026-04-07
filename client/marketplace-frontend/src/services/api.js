import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token JWT solo si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token);
    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Authorization header set:", config.headers.Authorization);
    } else {
      // Eliminar el header Authorization si no hay token válido
      delete config.headers.Authorization;
      console.log("No token, Authorization header removed");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ya no se borra token ni se redirige en caso de 401
    return Promise.reject(error);
  },
);

export default api;