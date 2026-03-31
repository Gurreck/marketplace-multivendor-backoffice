import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

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

  // Cargar datos de localStorage al iniciar
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        // Obtener perfil actualizado y validar token
        const response = await api.get("/auth/profile", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        const userData = response.data.data;

        localStorage.setItem("user", JSON.stringify(userData));
        setToken(storedToken);
        setUser(userData);
      } catch (error) {
        console.error("Error al inicializar sesión:", error);

        // Si el token es inválido, limpiar sesión
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("marketplace_cart");
          setToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const { token: newToken, ...userData } = response.data.data;

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);

    return userData;
  };

  const register = async (
    nombre,
    email,
    password,
    role = "cliente"
  ) => {
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedUser = {
        ...user,
        ...response.data.data,
      };

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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;