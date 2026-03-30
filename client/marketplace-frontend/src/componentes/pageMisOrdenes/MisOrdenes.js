import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import './MisOrdenes.css';

export default function MisOrdenes() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders/my-orders');
                setOrders(response.data.data);
            } catch (error) {
                console.error("Error al cargar las órdenes:", error);
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
            default: 
                return { label: status, icon: <Package size={18} />, class: 'en-proceso' };
        }
    };

    if (loading) return <div className="cargando-ordenes">Cargando tus órdenes...</div>;

    return (
        <div className="seccion-ordenes">
            <h2 className="titulo-seccion"><ShoppingBag size={28} /> Mis Órdenes</h2>
            
            <div className="lista-ordenes">
                {orders.length > 0 ? (
                    orders.map(order => {
                        const estadoInfo = getEstadoInfo(order.status);
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
                                        <p className="orden-fecha">Fecha: {new Date(order.createdAt).toLocaleDateString()}</p>
                                        <p className="orden-productos">
                                            <strong>Productos:</strong> {order.items.map(i => i.name).join(', ')}
                                        </p>
                                    </div>
                                    <div className="orden-monto">
                                        <p className="label">Total</p>
                                        <p className="precio">₡{order.total.toLocaleString()}</p>
                                        <p className="items">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p>
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
                    <div className="ordenes-vacias">
                        <ShoppingBag size={64} opacity={0.2} />
                        <p>No tienes órdenes registradas.</p>
                        <button onClick={() => navigate('/')} className="boton-primario">Ir a comprar</button>
                    </div>
                )}
            </div>
        </div>
    );
}
