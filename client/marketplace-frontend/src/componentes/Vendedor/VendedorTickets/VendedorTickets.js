import React, { useState, useEffect, useRef } from 'react';
import {
  Ticket, Clock, MessageCircle, CheckCircle, Search, RefreshCw,
  Send, X, AlertCircle, Loader2, Filter
} from 'lucide-react';
import servicioSoporte from '../../../services/supportService';
import socket from '../../../services/socket';
import { useAuth } from '../../../context/AuthContext';
import './VendedorTickets.css';

export default function VendedorTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buscar, setBuscar] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
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
      const response = await servicioSoporte.obtenerTickets({ estado: filtroEstado || undefined });
      setTickets(response.data || []);
    } catch (err) {
      setError('Error al cargar los tickets');
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

  const getEstadoClass = (e) => ({ 'open': 'vt-estado-abierto', 'in_progress': 'vt-estado-progreso', 'waiting_customer': 'vt-estado-espera', 'resolved': 'vt-estado-resuelto', 'closed': 'vt-estado-cerrado' }[e] || '');
  const getEstadoLabel = (e) => ({ 'open': 'Abierto', 'in_progress': 'En Progreso', 'waiting_customer': 'Esperando Cliente', 'resolved': 'Resuelto', 'closed': 'Cerrado' }[e] || e);
  const getPrioridadClass = (p) => ({ 'Alta': 'vt-prio-alta', 'Media': 'vt-prio-media', 'Baja': 'vt-prio-baja' }[p] || '');

  const ticketsFiltrados = tickets.filter(t => {
    const matchBuscar = !buscar || t.asunto?.toLowerCase().includes(buscar.toLowerCase()) || t.user?.nombre?.toLowerCase().includes(buscar.toLowerCase());
    return matchBuscar;
  });

  const statsAbiertos = tickets.filter(t => t.estado === 'open' || t.estado === 'in_progress').length;
  const statsEspera = tickets.filter(t => t.estado === 'waiting_customer').length;
  const statsResueltos = tickets.filter(t => t.estado === 'resolved' || t.estado === 'closed').length;

  if (loading && tickets.length === 0) return (
    <div className="vt-loading"><Loader2 className="vt-spin" size={40} /><p>Cargando tickets...</p></div>
  );

  return (
    <div className="vt-container">
      <div className="vt-header">
        <div className="vt-title"><Ticket size={28} /><h1>Tickets Escalados</h1></div>
        <button className="vt-refresh" onClick={fetchTickets}><RefreshCw size={18} /> Actualizar</button>
      </div>

      {error && (<div className="vt-error"><AlertCircle size={18} /> {error}</div>)}

      <div className="vt-stats">
        <div className="vt-stat-card"><span className="vt-stat-num">{statsAbiertos}</span><span className="vt-stat-label">Abiertos</span></div>
        <div className="vt-stat-card"><span className="vt-stat-num">{statsEspera}</span><span className="vt-stat-label">Esperando</span></div>
        <div className="vt-stat-card"><span className="vt-stat-num">{statsResueltos}</span><span className="vt-stat-label">Resueltos</span></div>
      </div>

      <div className="vt-filters">
        <div className="vt-search">
          <Search size={18} />
          <input type="text" placeholder="Buscar por asunto o cliente..." value={buscar} onChange={e => setBuscar(e.target.value)} />
        </div>
        <div className="vt-filter-group">
          <Filter size={16} />
          <select value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setTimeout(fetchTickets, 0); }}>
            <option value="">Todos</option>
            <option value="open">Abierto</option>
            <option value="in_progress">En Progreso</option>
            <option value="waiting_customer">Esperando</option>
            <option value="resolved">Resuelto</option>
            <option value="closed">Cerrado</option>
          </select>
        </div>
      </div>

      <div className="vt-list">
        {ticketsFiltrados.length === 0 ? (
          <div className="vt-empty"><Ticket size={48} style={{ opacity: 0.3 }} /><p>No hay tickets escalados</p></div>
        ) : (
          ticketsFiltrados.map(ticket => (
            <div key={ticket._id} className="vt-card" onClick={() => handleViewConversation(ticket._id)}>
              <div className="vt-card-left">
                <span className="vt-card-id">TKT-{ticket._id.slice(-6).toUpperCase()}</span>
                <h3 className="vt-card-subject">{ticket.asunto}</h3>
                <div className="vt-card-meta">
                  <span className={`vt-prio-badge ${getPrioridadClass(ticket.prioridad)}`}>{ticket.prioridad}</span>
                  <span className="vt-card-date"><Clock size={14} /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                  <span className="vt-card-client">👤 {ticket.user?.nombre || 'Cliente'}</span>
                </div>
              </div>
              <div className="vt-card-right">
                <span className={`vt-estado-badge ${getEstadoClass(ticket.estado)}`}>
                  {ticket.estado === 'resolved' || ticket.estado === 'closed' ? <CheckCircle size={14} /> : <Clock size={14} />}
                  {getEstadoLabel(ticket.estado)}
                </span>
                <span className="vt-card-msgs"><MessageCircle size={14} /> {ticket.mensajes?.length || 0}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Conversación */}
      {selectedTicket && ticketDetail && (
        <div className="vt-conv-overlay" onClick={handleCloseConversation}>
          <div className="vt-conv-modal" onClick={e => e.stopPropagation()}>
            <div className="vt-conv-header">
              <div>
                <h2><MessageCircle size={20} /> {ticketDetail.asunto}</h2>
                <span className="vt-conv-id">TKT-{ticketDetail._id.slice(-6).toUpperCase()}</span>
              </div>
              <button className="vt-conv-close" onClick={handleCloseConversation}><X size={20} /></button>
            </div>
            <div className="vt-conv-info">
              <span className={`vt-estado-badge ${getEstadoClass(ticketDetail.estado)}`}>{getEstadoLabel(ticketDetail.estado)}</span>
              <span className={`vt-prio-badge ${getPrioridadClass(ticketDetail.prioridad)}`}>{ticketDetail.prioridad}</span>
              {ticketDetail.asignadoA && (
                <span className="vt-conv-assigned">Asignado a: {ticketDetail.asignadoA.nombre}</span>
              )}
            </div>
            {/* Acciones de estado */}
            <div className="vt-conv-actions">
              <span className="vt-actions-label">Cambiar estado:</span>
              {[
                { key: 'open', label: 'Abierto' },
                { key: 'in_progress', label: 'En Progreso' },
                { key: 'waiting_customer', label: 'Esperando' },
                { key: 'resolved', label: 'Resuelto' },
                { key: 'closed', label: 'Cerrado' },
              ].map(st => (
                <button
                  key={st.key}
                  className={`vt-status-btn ${ticketDetail.estado === st.key ? 'active' : ''} ${st.key === 'resolved' ? 'resolve' : st.key === 'closed' ? 'close-btn' : ''}`}
                  onClick={() => handleChangeStatus(st.key)}
                  disabled={ticketDetail.estado === st.key}
                >
                  {st.label}
                </button>
              ))}
            </div>
            <div className="vt-conv-messages">
              {ticketDetail.mensajes && ticketDetail.mensajes.length > 0 ? (
                ticketDetail.mensajes.map((msg, i) => (
                  <div key={i} className={`vt-msg ${msg.remitente?._id === user?.id ? 'own' : msg.remitente?.role === 'vendedor' ? 'vendor' : msg.remitente?.role === 'soporte' || msg.remitente?.role === 'administrador' ? 'support' : 'client'}`}>
                    <div className="vt-msg-head"><strong>{msg.remitente?.nombre || 'Usuario'}</strong><span>{msg.remitente?.role || ''}</span></div>
                    <p className="vt-msg-text">{msg.texto}</p>
                    <span className="vt-msg-time">{new Date(msg.fecha).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="vt-no-msgs">Sin mensajes aún</p>
              )}
              <div ref={messagesEndRef} />
            </div>
            {ticketDetail.estado !== 'closed' && ticketDetail.estado !== 'resolved' && (
              <div className="vt-conv-input">
                <input
                  type="text" placeholder="Escribe tu respuesta..."
                  value={newMessage} onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage} disabled={enviando || !newMessage.trim()}><Send size={18} /></button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
