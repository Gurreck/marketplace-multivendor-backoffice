import React from 'react';
import './FormularioDevolucion.css';
import { ArrowLeft, Search, RotateCcw, CheckCircle2 } from 'lucide-react';
import '../SolicitarDevolucion/SolicitarDevolucion.css';

/**
 * FormularioDevolucion
 * Maneja el formulario multi-paso para solicitar una devolución.
 */
export default function FormularioDevolucion({
    paso,
    ordenes,
    ordenSeleccionada,
    productosSeleccionados,
    motivo,
    busquedaOrden,
    loading,
    error,
    message,
    onSeleccionarOrden,
    onToggleProducto,
    onCambiarCantidad,
    onSetMotivo,
    onSetBusquedaOrden,
    onSiguientePaso,
    onRegresarPaso,
    onSubmit,
    onVolver
}) {
    return (
        <div className="seccion-devolucion">
            <button className="boton-volver-rma" onClick={onVolver}>
                <ArrowLeft size={18} /> Volver a Mis Devoluciones
            </button>

            <h2 className="titulo-seccion">
                <RotateCcw size={28} /> Solicitar Nueva Devolución
            </h2>

            {/* Indicador de pasos */}
            <div className="pasos-devolucion">
                <div className={`paso-indicador ${paso >= 1 ? 'activo' : ''}`}>
                    <div className="paso-circulo">1</div><span>Seleccionar Orden</span>
                </div>
                <div className="paso-linea" />
                <div className={`paso-indicador ${paso >= 2 ? 'activo' : ''}`}>
                    <div className="paso-circulo">2</div><span>Seleccionar Productos</span>
                </div>
                <div className="paso-linea" />
                <div className={`paso-indicador ${paso >= 3 ? 'activo' : ''}`}>
                    <div className="paso-circulo">3</div><span>Confirmar</span>
                </div>
            </div>

            {error && <p className="mensaje-error">{error}</p>}
            {message && <p className="mensaje-exito"><CheckCircle2 size={18} /> {message}</p>}

            {/* PASO 1: Seleccionar orden */}
            {paso === 1 && (
                <div className="paso-contenido paso-1">
                    <h3>Selecciona una orden entregada</h3>
                    <div className="busqueda-orden">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por ID de orden..."
                            value={busquedaOrden}
                            onChange={(e) => onSetBusquedaOrden(e.target.value)}
                            className="input-busqueda-orden"
                        />
                    </div>
                    <div className="lista-ordenes-rma">
                        {ordenes.filter(o => {
                            if (!busquedaOrden) return true;
                            return (o._id || '').toLowerCase().includes(busquedaOrden.toLowerCase());
                        }).map(order => {
                            const productsQty = (order.items || []).reduce((sum, item) => sum + item.quantity, 0);
                            return (
                                <div key={order._id} className={`orden-rma-card ${ordenSeleccionada?._id === order._id ? 'seleccionada' : ''}`}
                                    onClick={() => onSeleccionarOrden(order)}>
                                    <div className="orden-rma-check">
                                        {ordenSeleccionada?._id === order._id && <CheckCircle2 size={20} color="#22c55e" />}
                                    </div>
                                    <div className="orden-rma-info">
                                        <span className="orden-rma-id">Orden: #{order._id?.slice(-6).toUpperCase()}</span>
                                        <span className="orden-rma-fecha">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        <span className="orden-rma-total">₡{(order.total || 0).toLocaleString()} — {productsQty} artículo(s)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <button className="boton-primario" onClick={onSiguientePaso}
                        disabled={!ordenSeleccionada}>
                        Continuar
                    </button>
                </div>
            )}

            {/* PASO 2: Seleccionar productos */}
            {paso === 2 && ordenSeleccionada && (
                <div className="paso-contenido paso-2">
                    <h3>¿Qué productos deseas devolver?</h3>
                    <div className="lista-productos-rma">
                        {(ordenSeleccionada.items || []).map((item, idx) => {
                            const sel = productosSeleccionados.find(p => p.productId === (item.product?._id || item.product));
                            return (
                                <div key={idx} className={`producto-rma-card ${sel ? 'seleccionado' : ''}`}
                                    onClick={() => onToggleProducto(item)}>
                                    <div className="producto-rma-check">
                                        {sel && <CheckCircle2 size={20} color="#22c55e" />}
                                    </div>
                                    <div className="producto-rma-img">
                                        <img src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/80'} alt={item.product?.name || 'Producto'} />
                                    </div>
                                    <div className="producto-rma-info">
                                        <strong>{item.product?.name || 'Producto'}</strong>
                                        <span>Cant. en orden: {item.quantity}</span>
                                        <span>₡{(item.price || 0).toLocaleString()} c/u</span>
                                    </div>
                                    {sel && (
                                        <div className="producto-rma-cant" onClick={(e) => e.stopPropagation()}>
                                            <label>Devolver:</label>
                                            <select value={sel.quantity}
                                                onChange={(e) => onCambiarCantidad(item.product?._id || item.product, parseInt(e.target.value))}>
                                                {Array.from({ length: item.quantity }, (_, i) => (
                                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="botones-rma-paso">
                        <button className="boton-secundario" onClick={onRegresarPaso}>Atrás</button>
                        <button className="boton-primario" onClick={onSiguientePaso}
                            disabled={productosSeleccionados.length === 0}>
                            Continuar
                        </button>
                    </div>
                </div>
            )}

            {/* PASO 3: Motivo y Confirmación */}
            {paso === 3 && (
                <div className="paso-contenido paso-3">
                    <h3>Motivo de la Devolución</h3>
                    <textarea
                        className="textarea-motivo"
                        value={motivo}
                        onChange={(e) => onSetMotivo(e.target.value)}
                        placeholder="Describe el motivo de la devolución..."
                        rows={4}
                    />
                    <div className="resumen-rma">
                        <h4>Resumen de la solicitud</h4>
                        <p><strong>Orden:</strong> #{ordenSeleccionada?._id?.slice(-6).toUpperCase()}</p>
                        <p><strong>Productos a devolver:</strong></p>
                        <ul>
                            {productosSeleccionados.map((p, i) => (
                                <li key={i}>{p.productName} (x{p.quantity})</li>
                            ))}
                        </ul>
                    </div>
                    <div className="botones-rma-paso">
                        <button className="boton-secundario" onClick={onRegresarPaso}>Atrás</button>
                        <button className="boton-primario" onClick={onSubmit}
                            disabled={loading || !motivo.trim()}>
                            {loading ? 'Enviando...' : 'Enviar Solicitud'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

