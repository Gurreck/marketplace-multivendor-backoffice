import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiMenu } from "react-icons/fi";

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "administrador":
        return "badge badge-admin";
      case "vendedor":
        return "badge badge-vendor";
      case "cliente":
        return "badge badge-client";
      default:
        return "badge";
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={onToggleSidebar}>
          <FiMenu />
        </button>
        <div className="navbar-brand">
          <span className="brand-icon">🛒</span>
          <span className="brand-text">Marketplace</span>
        </div>
      </div>

      <div className="navbar-right">
        {user && (
          <div className="user-info">
            <div className="user-avatar">
              {user.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user.nombre}</span>
              <span className={getRoleBadgeClass(user.role)}>{user.role}</span>
            </div>
          </div>
        )}
        <button
          className="btn-logout"
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          <FiLogOut />
          <span>Salir</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
