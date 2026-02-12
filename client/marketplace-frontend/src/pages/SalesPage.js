import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import orderService from "../services/orderService";
import { FiTrendingUp, FiCreditCard, FiClock } from "react-icons/fi";

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const data = await orderService.getVendorSales();
        if (data.success) {
          setSales(data.data);
        }
      } catch (error) {
        console.error("Error fetching sales", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  return (
    <Layout>
      <div className="sales-page fade-in-up">
        <div className="dashboard-header">
          <h1>Mis Ventas</h1>
          <p className="text-muted">Gestiona los pedidos de tus productos</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : sales.length === 0 ? (
          <div className="card glass-effect text-center p-5">
            <FiTrendingUp size={48} className="text-muted mb-3" />
            <h3>No tienes ventas aún</h3>
            <p className="text-muted">
              Tus ventas aparecerán aquí cuando los clientes compren tus
              productos.
            </p>
          </div>
        ) : (
          <div className="card glass-effect overflow-hidden">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Ingreso Bruto</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((order) =>
                    order.orderItems.map((item, idx) => (
                      <tr key={`${order._id}-${idx}`}>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="font-bold">{item.name}</td>
                        <td>{item.quantity}</td>
                        <td className="text-green-400 font-bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td>
                          <span
                            className={`badge ${order.isPaid ? "badge-client" : "badge-admin"}`}
                          >
                            {order.isPaid ? (
                              <>
                                <FiCreditCard /> Pagado
                              </>
                            ) : (
                              <>
                                <FiClock /> Pendiente
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SalesPage;
