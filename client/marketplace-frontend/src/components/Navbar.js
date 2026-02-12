import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import { FiLogOut, FiMenu, FiShoppingCart } from "react-icons/fi";

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
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
        {user && (
          <button className="menu-toggle" onClick={onToggleSidebar}>
            <FiMenu />
          </button>
        )}
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🛒</span>
          <span className="brand-text">Marketplace</span>
        </Link>
      </div>

      <div className="navbar-right">
        {/* Cart Icon */}
        <Link to="/cart" className="nav-item cart-icon-container">
          <FiShoppingCart size={20} />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        {user ? (
          <>
            <div className="user-info">
              <div className="user-avatar">
                {user.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-name">{user.nombre}</span>
                <span className={getRoleBadgeClass(user.role)}>
                  {user.role}
                </span>
              </div>
            </div>
            <button
              className="btn-logout"
              onClick={handleLogout}
              title="Cerrar sesión"
            >
              <FiLogOut />
              <span>Salir</span>
            </button>
          </>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-secondary btn-sm">
              Ingresar
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Registro
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
