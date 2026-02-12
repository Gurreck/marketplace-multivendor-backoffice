import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import orderService from "../services/orderService";
import { FiPackage, FiCalendar, FiDollarSign } from "react-icons/fi";

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getMyOrders();
        if (data.success) {
          setOrders(data.data);
        }
      } catch (error) {
        console.error("Error fetching orders", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <Layout>
      <div className="orders-page fade-in-up">
        <div className="dashboard-header">
          <h1>Mis Compras</h1>
          <p className="text-muted">Historial de tus pedidos realizados</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="card glass-effect text-center p-5">
            <FiPackage size={48} className="text-muted mb-3" />
            <h3>Aún no has realizado compras</h3>
            <p className="text-muted">
              ¡Explora el marketplace y encuentra algo increíble!
            </p>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => (
              <div
                key={order._id}
                className="card glass-effect order-card mb-4"
              >
                <div className="order-header">
                  <div className="order-meta">
                    <span>
                      <FiPackage /> ID: {order._id.substring(19)}
                    </span>
                    <span>
                      <FiCalendar />{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div
                    className={`badge ${order.isPaid ? "badge-client" : "badge-admin"}`}
                  >
                    {order.isPaid ? "Pagado" : "Pendiente"}
                  </div>
                </div>

                <div className="order-items-summary">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="order-item-mini">
                      <img
                        src={item.image || "https://via.placeholder.com/50"}
                        alt={item.name}
                      />
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-qty">Cant: {item.quantity}</span>
                      </div>
                      <span className="item-price">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="total-label">
                    <FiDollarSign /> Total:
                  </div>
                  <div className="total-amount">
                    ${order.totalPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyOrdersPage;
