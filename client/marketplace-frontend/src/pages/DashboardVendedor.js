import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { FiPackage, FiDollarSign, FiTrendingUp } from "react-icons/fi";

const DashboardVendedor = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>¡Hola, {user?.nombre}! 🏪</h1>
          <p>Panel de vendedor</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card stat-card-purple">
            <div className="stat-icon">
              <FiPackage />
            </div>
            <div className="stat-info">
              <h3>0</h3>
              <p>Productos</p>
            </div>
          </div>

          <div className="stat-card stat-card-blue">
            <div className="stat-icon">
              <FiDollarSign />
            </div>
            <div className="stat-info">
              <h3>$0</h3>
              <p>Ventas</p>
            </div>
          </div>

          <div className="stat-card stat-card-green">
            <div className="stat-icon">
              <FiTrendingUp />
            </div>
            <div className="stat-info">
              <h3>0</h3>
              <p>Pedidos</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Mis Productos</h2>
          <div className="empty-state">
            <FiPackage className="empty-icon" />
            <p>No tienes productos publicados.</p>
            <span>Comienza a agregar productos a tu tienda.</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardVendedor;
