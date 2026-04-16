import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ListaRMAs from '../ListaRMAs/ListaRMAs';
import FormularioDevolucion from '../FormularioDevolucion/FormularioDevolucion';
import './SolicitarDevolucion.css';

/**
 * SolicitarDevolucion
 * Componente principal que orquesta la vista de devoluciones del cliente:
 * muestra la lista de RMAs o el formulario de nueva devolución.
 */
export default function SolicitarDevolucion() {
    const [vista, setVista] = useState('lista'); // 'lista' | 'formulario'
    const [ordenes, setOrdenes] = useState([]);
    const [rmasList, setRmasList] = useState([]);
    const [loadingRmas, setLoadingRmas] = useState(true);
    const [paso, setPaso] = useState(1);
    const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const [motivo, setMotivo] = useState('');
    const [busquedaOrden, setBusquedaOrden] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoadingRmas(true);
            const [ordenesRes, rmasRes] = await Promise.all([
                api.get('/orders/me'),
                api.get('/returns/me'),
            ]);
            const entregadas = (ordenesRes.data.data || []).filter(
                o => o.status === 'delivered' || o.status === 'receipt_confirmed'
            );
            setOrdenes(entregadas);
            setRmasList(rmasRes.data.data || []);
        } catch (err) {
            console.error('Error cargando datos:', err);
        } finally {
            setLoadingRmas(false);
        }
    };

    const traducirEstado = (estado) => {
        const mapa = {
            requested: 'Solicitada', approved: 'Aprobada', rejected: 'Rechazada',
            received: 'Recibida', refunded: 'Reembolsada',
        };
        return mapa[estado] || estado;
    };

    const handleSeleccionarOrden = (order) => {
        setOrdenSeleccionada(order);
        setProductosSeleccionados([]);
    };

    const handleToggleProducto = (item) => {
        const productId = item.product?._id || item.product;
        const yaSeleccionado = productosSeleccionados.find(p => p.productId === productId);
        if (yaSeleccionado) {
            setProductosSeleccionados(prev => prev.filter(p => p.productId !== productId));
        } else {
            setProductosSeleccionados(prev => [...prev, {
                productId,
                productName: item.product?.name || 'Producto',
                quantity: 1,
                maxQuantity: item.quantity,
            }]);
        }
    };

    const handleCambiarCantidad = (productId, newQty) => {
        setProductosSeleccionados(prev => prev.map(p =>
            p.productId === productId ? { ...p, quantity: newQty } : p
        ));
    };

    const handleSiguientePaso = () => {
        if (paso === 1 && !ordenSeleccionada) { setError('Selecciona una orden'); return; }
        if (paso === 2 && productosSeleccionados.length === 0) { setError('Selecciona al menos un producto'); return; }
        setError('');
        setPaso(prev => prev + 1);
    };

    const handleRegresarPaso = () => {
        setError('');
        setPaso(prev => prev - 1);
    };

    const handleSubmit = async () => {
        if (!motivo.trim()) { setError('Ingresa un motivo para la devolución'); return; }
        setLoading(true);
        setError('');
        try {
            const payload = {
                orderId: ordenSeleccionada._id,
                items: productosSeleccionados.map(p => ({
                    product: p.productId,
                    quantity: p.quantity,
                })),
                motivo,
            };
            await api.post('/returns', payload);
            setMessage('¡Solicitud de devolución enviada exitosamente!');
            setPaso(1);
            setOrdenSeleccionada(null);
            setProductosSeleccionados([]);
            setMotivo('');
            cargarDatos();
            setTimeout(() => { setMessage(''); setVista('lista'); }, 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al enviar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    if (vista === 'formulario') {
        return (
            <FormularioDevolucion
                paso={paso}
                ordenes={ordenes}
                ordenSeleccionada={ordenSeleccionada}
                productosSeleccionados={productosSeleccionados}
                motivo={motivo}
                busquedaOrden={busquedaOrden}
                loading={loading}
                error={error}
                message={message}
                onSeleccionarOrden={handleSeleccionarOrden}
                onToggleProducto={handleToggleProducto}
                onCambiarCantidad={handleCambiarCantidad}
                onSetMotivo={setMotivo}
                onSetBusquedaOrden={setBusquedaOrden}
                onSiguientePaso={handleSiguientePaso}
                onRegresarPaso={handleRegresarPaso}
                onSubmit={handleSubmit}
                onVolver={() => { setVista('lista'); setPaso(1); setError(''); setMessage(''); }}
            />
        );
    }

    return (
        <ListaRMAs
            rmasList={rmasList}
            loadingRmas={loadingRmas}
            traducirEstado={traducirEstado}
            onNuevaDevolucion={() => setVista('formulario')}
        />
    );
}
