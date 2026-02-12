import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import UserTable from "../components/UserTable";
import RoleModal from "../components/RoleModal";
import ProductTable from "../components/ProductTable";
import api from "../services/api";
import productService from "../services/productService";

const DashboardAdmin = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("users"); // 'users' or 'products'

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, productsRes] = await Promise.all([
        api.get("/admin/users"),
        productService.getProducts(), // Admin ve todos
      ]);
      setUsers(usersRes.data.data);
      setProducts(productsRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = {
    totalUsers: users.length,
    usersAdmins: users.filter((u) => u.role === "administrador").length,
    usersVendors: users.filter((u) => u.role === "vendedor").length,
    totalProducts: products.length,
  };

  // --- User Management ---
  const handleEditRole = (user) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async (newRole) => {
    try {
      await api.put(`/admin/users/${selectedUser._id}/role`, { role: newRole });
      setIsRoleModalOpen(false);
      fetchData(); // Recargar datos
    } catch (error) {
      console.error("Error actualizando rol:", error);
      alert("Error al actualizar el rol");
    }
  };

  // --- Product Management (Admin) ---
  const handleDeleteProduct = async (id) => {
    if (
      window.confirm(
        "¿Seguro que deseas eliminar este producto? (Acción de Admin)",
      )
    ) {
      try {
        await productService.deleteProduct(id);
        fetchData();
      } catch (error) {
        console.error("Error eliminando producto:", error);
        alert("Error al eliminar producto");
      }
    }
  };

  const handleEditProduct = (product) => {
    alert(
      "Como admin, por ahora solo puedes eliminar productos. La edición es por parte del vendedor.",
    );
    // Podríamos implementar edición para admin si se requiere rehaciendo ProductModal para soportar edición arbitraria
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="dashboard fade-in-up">
        <div className="dashboard-header">
          <h1>Panel de Administración</h1>
          <p>Gestión global del sistema</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card glass-effect stat-card-purple">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>Usuarios</h3>
              <p className="stat-value">{stats.totalUsers}</p>
            </div>
          </div>
          <div className="stat-card glass-effect stat-card-blue">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>Productos</h3>
              <p className="stat-value">{stats.totalProducts}</p>
            </div>
          </div>
          <div className="stat-card glass-effect stat-card-orange">
            <div className="stat-icon">🏪</div>
            <div className="stat-info">
              <h3>Vendedores</h3>
              <p className="stat-value">{stats.usersVendors}</p>
            </div>
          </div>
        </div>

        <div className="tabs-container mb-4">
          <button
            className={`btn ${activeTab === "users" ? "btn-primary" : "btn-secondary"} mr-2`}
            onClick={() => setActiveTab("users")}
          >
            Usuarios
          </button>
          <button
            className={`btn ${activeTab === "products" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("products")}
          >
            Productos
          </button>
        </div>

        {activeTab === "users" && (
          <div className="card glass-effect">
            <div className="card-header">
              <h2>Gestión de Usuarios</h2>
            </div>
            <UserTable users={users} onEditRole={handleEditRole} />
          </div>
        )}

        {activeTab === "products" && (
          <div className="card glass-effect">
            <div className="card-header">
              <h2>Gestión de Productos Global</h2>
            </div>
            <ProductTable
              products={products}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          </div>
        )}

        {isRoleModalOpen && (
          <RoleModal
            isOpen={isRoleModalOpen}
            onClose={() => setIsRoleModalOpen(false)}
            currentUser={selectedUser}
            onSave={handleSaveRole}
          />
        )}
      </div>
    </Layout>
  );
};

export default DashboardAdmin;
