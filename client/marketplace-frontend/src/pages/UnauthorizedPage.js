import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiAlertTriangle } from "react-icons/fi";

const UnauthorizedPage = () => {
  const { user } = useAuth();

  const getRedirectPath = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "administrador":
        return "/admin/dashboard";
      case "vendedor":
        return "/vendedor/dashboard";
      case "cliente":
        return "/cliente/dashboard";
      default:
        return "/login";
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card unauthorized-card">
          <div className="auth-header">
            <FiAlertTriangle className="unauthorized-icon" />
            <h1>Acceso Denegado</h1>
            <p>No tienes permisos para acceder a esta página.</p>
          </div>
          <Link to={getRedirectPath()} className="btn btn-primary btn-block">
            Volver a mi Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
