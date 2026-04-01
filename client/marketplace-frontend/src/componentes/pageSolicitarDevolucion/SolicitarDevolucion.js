import React, { useState, useEffect } from 'react';
import { RotateCcw, AlertTriangle, CheckCircle, Upload, MessageSquare, Package, Loader2, X } from 'lucide-react';
import api from '../../services/api';
import './SolicitarDevolucion.css';

export default function SolicitarDevolucion() {
    const [step, setStep] = useState(0); // 0 = seleccionar orden/items, 1 = motivo, 2 = evidencia, 3 = finalizado
    const [motivo, setMotivo] = useState('');
    const [detalle, setDetalle] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [rmaResult, setRmaResult] = useState(null);

    // Datos de órdenes e items
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);

    // Imágenes de evidencia
    const [evidenceUrls, setEvidenceUrls] = useState([]);

    const motivos = [
        'Producto defectuoso / no funciona',
        'Producto no coincide con la descripción',
        'Llegó el producto equivocado',
        'Ya no lo necesito (Arrepentimiento)',
        'Paquete llegó vacío o incompleto'
    ];

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await api.get('/orders/my-orders');
            if (response.data.success) {
                // Solo órdenes que pueden tener devolución (pagadas/entregadas)
                const eligibleOrders = response.data.data.filter(o =>
                    ['paid', 'packed', 'shipped', 'delivered'].includes(o.status)
                );
                setOrders(eligibleOrders);
            }
        } catch (err) {
            console.error('Error al cargar órdenes:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleItem = (item) => {
        setSelectedItems(prev => {
            const exists = prev.find(i => i.product === (item.product?._id || item.product));
            if (exists) {
                return prev.filter(i => i.product !== (item.product?._id || item.product));
            }
            return [...prev, { product: item.product?._id || item.product, quantity: item.quantity, name: item.name }];
        });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const urls = files.map(f => URL.createObjectURL(f));
        setEvidenceUrls(prev => [...prev, ...urls]);
    };

    const handleSubmit = async () => {
        if (!selectedOrder || selectedItems.length === 0 || !motivo) return;

        setSubmitting(true);
        try {
            const payload = {
                order: selectedOrder._id,
                items: selectedItems.map(i => ({ product: i.product, quantity: i.quantity })),
                motivo,
                detalle,
                evidencia: evidenceUrls,
            };

            const response = await api.post('/support/rma', payload);
            if (response.data.success) {
                setRmaResult(response.data.data);
                setStep(3);
            }
        } catch (err) {
            console.error('Error al enviar RMA:', err);
            alert(err.response?.data?.message || 'Error al enviar la solicitud');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="seccion-devolucion" style={{ textAlign: 'center', padding: '60px' }}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
            <p>Cargando órdenes...</p>
        </div>
    );

    return (
        <div className="seccion-devolucion">
            <h2 className="titulo-seccion"><RotateCcw size={28} /> Solicitar Devolución</h2>

            <div className="pasos-devolucion">
                <div className={`paso ${step >= 0 ? 'activo' : ''}`}>0. Seleccionar Ítems</div>
                <div className={`paso ${step >= 1 ? 'activo' : ''}`}>1. Motivo</div>
                <div className={`paso ${step >= 2 ? 'activo' : ''}`}>2. Evidencia</div>
                <div className={`paso ${step >= 3 ? 'activo' : ''}`}>3. Finalizado</div>
            </div>

            {/* PASO 0: Seleccionar Orden e Items */}
            {step === 0 && (
                <div className="paso-contenedor">
                    <h3><Package size={20} /> Selecciona la orden y los productos a devolver</h3>

                    {orders.length === 0 ? (
                        <div className="alerta-devolucion">
                            <AlertTriangle size={24} color="#f59e0b" />
                            <p>No tienes órdenes elegibles para devolución.</p>
                        </div>
                    ) : (
                        <>
                            <div className="lista-ordenes-rma">
                                {orders.map(order => (
                                    <div
                                        key={order._id}
                                        className={`orden-rma-card ${selectedOrder?._id === order._id ? 'seleccionado' : ''}`}
                                        onClick={() => { setSelectedOrder(order); setSelectedItems([]); }}
                                    >
                                        <div className="orden-rma-info">
                                            <span className="orden-rma-id">Orden #{order._id.slice(-6).toUpperCase()}</span>
                                            <span className="orden-rma-fecha">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <span className="orden-rma-total">₡{order.total?.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            {selectedOrder && (
                                <div className="items-seleccionar">
                                    <h4>Marca los productos a devolver:</h4>
                                    {selectedOrder.items.map((item, idx) => {
                                        const isSelected = selectedItems.some(i => i.product === (item.product?._id || item.product));
                                        return (
                                            <label key={idx} className={`item-checkbox ${isSelected ? 'checked' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleToggleItem(item)}
                                                />
                                                <div className="item-info-rma">
                                                    <span className="item-nombre">{item.name}</span>
                                                    <span className="item-qty">Cantidad: {item.quantity}</span>
                                                </div>
                                                <span className="item-precio">₡{(item.price * item.quantity).toLocaleString()}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            <button
                                className="boton-primario"
                                disabled={selectedItems.length === 0}
                                onClick={() => setStep(1)}
                            >
                                Siguiente Paso
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* PASO 1: Motivo */}
            {step === 1 && (
                <div className="paso-contenedor">
                    <div className="alerta-devolucion">
                        <AlertTriangle size={24} color="#f59e0b" />
                        <p>Tienes hasta 15 días después de la entrega para solicitar una devolución.</p>
                    </div>

                    <h3>Selecciona el motivo de la devolución</h3>
                    <div className="lista-motivos">
                        {motivos.map((m, i) => (
                            <label key={i} className={`motivo-item ${motivo === m ? 'seleccionado' : ''}`}>
                                <input
                                    type="radio"
                                    name="motivo"
                                    value={m}
                                    checked={motivo === m}
                                    onChange={(e) => setMotivo(e.target.value)}
                                />
                                {m}
                            </label>
                        ))}
                    </div>

                    <div className="area-detalle">
                        <h3><MessageSquare size={18} /> Explícanos qué sucedió</h3>
                        <textarea
                            placeholder="Describe el problema detalladamente..."
                            value={detalle}
                            onChange={(e) => setDetalle(e.target.value)}
                        />
                    </div>

                    <div className="botones-accion">
                        <button className="boton-secundario" onClick={() => setStep(0)}>Atrás</button>
                        <button className="boton-primario" disabled={!motivo || !detalle} onClick={() => setStep(2)}>
                            Siguiente Paso
                        </button>
                    </div>
                </div>
            )}

            {/* PASO 2: Evidencia */}
            {step === 2 && (
                <div className="paso-contenedor">
                    <h3>Sube fotos del producto</h3>
                    <p className="texto-ayuda">Esto nos ayudará a procesar tu solicitud más rápido.</p>

                    <div className="area-upload" onClick={() => document.getElementById('rma-file-input').click()}>
                        <Upload size={48} color="#0094FF" />
                        <p>Haz clic para subir fotos o arrastra los archivos aquí</p>
                        <input
                            type="file"
                            id="rma-file-input"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {evidenceUrls.length > 0 && (
                        <div className="evidence-previews">
                            {evidenceUrls.map((url, i) => (
                                <div key={i} className="evidence-thumb">
                                    <img src={url} alt={`Evidencia ${i + 1}`} />
                                    <button className="remove-evidence" onClick={() => setEvidenceUrls(prev => prev.filter((_, idx) => idx !== i))}>
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="botones-accion">
                        <button className="boton-secundario" onClick={() => setStep(1)}>Atrás</button>
                        <button className="boton-primario" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Enviando...' : 'Enviar Solicitud'}
                        </button>
                    </div>
                </div>
            )}

            {/* PASO 3: Finalizado */}
            {step === 3 && (
                <div className="paso-contenedor finalizado">
                    <CheckCircle size={80} color="#10b981" />
                    <h2>¡Solicitud Recibida!</h2>
                    <p>Tu solicitud de devolución ha sido enviada con éxito. Nuestro equipo revisará el caso y te contactará en un plazo de 24 a 48 horas laborales.</p>
                    {rmaResult && (
                        <div className="num-seguimiento">
                            Número de trámite: <strong>RMA-{rmaResult._id?.slice(-8).toUpperCase()}</strong>
                        </div>
                    )}
                    <button className="boton-primario" onClick={() => window.location.href = '/cliente/perfil'}>Volver al Perfil</button>
                </div>
            )}
        </div>
    );
}
