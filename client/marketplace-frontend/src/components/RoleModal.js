import { useState } from "react";
import { FiX } from "react-icons/fi";

const RoleModal = ({ user, onClose, onConfirm, loading }) => {
  const [selectedRole, setSelectedRole] = useState(user.role);

  const handleConfirm = () => {
    if (selectedRole !== user.role) {
      onConfirm(user._id, selectedRole);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Cambiar Rol</h3>
          <button className="btn-icon" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <div className="modal-body">
          <p className="modal-user-info">
            Usuario: <strong>{user.nombre}</strong>
          </p>
          <p className="modal-user-info">
            Email: <strong>{user.email}</strong>
          </p>
          <div className="form-group">
            <label htmlFor="role-select">Nuevo Rol</label>
            <select
              id="role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="form-select"
            >
              <option value="cliente">Cliente</option>
              <option value="vendedor">Vendedor</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={loading || selectedRole === user.role}
          >
            {loading ? "Guardando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleModal;
