import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { FiShoppingBag, FiHeart, FiStar } from "react-icons/fi";

const DashboardCliente = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>¡Hola, {user?.nombre}! 👋</h1>
          <p>Bienvenido a tu panel de cliente</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card stat-card-purple">
            <div className="stat-icon">
              <FiShoppingBag />
            </div>
            <div className="stat-info">
              <h3>0</h3>
              <p>Pedidos</p>
            </div>
          </div>

          <div className="stat-card stat-card-blue">
            <div className="stat-icon">
              <FiHeart />
            </div>
            <div className="stat-info">
              <h3>0</h3>
              <p>Favoritos</p>
            </div>
          </div>

          <div className="stat-card stat-card-green">
            <div className="stat-icon">
              <FiStar />
            </div>
            <div className="stat-info">
              <h3>0</h3>
              <p>Reseñas</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Actividad Reciente</h2>
          <div className="empty-state">
            <FiShoppingBag className="empty-icon" />
            <p>No tienes pedidos aún.</p>
            <span>
              Explora el marketplace para encontrar productos increíbles.
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardCliente;
