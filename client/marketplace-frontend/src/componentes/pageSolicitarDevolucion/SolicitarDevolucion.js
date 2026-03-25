import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, CheckCircle, Upload, MessageSquare } from 'lucide-react';
import './SolicitarDevolucion.css';

export default function SolicitarDevolucion() {
    const [step, setStep] = useState(1);
    const [motivo, setMotivo] = useState('');
    const [detalle, setDetalle] = useState('');

    const motivos = [
        'Producto defectuoso / no funciona',
        'Producto no coincide con la descripción',
        'Llegó el producto equivocado',
        'Ya no lo necesito (Arrepentimiento)',
        'Paquete llegó vacío o incompleto'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        setStep(3);
    };

    return (
        <div className="seccion-devolucion">
            <h2 className="titulo-seccion"><RotateCcw size={28} /> Solicitar Devolución</h2>

            <div className="pasos-devolucion">
                <div className={`paso ${step >= 1 ? 'activo' : ''}`}>1. Motivo</div>
                <div className={`paso ${step >= 2 ? 'activo' : ''}`}>2. Evidencia</div>
                <div className={`paso ${step >= 3 ? 'activo' : ''}`}>3. Finalizado</div>
            </div>

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

                    <button 
                        className="boton-primario" 
                        disabled={!motivo || !detalle}
                        onClick={() => setStep(2)}
                    >
                        Siguiente Paso
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="paso-contenedor">
                    <h3>Sube fotos del producto</h3>
                    <p className="texto-ayuda">Esto nos ayudará a procesar tu solicitud más rápido.</p>
                    
                    <div className="area-upload">
                        <Upload size={48} color="#0094FF" />
                        <p>Haz clic para subir fotos o arrastra los archivos aquí</p>
                        <input type="file" multiple disabled />
                    </div>

                    <div className="botones-accion">
                        <button className="boton-secundario" onClick={() => setStep(1)}>Atrás</button>
                        <button className="boton-primario" onClick={handleSubmit}>Enviar Solicitud</button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="paso-contenedor finalizado">
                    <CheckCircle size={80} color="#10b981" />
                    <h2>¡Solicitud Recibida!</h2>
                    <p>Tu solicitud de devolución ha sido enviada con éxito. Nuestro equipo revisará el caso y te contactará en un plazo de 24 a 48 horas laborales.</p>
                    <div className="num-seguimiento">Número de trámite: <strong>RET-2026-9821</strong></div>
                    <button className="boton-primario" onClick={() => window.location.href = '/cliente/perfil'}>Volver al Perfil</button>
                </div>
            )}
        </div>
    );
}
