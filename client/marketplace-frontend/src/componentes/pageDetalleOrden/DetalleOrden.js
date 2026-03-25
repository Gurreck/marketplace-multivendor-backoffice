import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Package, MapPin, CreditCard, Calendar, Truck, CheckCircle, Clock } from 'lucide-react';
import './DetalleOrden.css';

export default function DetalleOrden() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data lookup by ID
        const mockOrder = {
            id: id,
            fecha: '2026-03-24',
            estado: 'Procesando',
            metodoPago: 'Visa **** 4242',
            direccion_envio: {
                calle: 'Av. Las Palmas 502',
                ciudad: 'San José',
                provincia: 'San José',
                pais: 'Costa Rica',
                cp: '10101'
            },
            resumen: {
                subtotal: 12500,
                envio: 2500,
                impuestos: 1500,
                total: 16500
            },
            productos: [
                { id: 101, nombre: 'Teclado Mecánico RGB Pro', precio: 12500, cantidad: 1, imagen: 'https://via.placeholder.com/80' }
            ],
            historial: [
                { fecha: '2026-03-24 10:30', evento: 'Pedido Sugerido', completado: true },
                { fecha: '2026-03-24 11:00', evento: 'Pago confirmado', completado: true },
                { fecha: '2026-03-24 14:15', evento: 'En preparación', completado: true },
                { fecha: '-', evento: 'En camino', completado: false },
                { fecha: '-', evento: 'Entregado', completado: false }
            ]
        };

        setTimeout(() => {
            setOrder(mockOrder);
            setLoading(false);
        }, 600);
    }, [id]);

    if (loading) return <div className="cargando-detalle">Buscando detalles de la orden...</div>;
    if (!order) return <div className="error-detalle">Orden no encontrada</div>;

    return (
        <div className="detalle-orden-container">
            <button className="boton-retroceder" onClick={() => navigate('/cliente/perfil/ordenes')}>
                <ChevronLeft size={20} />
                Regresar a mis órdenes
            </button>

            <div className="detalle-header">
                <div>
                    <h1>Detalle de Orden <span className="id-resaltado">#{order.id}</span></h1>
                    <p className="fecha-detalle"><Calendar size={16} /> Realizada el {new Date(order.fecha).toLocaleDateString()}</p>
                </div>
                <div className="estado-badge-grande">
                    <Clock size={20} />
                    {order.estado}
                </div>
            </div>

            <div className="detalle-grid">
                <div className="columna-izquierda">
                    {/* Productos */}
                    <section className="detalle-card">
                        <h3><Package size={20} /> Productos</h3>
                        <div className="productos-lista">
                            {order.productos.map(prod => (
                                <div key={prod.id} className="producto-item-detalle">
                                    <img src={prod.imagen} alt={prod.nombre} />
                                    <div className="prod-info">
                                        <h4>{prod.nombre}</h4>
                                        <p>Cantidad: {prod.cantidad}</p>
                                    </div>
                                    <div className="prod-precio">
                                        ₡{(prod.precio * prod.cantidad).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Seguimiento */}
                    <section className="detalle-card">
                        <h3><Truck size={20} /> Seguimiento</h3>
                        <div className="linea-tiempo">
                            {order.historial.map((step, index) => (
                                <div key={index} className={`paso-tiempo ${step.completado ? 'paso-completo' : ''}`}>
                                    <div className="punto">
                                        {step.completado ? <CheckCircle size={16} /> : <div className="circulo-vacio" />}
                                    </div>
                                    <div className="info-paso">
                                        <p className="paso-evento">{step.evento}</p>
                                        <p className="paso-fecha">{step.fecha}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="columna-derecha">
                    {/* Resumen de Pago */}
                    <section className="detalle-card resumen-pago">
                        <h3><CreditCard size={20} /> Resumen de Pago</h3>
                        <div className="linea-resumen">
                            <span>Subtotal</span>
                            <span>₡{order.resumen.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="linea-resumen">
                            <span>Envío</span>
                            <span>₡{order.resumen.envio.toLocaleString()}</span>
                        </div>
                        <div className="linea-resumen">
                            <span>Impuestos</span>
                            <span>₡{order.resumen.impuestos.toLocaleString()}</span>
                        </div>
                        <div className="linea-resumen total">
                            <span>Total</span>
                            <span>₡{order.resumen.total.toLocaleString()}</span>
                        </div>
                        <div className="metodo-pago-label">
                            <CreditCard size={16} /> Pagado con {order.metodoPago}
                        </div>
                    </section>

                    {/* Dirección */}
                    <section className="detalle-card">
                        <h3><MapPin size={20} /> Dirección de Envío</h3>
                        <p className="nombre-receptor">Samu Gurreck</p>
                        <p className="texto-direccion">{order.direccion_envio.calle}</p>
                        <p className="texto-direccion">{order.direccion_envio.ciudad}, {order.direccion_envio.provincia}</p>
                        <p className="texto-direccion">{order.direccion_envio.pais} ({order.direccion_envio.cp})</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
