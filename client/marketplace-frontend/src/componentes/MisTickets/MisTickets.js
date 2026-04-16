import React, { useState, useEffect } from 'react';
import { Ticket, Clock, MessageCircle, CheckCircle, Plus, X, Send, AlertCircle, Loader2 } from 'lucide-react';
import servicioSoporte from '../../services/supportService';
import socket from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import './MisTickets.css';

export default function MisTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    // Modal nuevo ticket
    const [showNewTicket, setShowNewTicket] = useState(false);
    const [newAsunto, setNewAsunto] = useState('');
    const [newPrioridad, setNewPrioridad] = useState('Media');
    const [newDescripcion, setNewDescripcion] = useState('');
    const [creando, setCreando] = useState(false);

    // Modal conversación
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketDetail, setTicketDetail] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        fetchTickets();

        socket.on("ticketEscalated", () => {
            fetchTickets();
        });

        socket.on("ticketUpdated", (data) => {
            fetchTickets();
        });

        socket.on("ticketMessageSent", (data) => {
            if (selectedTicket && data._id === selectedTicket) {
                setTicketDetail(data);
            }
            fetchTickets();
        });

        return () => {
            socket.off("ticketEscalated");
            socket.off("ticketUpdated");
            socket.off("ticketMessageSent");
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTicket]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await servicioSoporte.obtenerTickets();
            setTickets(response.data || []);
        } catch (err) {
            setError('Error al cargar los tickets');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        if (!newAsunto.trim()) return;

        try {
            setCreando(true);
            await servicioSoporte.crearTicket({
                asunto: newAsunto,
                prioridad: newPrioridad,
                descripcion: newDescripcion,
            });
            setShowNewTicket(false);
            setNewAsunto('');
            setNewPrioridad('Media');
            setNewDescripcion('');
            fetchTickets();
        } catch (err) {
            setError('Error al crear el ticket');
            console.error(err);
        } finally {
            setCreando(false);
        }
    };

    const handleViewConversation = async (ticketId) => {
        try {
            const response = await servicioSoporte.obtenerDetalleTicket(ticketId);
            setTicketDetail(response.data);
            setSelectedTicket(ticketId);
            // Unirse a la sala del ticket para mensajes en tiempo real
            socket.emit('joinTicketRoom', ticketId);
        } catch (err) {
            console.error('Error al cargar detalle:', err);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || enviando) return;

        try {
            setEnviando(true);
            await servicioSoporte.responderTicket(selectedTicket, newMessage);
            setNewMessage('');
            // Refrescar detalle
            const response = await servicioSoporte.obtenerDetalleTicket(selectedTicket);
            setTicketDetail(response.data);
            fetchTickets();
        } catch (err) {
            console.error('Error al enviar mensaje:', err);
        } finally {
            setEnviando(false);
        }
    };

    const handleAssignTicket = async () => {
        try {
            await servicioSoporte.asignarseTicket(selectedTicket);
            // Refrescar detalle
            const response = await servicioSoporte.obtenerDetalleTicket(selectedTicket);
            setTicketDetail(response.data);
            fetchTickets();
        } catch (err) {
            console.error('Error al asignar el ticket:', err);
        }
    };

    const getEstadoClass = (e) => ({ 'open': 'ticket-abierto', 'in_progress': 'ticket-progreso', 'waiting_customer': 'ticket-espera', 'resolved': 'ticket-resuelto', 'closed': 'ticket-cerrado' }[e] || '');

    const getEstadoLabel = (e) => ({ 'open': 'Abierto', 'in_progress': 'En Progreso', 'waiting_customer': 'Esperando Respuesta', 'resolved': 'Resuelto', 'closed': 'Cerrado' }[e] || e);

    // Stats calculados de los datos reales
    const statsAbiertos = tickets.filter(t => t.estado === 'open' || t.estado === 'in_progress').length;
    const statsEspera = tickets.filter(t => t.estado === 'waiting_customer').length;
    const statsResueltos = tickets.filter(t => t.estado === 'resolved' || t.estado === 'closed').length;

    if (loading) return (
        <div className="seccion-tickets" style={{ textAlign: 'center', padding: '60px' }}>
            <Loader2 className="animate-spin" size={40} style={{ animation: 'spin 1s linear infinite' }} />
            <p>Cargando tickets...</p>
        </div>
    );

    return (
        <div className="seccion-tickets">
            <div className="detalle-header">
                <h1><Ticket size={28} /> {user?.role === 'cliente' ? 'Mis Tickets de Soporte' : 'Tickets Escalados'}</h1>
                {user?.role === 'cliente' && (
                    <button className="boton-primario" onClick={() => setShowNewTicket(true)}>
                        <Plus size={18} />
                        Nuevo Ticket
                    </button>
                )}
            </div>

            {error && ( <div style={{ padding: '12px 18px', background: 'rgba(239,68,68,0.1)', borderRadius: '10px', color: '#f87171', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={18} /> {error}</div> )}

            <div className="tickets-stats">
                <div className="stat-card">
                    <span className="stat-label">Abiertos</span>
                    <span className="stat-value">{statsAbiertos}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">En Respuesta</span>
                    <span className="stat-value">{statsEspera}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Resueltos</span>
                    <span className="stat-value">{statsResueltos}</span>
                </div>
            </div>

            <div className="lista-tickets">
                {tickets.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>
                        <Ticket size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                        <p>No tienes tickets de soporte aún.</p>
                    </div>
                ) : (
                    tickets.map(ticket => (
                        <div key={ticket._id} className="tarjeta-ticket">
                            <div className="ticket-main-info">
                                <span className="ticket-id">TKT-{ticket._id.slice(-6).toUpperCase()}</span>
                                <h3 className="ticket-asunto">{ticket.asunto}</h3>
                                <div className="ticket-meta">
                                    <span className={`prioridad-tag ${ticket.prioridad.toLowerCase()}`}>{ticket.prioridad}</span>
                                    <span className="ticket-fecha"><Clock size={14} /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="ticket-actions">
                                <div className={`ticket-status-pills ${getEstadoClass(ticket.estado)}`}>
                                    {ticket.estado === 'resolved' || ticket.estado === 'closed' ? <CheckCircle size={16} /> : <Clock size={16} />}
                                    {getEstadoLabel(ticket.estado)}
                                </div>
                                <div className="ticket-msg-count">
                                    <MessageCircle size={16} />
                                    {ticket.mensajes?.length || 0} mensajes
                                </div>
                                <button className="boton-ver-ticket" onClick={() => handleViewConversation(ticket._id)}>
                                    Ver Conversación
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal Nuevo Ticket */}
            {showNewTicket && (
                <div className="modal-overlay" onClick={() => setShowNewTicket(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><Plus size={20} /> Nuevo Ticket</h2>
                            <button className="modal-close" onClick={() => setShowNewTicket(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateTicket}>
                            <div className="form-group">
                                <label>Asunto *</label>
                                <input type="text" value={newAsunto} onChange={e => setNewAsunto(e.target.value)} placeholder="Describe brevemente tu problema" required />
                            </div>
                            <div className="form-group">
                                <label>Prioridad</label>
                                <select value={newPrioridad} onChange={e => setNewPrioridad(e.target.value)}>
                                    <option value="Baja">Baja</option><option value="Media">Media</option><option value="Alta">Alta</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea value={newDescripcion} onChange={e => setNewDescripcion(e.target.value)} placeholder="Describe tu problema en detalle..." rows={4} />
                            </div>
                            <button type="submit" className="boton-primario" disabled={creando} style={{ width: '100%' }}>
                                {creando ? 'Creando...' : 'Crear Ticket'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Conversación */}
            {selectedTicket && ticketDetail && (
                <div className="modal-overlay" onClick={() => { if (selectedTicket) socket.emit('leaveTicketRoom', selectedTicket); setSelectedTicket(null); setTicketDetail(null); }}>
                    <div className="modal-content modal-conversation" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><MessageCircle size={20} /> {ticketDetail.asunto}</h2>
                            <button className="modal-close" onClick={() => { if (selectedTicket) socket.emit('leaveTicketRoom', selectedTicket); setSelectedTicket(null); setTicketDetail(null); }}><X size={20} /></button>
                        </div>
                        <div className={`ticket-status-pills ${getEstadoClass(ticketDetail.estado)}`} style={{ margin: '0 0 16px', display: 'inline-flex' }}>
                            {getEstadoLabel(ticketDetail.estado)}
                        </div>
                        {user?.role !== 'cliente' && !ticketDetail.asignadoA && (
                            <div style={{ marginBottom: '16px', display: 'flex' }}>
                                <button className="boton-primario" onClick={handleAssignTicket} style={{ fontSize: '13px', padding: '6px 12px' }}>
                                    Asignarme este Ticket
                                </button>
                            </div>
                        )}
                        {ticketDetail.asignadoA && (
                            <div style={{ marginBottom: '16px', fontSize: '13px', color: '#9ca3af' }}>
                                <strong>Asignado a:</strong> {ticketDetail.asignadoA.nombre}
                            </div>
                        )}
                        <div className="conversation-messages">
                            {ticketDetail.mensajes && ticketDetail.mensajes.length > 0 ? (
                                ticketDetail.mensajes.map((msg, i) => {
                                    const isOwn = msg.remitente?._id === user?.id || msg.remitente?._id === user?._id;
                                    const role = msg.remitente?.role || 'cliente';
                                    const roleLabel = { 'cliente': 'Cliente', 'soporte': 'Soporte', 'administrador': 'Admin', 'vendedor': 'Vendedor' }[role] || role;
                                    const roleColor = { 'cliente': '#3b82f6', 'soporte': '#a855f7', 'administrador': '#ef4444', 'vendedor': '#f59e0b' }[role] || '#9ca3af';
                                    const bubbleClass = isOwn ? 'user' : (role === 'soporte' || role === 'administrador') ? 'support' : role === 'vendedor' ? 'support' : 'user';
                                    return (
                                        <div key={i} className={`message-bubble ${bubbleClass}`}>
                                            <div className="message-sender" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {msg.remitente?.nombre || 'Usuario'}
                                                <span style={{
                                                    fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
                                                    borderRadius: '10px', background: `${roleColor}22`,
                                                    color: roleColor, border: `1px solid ${roleColor}44`,
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {roleLabel}
                                                </span>
                                            </div>
                                            <div className="message-text">{msg.texto}</div>
                                            <div className="message-time">{new Date(msg.fecha).toLocaleString()}</div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Sin mensajes aún</p>
                            )}
                        </div>
                        {ticketDetail.estado !== 'closed' && ticketDetail.estado !== 'resolved' && (
                            <div className="message-input-area">
                                <input
                                    type="text"
                                    placeholder="Escribe un mensaje..."
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                />
                                <button onClick={handleSendMessage} disabled={enviando || !newMessage.trim()}>
                                    <Send size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
