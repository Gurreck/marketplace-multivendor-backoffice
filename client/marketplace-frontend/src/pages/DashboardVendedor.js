import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import ProductTable from "../components/ProductTable";
import ProductModal from "../components/ProductModal";
import productService from "../services/productService";
import { useAuth } from "../context/AuthContext";

const DashboardVendedor = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ total: 0, stock: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null); // Para editar

  const fetchProducts = async () => {
    try {
      // getProducts("me") envía ?vendor=me para que el backend filtre los del usuario
      const data = await productService.getProducts("me");
      if (data.success) {
        setProducts(data.data);
        // Calcular stats simples
        const total = data.data.length;
        const stock = data.data.reduce((acc, curr) => acc + curr.stock, 0);
        setStats({ total, stock });
      }
    } catch (error) {
      console.error("Error al cargar productos", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreate = () => {
    setCurrentProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await productService.deleteProduct(id);
        fetchProducts(); // Recargar lista
      } catch (error) {
        alert("Error al eliminar producto");
        console.error(error);
      }
    }
  };

  const handleSave = async (productData) => {
    try {
      if (currentProduct) {
        await productService.updateProduct(currentProduct._id, productData);
      } else {
        await productService.createProduct(productData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      alert("Error al guardar producto");
      console.error(error);
    }
  };

  return (
    <Layout>
      <div className="dashboard fade-in-up">
        <div className="dashboard-header">
          <div>
            <h1>Panel de Vendedor</h1>
            <p className="text-muted">Bienvenido, {user.nombre}</p>
          </div>
          <button className="btn btn-primary" onClick={handleCreate}>
            + Nuevo Producto
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card glass-effect">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>Mis Productos</h3>
              <p className="stat-value">{stats.total}</p>
            </div>
          </div>
          <div className="stat-card glass-effect">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>Stock Total</h3>
              <p className="stat-value">{stats.stock}</p>
            </div>
          </div>
          <div className="stat-card glass-effect">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Ventas</h3>
              <p className="stat-value">0</p>
            </div>
          </div>
        </div>

        <div className="card glass-effect mt-4">
          <div className="card-header">
            <h2>Gestión de Productos</h2>
          </div>
          <ProductTable
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          productToEdit={currentProduct}
        />
      </div>
    </Layout>
  );
};

export default DashboardVendedor;
