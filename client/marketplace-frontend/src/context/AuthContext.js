import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { useCart } from "./CartContext";
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const {clearCart} = useCart();

  // Cargar datos de localStorage al iniciar
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        // Obtener datos frescos del perfil desde el servidor (esto también valida el token)
        const response = await api.get("/auth/profile", {
          headers: { Authorization: `Bearer ${storedToken}` }
        });

        const userData = response.data.data;

        localStorage.setItem("user", JSON.stringify(userData));
        setToken(storedToken);
        setUser(userData);
      } catch (error) {
        console.error("Error al inicializar sesión:", error);
        // token inválido o error de red → borrar storage si es error de auth
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token: newToken, ...userData } = response.data.data;

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);

    return userData;
  };

  const register = async (nombre, email, password, role = 'cliente') => {
    const response = await api.post("/auth/register", {
      nombre,
      email,
      password,
      role,
    });
    console.log("Respuesta del registro:", nombre, email, response.data);
    const { token: newToken, ...userData } = response.data.data;

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);

    return userData;
  };

  const updateProfile = async (data) => {
    try {
      const response = await api.put("/auth/profile", data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update the whole user object or just specific properties
      const updatedUser = { ...user, ...response.data.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("marketplace_cart");
    clearCart();
    setToken(null);
    setUser(null);
    
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    updateProfile,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;