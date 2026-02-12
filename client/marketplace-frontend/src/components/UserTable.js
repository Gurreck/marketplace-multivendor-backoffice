import { FiEdit2 } from "react-icons/fi";

const UserTable = ({ users, onEditRole }) => {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="5" className="table-empty">
                No hay usuarios registrados.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user._id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar-sm">
                      {user.nombre.charAt(0).toUpperCase()}
                    </div>
                    <span>{user.nombre}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={getRoleBadgeClass(user.role)}>
                    {user.role}
                  </span>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <button
                    className="btn-icon"
                    onClick={() => onEditRole(user)}
                    title="Cambiar rol"
                  >
                    <FiEdit2 />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
