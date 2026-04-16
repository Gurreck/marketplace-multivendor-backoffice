import React, { useState, useEffect, useRef } from 'react';
import {
  Ticket, Clock, MessageCircle, CheckCircle, Search, RefreshCw,
  Send, X, AlertCircle, Loader2, Filter, UserCheck
} from 'lucide-react';
import servicioSoporte from '../../../services/supportService';
import socket from '../../../services/socket';
import { useAuth } from '../../../context/AuthContext';
import './AdministradorTickets.css';

export default function AdministradorTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buscar, setBuscar] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');
  const { user } = useAuth();

  // Conversación
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetail, setTicketDetail] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [enviando, setEnviando] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchTickets();

    socket.on('ticketEscalated', () => fetchTickets());
    socket.on('ticketUpdated', (data) => {
      fetchTickets();
      if (ticketDetail && data._id === ticketDetail._id) {
        setTicketDetail(data);
      }
    });
    socket.on('ticketMessageSent', (data) => {
      if (ticketDetail && data._id === ticketDetail._id) {
        setTicketDetail(data);
      }
    });

    return () => {
      socket.off('ticketEscalated');
      socket.off('ticketUpdated');
      socket.off('ticketMessageSent');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketDetail]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ticketDetail?.mensajes]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await servicioSoporte.obtenerTickets({ estado: filtroEstado || undefined, prioridad: filtroPrioridad || undefined });
      setTickets(response.data || []);
    } catch (err) {
      setError('Error al cargar los tickets escalados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewConversation = async (ticketId) => {
    try {
      const response = await servicioSoporte.obtenerDetalleTicket(ticketId);
      setTicketDetail(response.data);
      setSelectedTicket(ticketId);
      socket.emit('joinTicketRoom', ticketId);
    } catch (err) {
      console.error('Error al cargar detalle:', err);
    }
  };

  const handleCloseConversation = () => {
    if (selectedTicket) socket.emit('leaveTicketRoom', selectedTicket);
    setSelectedTicket(null);
    setTicketDetail(null);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || enviando) return;
    try {
      setEnviando(true);
      await servicioSoporte.responderTicket(selectedTicket, newMessage);
      setNewMessage('');
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
      const response = await servicioSoporte.obtenerDetalleTicket(selectedTicket);
      setTicketDetail(response.data);
      fetchTickets();
    } catch (err) {
      console.error('Error al asignar ticket:', err);
    }
  };

  const handleChangeStatus = async (estado) => {
    try {
      await servicioSoporte.cambiarEstadoTicket(selectedTicket, estado);
      const response = await servicioSoporte.obtenerDetalleTicket(selectedTicket);
      setTicketDetail(response.data);
      fetchTickets();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
    }
  };

  const getEstadoClass = (e) => ({ 'open': 'estado-abierto', 'in_progress': 'estado-progreso', 'waiting_customer': 'estado-espera', 'resolved': 'estado-resuelto', 'closed': 'estado-cerrado' }[e] || '');
  const getEstadoLabel = (e) => ({ 'open': 'Abierto', 'in_progress': 'En Progreso', 'waiting_customer': 'Esperando Cliente', 'resolved': 'Resuelto', 'closed': 'Cerrado' }[e] || e);
  const getPrioridadClass = (p) => ({ 'Alta': 'prio-alta', 'Media': 'prio-media', 'Baja': 'prio-baja' }[p] || '');

  const ticketsFiltrados = tickets.filter(t => {
    const matchBuscar = !buscar || t.asunto?.toLowerCase().includes(buscar.toLowerCase()) || t.user?.nombre?.toLowerCase().includes(buscar.toLowerCase());
    return matchBuscar;
  });

  const statsAbiertos = tickets.filter(t => t.estado === 'open' || t.estado === 'in_progress').length;
  const statsEspera = tickets.filter(t => t.estado === 'waiting_customer').length;
  const statsResueltos = tickets.filter(t => t.estado === 'resolved' || t.estado === 'closed').length;

  if (loading && tickets.length === 0) return (
    <div className="admin-tickets-loading"><Loader2 className="spin-icon" size={40} /><p>Cargando tickets...</p></div>
  );

  return (
    <div className="admin-tickets-container">
      {/* Header */}
      <div className="admin-tickets-header">
        <div className="admin-tickets-title">
          <Ticket size={28} />
          <h1>Tickets Escalados</h1>
        </div>
        <button className="admin-tickets-refresh" onClick={fetchTickets}><RefreshCw size={18} /> Actualizar</button>
      </div>

      {error && (<div className="admin-tickets-error"><AlertCircle size={18} /> {error}</div>)}

      {/* Stats */}
      <div className="admin-tickets-stats">
        <div className="admin-stat-card"><span className="admin-stat-num">{statsAbiertos}</span><span className="admin-stat-label">Abiertos</span></div>
        <div className="admin-stat-card"><span className="admin-stat-num">{statsEspera}</span><span className="admin-stat-label">Esperando</span></div>
        <div className="admin-stat-card"><span className="admin-stat-num">{statsResueltos}</span><span className="admin-stat-label">Resueltos</span></div>
        <div className="admin-stat-card"><span className="admin-stat-num">{tickets.length}</span><span className="admin-stat-label">Total</span></div>
      </div>

      {/* Filtros */}
      <div className="admin-tickets-filters">
        <div className="admin-search-bar">
          <Search size={18} />
          <input type="text" placeholder="Buscar por asunto o cliente..." value={buscar} onChange={e => setBuscar(e.target.value)} />
        </div>
        <div className="admin-filter-group">
          <Filter size={16} />
          <select value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setTimeout(fetchTickets, 0); }}>
            <option value="">Todos los estados</option>
            <option value="open">Abierto</option>
            <option value="in_progress">En Progreso</option>
            <option value="waiting_customer">Esperando Cliente</option>
            <option value="resolved">Resuelto</option>
            <option value="closed">Cerrado</option>
          </select>
          <select value={filtroPrioridad} onChange={e => { setFiltroPrioridad(e.target.value); setTimeout(fetchTickets, 0); }}>
            <option value="">Todas las prioridades</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
      </div>

      {/* Lista de Tickets */}
      <div className="admin-tickets-list">
        {ticketsFiltrados.length === 0 ? (
          <div className="admin-tickets-empty">
            <Ticket size={48} style={{ opacity: 0.3 }} />
            <p>No hay tickets escalados</p>
          </div>
        ) : (
          ticketsFiltrados.map(ticket => (
            <div key={ticket._id} className="admin-ticket-card" onClick={() => handleViewConversation(ticket._id)}>
              <div className="admin-ticket-left">
                <span className="admin-ticket-id">TKT-{ticket._id.slice(-6).toUpperCase()}</span>
                <h3 className="admin-ticket-subject">{ticket.asunto}</h3>
                <div className="admin-ticket-meta">
                  <span className={`admin-prio-badge ${getPrioridadClass(ticket.prioridad)}`}>{ticket.prioridad}</span>
                  <span className="admin-ticket-date"><Clock size={14} /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                  <span className="admin-ticket-client">👤 {ticket.user?.nombre || 'Sin asignar'}</span>
                </div>
              </div>
              <div className="admin-ticket-right">
                <span className={`admin-estado-badge ${getEstadoClass(ticket.estado)}`}>
                  {ticket.estado === 'resolved' || ticket.estado === 'closed' ? <CheckCircle size={14} /> : <Clock size={14} />}
                  {getEstadoLabel(ticket.estado)}
                </span>
                <span className="admin-ticket-msgs"><MessageCircle size={14} /> {ticket.mensajes?.length || 0}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Conversación */}
      {selectedTicket && ticketDetail && (
        <div className="admin-conv-overlay" onClick={handleCloseConversation}>
          <div className="admin-conv-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-conv-header">
              <div>
                <h2><MessageCircle size={20} /> {ticketDetail.asunto}</h2>
                <span className="admin-conv-ticket-id">TKT-{ticketDetail._id.slice(-6).toUpperCase()}</span>
              </div>
              <button className="admin-conv-close" onClick={handleCloseConversation}><X size={20} /></button>
            </div>

            <div className="admin-conv-info-bar">
              <span className={`admin-estado-badge ${getEstadoClass(ticketDetail.estado)}`}>
                {getEstadoLabel(ticketDetail.estado)}
              </span>
              <span className={`admin-prio-badge ${getPrioridadClass(ticketDetail.prioridad)}`}>
                {ticketDetail.prioridad}
              </span>
              {ticketDetail.asignadoA ? (
                <span className="admin-conv-assigned">✅ Asignado a: {ticketDetail.asignadoA.nombre}</span>
              ) : (
                <button className="admin-conv-assign-btn" onClick={handleAssignTicket}>
                  <UserCheck size={14} /> Asignarme
                </button>
              )}
            </div>

            {/* Acciones de estado */}
            <div className="admin-conv-actions">
              <span className="admin-actions-label">Cambiar estado:</span>
              {[
                { key: 'open', label: 'Abierto' },
                { key: 'in_progress', label: 'En Progreso' },
                { key: 'waiting_customer', label: 'Esperando' },
                { key: 'resolved', label: 'Resuelto' },
                { key: 'closed', label: 'Cerrado' },
              ].map(st => (
                <button
                  key={st.key}
                  className={`admin-status-btn ${ticketDetail.estado === st.key ? 'active' : ''} ${st.key === 'resolved' ? 'resolve' : st.key === 'closed' ? 'close-btn' : ''}`}
                  onClick={() => handleChangeStatus(st.key)}
                  disabled={ticketDetail.estado === st.key}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Mensajes */}
            <div className="admin-conv-messages">
              {ticketDetail.mensajes && ticketDetail.mensajes.length > 0 ? (
                ticketDetail.mensajes.map((msg, i) => (
                  <div key={i} className={`admin-msg-bubble ${msg.remitente?._id === user?.id ? 'own' : msg.remitente?.role === 'soporte' || msg.remitente?.role === 'administrador' ? 'support' : 'client'}`}>
                    <div className="admin-msg-header">
                      <strong>{msg.remitente?.nombre || 'Usuario'}</strong>
                      <span className="admin-msg-role">{msg.remitente?.role || ''}</span>
                    </div>
                    <p className="admin-msg-text">{msg.texto}</p>
                    <span className="admin-msg-time">{new Date(msg.fecha).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="admin-conv-no-msgs">Sin mensajes aún</p>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de respuesta */}
            {ticketDetail.estado !== 'closed' && ticketDetail.estado !== 'resolved' && (
              <div className="admin-conv-input">
                <input
                  type="text"
                  placeholder="Escribe tu respuesta..."
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
