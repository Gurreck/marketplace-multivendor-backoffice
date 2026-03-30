import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Package, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import './MisOrdenes.css';

export default function MisOrdenes() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setError(null);
                const token = localStorage.getItem("token");

                if (!token || token === "undefined" || token === "null") {
                    setError("Debes iniciar sesión para ver tus órdenes.");
                    setLoading(false);
                    return;
                }

                const response = await api.get('/orders/my-orders');

                if (response.data && response.data.success && Array.isArray(response.data.data)) {
                    setOrders(response.data.data);
                } else {
                    setOrders([]);
                }
            } catch (error) {
                console.error("Error al cargar las órdenes:", error);
                if (error.response) {
                    if (error.response.status === 401) {
                        setError("Tu sesión ha expirado. Inicia sesión nuevamente.");
                    } else if (error.response.status === 403) {
                        setError("No tienes permisos para ver las órdenes.");
                    } else {
                        setError(`Error al cargar las órdenes: ${error.response.data?.message || 'Error del servidor'}`);
                    }
                } else {
                    setError("Error de conexión. Verifica que el servidor esté activo.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getEstadoInfo = (status) => {
        switch (status) {
            case 'paid': 
                return { label: 'Pagado', icon: <CheckCircle size={18} color="#10b981" />, class: 'entregado' };
            case 'pending': 
                return { label: 'Pendiente', icon: <Clock size={18} color="#f59e0b" />, class: 'pendiente' };
            case 'cancelled': 
                return { label: 'Cancelado', icon: <XCircle size={18} color="#ef4444" />, class: 'cancelado' };
            case 'pagado':
                return { label: 'Pagado', icon: <CheckCircle size={18} color="#10b981" />, class: 'entregado' };
            default: 
                return { label: status || 'Desconocido', icon: <Package size={18} />, class: 'en-proceso' };
        }
    };

    if (loading) return <div className="cargando-ordenes">Cargando tus órdenes...</div>;

    return (
        <div className="seccion-ordenes">
            <h2 className="titulo-seccion"><ShoppingBag size={28} /> Mis Órdenes</h2>
            
            {error && (
                <div className="error-ordenes" style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#ef4444'
                }}>
                    <AlertTriangle size={20} />
                    <span>{error}</span>
                </div>
            )}

            <div className="lista-ordenes">
                {orders.length > 0 ? (
                    orders.map(order => {
                        const estadoInfo = getEstadoInfo(order.status);
                        const orderTotal = order.total ?? order.subtotal ?? 0;
                        const orderItems = order.items || [];
                        return (
                            <div key={order._id} className="tarjeta-orden" onClick={() => navigate(`/cliente/perfil/ordenes/${order._id}`)}>
                                <div className="orden-header">
                                    <span className="orden-id">#{order._id.slice(-8).toUpperCase()}</span>
                                    <div className={`orden-estado ${estadoInfo.class}`}>
                                        {estadoInfo.icon}
                                        {estadoInfo.label}
                                    </div>
                                </div>
                                
                                <div className="orden-body">
                                    <div className="orden-info">
                                        <p className="orden-fecha">Fecha: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                                        <p className="orden-productos">
                                            <strong>Productos:</strong> {orderItems.length > 0 ? orderItems.map(i => i.name || 'Producto').join(', ') : 'Sin productos'}
                                        </p>
                                    </div>
                                    <div className="orden-monto">
                                        <p className="label">Total</p>
                                        <p className="precio">₡{typeof orderTotal === 'number' ? orderTotal.toLocaleString() : '0'}</p>
                                        <p className="items">{orderItems.length} {orderItems.length === 1 ? 'item' : 'items'}</p>
                                    </div>
                                </div>
                                
                                <div className="orden-footer">
                                    <span>Ver detalle de la orden</span>
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        );
                    })
                ) : (
                    !error && (
                        <div className="ordenes-vacias">
                            <ShoppingBag size={64} opacity={0.2} />
                            <p>No tienes órdenes registradas.</p>
                            <button onClick={() => navigate('/')} className="boton-primario">Ir a comprar</button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
