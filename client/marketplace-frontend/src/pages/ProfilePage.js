import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import userService from "../services/userService";
import { useAuth } from "../context/AuthContext";
import { FiUser, FiMail, FiLock, FiSave } from "react-icons/fi";

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      setNombre(user.nombre);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (password !== confirmPassword) {
      return setMessage({
        type: "error",
        text: "Las contraseñas no coinciden",
      });
    }

    setLoading(true);
    try {
      const data = await userService.updateProfile({ nombre, email, password });
      if (data.success) {
        setUser(data.data);
        localStorage.setItem("user", JSON.stringify(data.data));
        setMessage({
          type: "success",
          text: "Perfil actualizado correctamente",
        });
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Error al actualizar el perfil",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="profile-page fade-in-up">
        <div className="dashboard-header">
          <h1>Mi Perfil</h1>
          <p className="text-muted">
            Gestiona tu información personal y cuenta
          </p>
        </div>

        <div className="card glass-effect max-w-md">
          {message.text && (
            <div
              className={`alert alert-${message.type === "error" ? "error" : "success"}`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>
                <FiUser className="input-icon" /> Nombre Completo
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FiMail className="input-icon" /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <hr className="my-4 border-gray-800" />
            <p className="text-sm text-muted mb-2">
              Cambiar contraseña (opcional)
            </p>

            <div className="form-group">
              <label>
                <FiLock className="input-icon" /> Nueva Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Dejar en blanco para no cambiar"
              />
            </div>

            <div className="form-group">
              <label>
                <FiLock className="input-icon" /> Confirmar Contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar nueva contraseña"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? (
                "Guardando..."
              ) : (
                <>
                  <FiSave /> Guardar Cambios
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
