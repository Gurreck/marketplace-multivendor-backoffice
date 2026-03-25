import React, { useState } from 'react';
import { Ticket, Clock, MessageCircle, CheckCircle, Plus } from 'lucide-react';
import './MisTickets.css';

export default function MisTickets() {
    const [tickets] = useState([
        {
            id: 'TKT-1042',
            asunto: 'Error en el pago con tarjeta',
            prioridad: 'Alta',
            estado: 'Abierto',
            fecha: '2026-03-23',
            mensajes: 3
        },
        {
            id: 'TKT-0985',
            asunto: 'Consulta sobre garantía de monitor',
            prioridad: 'Media',
            estado: 'Resuelto',
            fecha: '2026-03-15',
            mensajes: 5
        }
    ]);

    const getEstadoClass = (estado) => {
        switch (estado) {
            case 'Abierto': return 'ticket-abierto';
            case 'Resuelto': return 'ticket-resuelto';
            case 'Cerrado': return 'ticket-cerrado';
            default: return '';
        }
    };

    return (
        <div className="seccion-tickets">
            <div className="detalle-header">
                <h1><Ticket size={28} /> Mis Tickets de Soporte</h1>
                <button className="boton-primario">
                    <Plus size={18} />
                    Nuevo Ticket
                </button>
            </div>

            <div className="tickets-stats">
                <div className="stat-card">
                    <span className="stat-label">Abiertos</span>
                    <span className="stat-value">1</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">En Respuesta</span>
                    <span className="stat-value">0</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Resueltos</span>
                    <span className="stat-value">12</span>
                </div>
            </div>

            <div className="lista-tickets">
                {tickets.map(ticket => (
                    <div key={ticket.id} className="tarjeta-ticket">
                        <div className="ticket-main-info">
                            <span className="ticket-id">{ticket.id}</span>
                            <h3 className="ticket-asunto">{ticket.asunto}</h3>
                            <div className="ticket-meta">
                                <span className={`prioridad-tag ${ticket.prioridad.toLowerCase()}`}>{ticket.prioridad}</span>
                                <span className="ticket-fecha"><Clock size={14} /> {ticket.fecha}</span>
                            </div>
                        </div>

                        <div className="ticket-actions">
                            <div className={`ticket-status-pills ${getEstadoClass(ticket.estado)}`}>
                                {ticket.estado === 'Abierto' ? <Clock size={16} /> : <CheckCircle size={16} />}
                                {ticket.estado}
                            </div>
                            <div className="ticket-msg-count">
                                <MessageCircle size={16} />
                                {ticket.mensajes} mensajes
                            </div>
                            <button className="boton-ver-ticket">Ver Conversación</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
