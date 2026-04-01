import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, MapPin, CreditCard, Calendar, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import Tracking from '../Tracking/tracking';
import DejarReseña from '../DejarReseña/DejarReseña';
import './DetalleOrden.css';


export default function DetalleOrden() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/orders/${id}`);
                if (response.data && response.data.success) {
                    setOrder(response.data.data);
                } else {
                    setError("No se pudo cargar el detalle de la orden.");
                }
            } catch (err) {
                console.error("Error al cargar detalle:", err);
                setError(err.response?.data?.message || "Error al conectar con el servidor.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchOrderDetail();
    }, [id]);

    const getEstadoInfo = (status) => {
        switch (status) {
            case 'created':
                return { label: 'Creada', icon: <Package size={20} color="#6366f1" />, class: 'en-proceso' };
            case 'paid': 
            case 'pagado':
                return { label: 'Pagado', icon: <CheckCircle size={20} color="#10b981" />, class: 'entregado' };
            case 'packed':
                return { label: 'Empacado', icon: <Package size={20} color="#f59e0b" />, class: 'pendiente' };
            case 'shipped':
                return { label: 'Enviado', icon: <Truck size={20} color="#0094FF" />, class: 'en-proceso' };
            case 'delivered':
                return { label: 'Entregado', icon: <CheckCircle size={20} color="#10b981" />, class: 'entregado' };
            case 'pending': 
                return { label: 'Pendiente', icon: <Clock size={20} color="#f59e0b" />, class: 'pendiente' };
            case 'cancelled': 
                return { label: 'Cancelado', icon: <CheckCircle size={20} color="#ef4444" />, class: 'cancelado' };
            default: 
                return { label: status || 'En Proceso', icon: <Package size={20} />, class: 'en-proceso' };
        }
    };

    if (loading) return (
        <div className="cargando-detalle">
            <Clock className="animate-spin" size={40} />
            <p>Buscando detalles de la orden...</p>
        </div>
    );

    if (error) return (
        <div className="error-detalle">
            <AlertCircle size={48} color="#ef4444" />
            <h2>{error}</h2>
            <button onClick={() => navigate('/cliente/perfil/ordenes')} className="boton-secundario">
                Volver a mis órdenes
            </button>
        </div>
    );

    if (!order) return <div className="error-detalle">Orden no encontrada</div>;

    const estadoInfo = getEstadoInfo(order.status);
    const orderItems = order.items || [];
    const address = order.shippingAddress || {};

    return (
        <div className="detalle-orden-container">
            <button className="boton-retroceder" onClick={() => navigate('/cliente/perfil/ordenes')}>
                &lt; Regresar a mis órdenes
            </button>

            <div className="detalle-header">
                <div>
                    <h1>Detalle de Orden <span className="id-resaltado">#{order._id}</span></h1>
                    <p className="fecha-detalle"><Calendar size={14} /> Realizada el {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={`estado-badge ${estadoInfo.class}`}>
                    {estadoInfo.icon}
                    {estadoInfo.label}
                </div>
            </div>

            <div className="detalle-grid">
                <div className="columna-izquierda">
                    {/* Productos */}
                    <section className="detalle-card">
                        <h3><Package size={20} /> Productos ({orderItems.length})</h3>
                        <div className="productos-lista">
                            {orderItems.map((item, index) => {
                                const prodImg = item.image || item.product?.images?.[0]?.url;
                                return (
                                    <div key={index} className="producto-item-detalle">
                                        <div className="prod-img-wrapper">
                                            {prodImg ? (
                                                <img src={prodImg} alt={item.name} />
                                            ) : (
                                                <div className="placeholder-img"><Package size={24} /></div>
                                            )}
                                        </div>
                                        <div className="prod-info">
                                            <h4>{item.name}</h4>
                                            <p className="prod-cantidad">Cantidad: {item.quantity}</p>
                                            {item.vendor && (
                                                <p className="prod-vendedor" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                                                    Vendedor: {item.vendor?.nombre || 'N/A'}
                                                </p>
                                            )}
                                        </div>
                                        <div className="prod-precio">
                                            ₡{(item.price * item.quantity).toLocaleString()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Dirección */}
                    <section className="detalle-card">
                        <h3><MapPin size={20} /> Dirección de Envío</h3>
                        <p className="nombre-receptor">{order.user?.nombre || 'Usuario'}</p>
                        <p className="texto-direccion">{address.direccion}</p>
                        <p className="texto-direccion">{address.ciudad}, {address.provincia}</p>
                        <p className="texto-direccion">{address.pais} ({address.codigoPostal})</p>
                    </section>
                </div>

                <div className="columna-derecha">
                    {/* Resumen de Pago */}
                    <section className="detalle-card resumen-pago">
                        <h3><CreditCard size={20} /> Resumen de Pago</h3>
                        <div className="linea-resumen">
                            <span>Subtotal</span>
                            <span>₡{(order.subtotal || 0).toLocaleString()}</span>
                        </div>
                        <div className="linea-resumen">
                            <span>Envío</span>
                            <span>₡{(order.shipping || 0).toLocaleString()}</span>
                        </div>
                        <div className="linea-resumen">
                            <span>Impuestos</span>
                            <span>₡{((order.total || 0) - (order.subtotal || 0) - (order.shipping || 0)).toLocaleString()}</span>
                        </div>
                        <div className="linea-resumen total">
                            <span>Total</span>
                            <span>₡{(order.total || 0).toLocaleString()}</span>
                        </div>
                        <div className="metodo-pago-label">
                            <CreditCard size={16} /> Pagado con {order.paymentMethod?.brand || 'Tarjeta'} **** {order.paymentMethod?.last4 || '0000'}
                        </div>
                    </section>

                    {/* Nueva Zona para Dejar Reseña (Zona Roja) */}
                    <DejarReseña 
                        isEmbedded={true}
                        product={orderItems[0]?.product || orderItems[0]}
                        onSubmit={(data) => {
                            console.log("Reseña enviada desde DetalleOrden:", data);
                            // Aquí podrías mostrar un mensaje de éxito o esconder el componente
                        }}
                    />
                </div>
            </div>

            {/* Status History Timeline */}
            {order.statusHistory && order.statusHistory.length > 0 && (
                <section className="detalle-card" style={{ marginTop: '20px' }}>
                    <h3><Clock size={20} /> Historial de Estados</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '20px', borderLeft: '2px solid rgba(0,148,255,0.3)' }}>
                        {order.statusHistory.map((entry, idx) => (
                            <div key={idx} style={{ position: 'relative', paddingLeft: '16px' }}>
                                <div style={{ position: 'absolute', left: '-27px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: '#0094FF', border: '2px solid #1e1e2e' }} />
                                <div style={{ fontSize: '14px', fontWeight: '600', color: 'white', textTransform: 'capitalize' }}>
                                    {entry.estado}
                                </div>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                                    {new Date(entry.fecha).toLocaleString()}
                                    {entry.usuarioQueCambio?.nombre && ` — ${entry.usuarioQueCambio.nombre}`}
                                </div>
                                {entry.comentario && (
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', marginTop: '2px' }}>
                                        {entry.comentario}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <div style={{ marginTop: '20px' }}>
                <Tracking isEmbedded={true} />
            </div>
        </div>
    );
}
