import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiHome, FiUsers, FiPackage, FiShoppingBag } from "react-icons/fi";

const Sidebar = ({ isOpen }) => {
  const { user } = useAuth();

  const getMenuItems = () => {
    switch (user?.role) {
      case "administrador":
        return [
          { path: "/admin/dashboard", icon: <FiHome />, label: "Dashboard" },
          { path: "/admin/users", icon: <FiUsers />, label: "Usuarios" },
        ];
      case "vendedor":
        return [
          { path: "/vendedor/dashboard", icon: <FiHome />, label: "Dashboard" },
          {
            path: "/vendedor/productos",
            icon: <FiPackage />,
            label: "Mis Productos",
          },
        ];
      case "cliente":
        return [
          { path: "/cliente/dashboard", icon: <FiHome />, label: "Dashboard" },
          {
            path: "/cliente/pedidos",
            icon: <FiShoppingBag />,
            label: "Mis Pedidos",
          },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <div className="sidebar-header">
        <span className="sidebar-title">Menú</span>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <p className="sidebar-version">v1.0.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
