import { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import UserTable from "../components/UserTable";
import RoleModal from "../components/RoleModal";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { FiUsers, FiShield, FiShoppingBag } from "react-icons/fi";

const DashboardAdmin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users");
      setUsers(response.data.data);
      setError("");
    } catch (err) {
      setError("Error al cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditRole = (user) => {
    setSelectedUser(user);
    setSuccessMsg("");
  };

  const handleConfirmRole = async (userId, newRole) => {
    try {
      setModalLoading(true);
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setSuccessMsg("Rol actualizado exitosamente.");
      setSelectedUser(null);
      fetchUsers(); // Recargar lista
    } catch (err) {
      setError(err.response?.data?.message || "Error al actualizar el rol.");
    } finally {
      setModalLoading(false);
    }
  };

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "administrador").length,
    vendors: users.filter((u) => u.role === "vendedor").length,
    clients: users.filter((u) => u.role === "cliente").length,
  };

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Panel de Administración 🔧</h1>
          <p>Bienvenido, {user?.nombre}</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card stat-card-purple">
            <div className="stat-icon">
              <FiUsers />
            </div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Total Usuarios</p>
            </div>
          </div>

          <div className="stat-card stat-card-blue">
            <div className="stat-icon">
              <FiShield />
            </div>
            <div className="stat-info">
              <h3>{stats.admins}</h3>
              <p>Administradores</p>
            </div>
          </div>

          <div className="stat-card stat-card-green">
            <div className="stat-icon">
              <FiShoppingBag />
            </div>
            <div className="stat-info">
              <h3>{stats.vendors}</h3>
              <p>Vendedores</p>
            </div>
          </div>

          <div className="stat-card stat-card-orange">
            <div className="stat-icon">
              <FiUsers />
            </div>
            <div className="stat-info">
              <h3>{stats.clients}</h3>
              <p>Clientes</p>
            </div>
          </div>
        </div>

        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <div className="card-header">
            <h2>Gestión de Usuarios</h2>
            <span className="card-count">{stats.total} usuarios</span>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando usuarios...</p>
            </div>
          ) : (
            <UserTable users={users} onEditRole={handleEditRole} />
          )}
        </div>

        {selectedUser && (
          <RoleModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onConfirm={handleConfirmRole}
            loading={modalLoading}
          />
        )}
      </div>
    </Layout>
  );
};

export default DashboardAdmin;
