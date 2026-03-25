import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import './MisOrdenes.css';

export default function MisOrdenes() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock data since backend orders are not yet implemented
    useEffect(() => {
        const mockOrders = [
            {
                id: 'ORD-2026-001',
                fecha: '2026-03-20',
                total: 45000,
                estado: 'Entregado',
                items: 3,
                productos: ['Teclado Mecánico RGB', 'Mouse Gamer', 'Pad Extendido']
            },
            {
                id: 'ORD-2026-002',
                fecha: '2026-03-22',
                total: 125000,
                estado: 'En Proceso',
                items: 1,
                productos: ['Monitor 27" 144Hz']
            },
            {
                id: 'ORD-2026-003',
                fecha: '2026-03-24',
                total: 15000,
                estado: 'Pendiente',
                items: 2,
                productos: ['Cable USB-C 2m', 'Adaptador HDMI']
            }
        ];

        setTimeout(() => {
            setOrders(mockOrders);
            setLoading(false);
        }, 800);
    }, []);

    const getEstadoIcon = (estado) => {
        switch (estado) {
            case 'Entregado': return <CheckCircle size={18} color="#10b981" />;
            case 'En Proceso': return <Clock size={18} color="#0094FF" />;
            case 'Pendiente': return <Package size={18} color="#f59e0b" />;
            case 'Cancelado': return <XCircle size={18} color="#ef4444" />;
            default: return <Clock size={18} />;
        }
    };

    if (loading) return <div className="cargando-ordenes">Cargando tus órdenes...</div>;

    return (
        <div className="seccion-ordenes">
            <h2 className="titulo-seccion"><ShoppingBag size={28} /> Mis Órdenes</h2>
            
            <div className="lista-ordenes">
                {orders.length > 0 ? (
                    orders.map(order => (
                        <div key={order.id} className="tarjeta-orden" onClick={() => navigate(`/cliente/perfil/ordenes/${order.id}`)}>
                            <div className="orden-header">
                                <span className="orden-id">{order.id}</span>
                                <div className={`orden-estado ${order.estado.toLowerCase().replace(' ', '-')}`}>
                                    {getEstadoIcon(order.estado)}
                                    {order.estado}
                                </div>
                            </div>
                            
                            <div className="orden-body">
                                <div className="orden-info">
                                    <p className="orden-fecha">Fecha: {new Date(order.fecha).toLocaleDateString()}</p>
                                    <p className="orden-productos">
                                        <strong>Productos:</strong> {order.productos.join(', ')}
                                    </p>
                                </div>
                                <div className="orden-monto">
                                    <p className="label">Total</p>
                                    <p className="precio">₡{order.total.toLocaleString()}</p>
                                    <p className="items">{order.items} {order.items === 1 ? 'item' : 'items'}</p>
                                </div>
                            </div>
                            
                            <div className="orden-footer">
                                <span>Ver detalle de la orden</span>
                                <ChevronRight size={18} />
                            </div>
                        </div>
                    ))
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
