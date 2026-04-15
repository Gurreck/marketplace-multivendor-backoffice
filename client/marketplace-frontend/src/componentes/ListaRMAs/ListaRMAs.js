import React from 'react';
import './ListaRMAs.css';
import { RotateCcw, Package, Loader2 } from 'lucide-react';
import '../SolicitarDevolucion/SolicitarDevolucion.css';

/**
 * Componente que muestra la lista de devoluciones (RMAs) del cliente.
 */
export default function ListaRMAs({ rmasList, loadingRmas, traducirEstado, onNuevaDevolucion }) {
    if (loadingRmas) return (
        <div className="seccion-devolucion" style={{ textAlign: 'center', padding: '60px' }}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
            <p>Cargando tus devoluciones...</p>
        </div>
    );

    return (
        <div className="seccion-devolucion">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="titulo-seccion" style={{ marginBottom: 0 }}><RotateCcw size={28} /> Mis Devoluciones</h2>
                <button className="boton-primario" onClick={onNuevaDevolucion}>
                    + Nueva Devolución
                </button>
            </div>

            {rmasList.length === 0 ? (
                <div className="alerta-devolucion" style={{ textAlign: 'center', padding: '40px' }}>
                    <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 15px' }} />
                    <p>No tienes solicitudes de devolución actualmente.</p>
                </div>
            ) : (
                <div className="lista-ordenes-rma">
                    {rmasList.map(rma => (
                        <div key={rma._id} className="orden-rma-card" style={{ cursor: 'default' }}>
                            <div className="orden-rma-info" style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span className="orden-rma-id">RMA-{rma._id.slice(-8).toUpperCase()}</span>
                                    <span className={`rma-status-badge ${rma.estado}`}>{traducirEstado(rma.estado)}</span>
                                </div>
                                <p style={{ margin: '0 0 5px', fontSize: '14px', color: 'var(--text-muted)' }}>
                                    Orden: #{rma.order?._id?.slice(-6).toUpperCase()}
                                </p>
                                <p style={{ margin: '0 0 5px', fontSize: '14px', color: 'var(--text-muted)' }}>
                                    Fecha: {new Date(rma.createdAt).toLocaleDateString()}
                                </p>
                                <p style={{ margin: '0 0 10px', fontSize: '14px' }}>
                                    <strong>Motivo:</strong> {rma.motivo}
                                </p>
                                <div style={{ padding: '10px', background: 'var(--info-bg)', borderRadius: '8px' }}>
                                    <p style={{ margin: '0 0 5px', fontSize: '13px', fontWeight: 'bold' }}>Productos a devolver:</p>
                                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                                        {rma.items.map((it, idx) => (
                                            <li key={idx}>{it.product?.name} (x{it.quantity})</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

