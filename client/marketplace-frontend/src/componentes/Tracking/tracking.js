import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLocation, useNavigate } from 'react-router-dom';
import NavbarSecundario from '../NavbarSecundario/NavbarSecundario';
import RuletaPrimeraCompra from '../RuletaPrimeraCompra/RuletaPrimeraCompra';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import api from '../../services/api';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  Box,
  Shuffle,
  Star,
  Gift
} from 'lucide-react';
import './tracking.css';


// Configuración necesaria para que los iconos de Leaflet se carguen correctamente en React
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Definición de los pasos del tracking y sus íconos
const PASOS_TRACKING = [
  { nombre: "Pedido", icono: <Package size={20} />, estadoRequerido: "created" },
  { nombre: "Pagado", icono: <Star size={20} />, estadoRequerido: "paid" },
  { nombre: "Empacado", icono: <Box size={20} />, estadoRequerido: "packed" },
  { nombre: "Despachado", icono: <Shuffle size={20} />, estadoRequerido: "shipped" },
  { nombre: "Entregado", icono: <CheckCircle2 size={20} />, estadoRequerido: "delivered" },
];

// Mapeo de estados a etiquetas en español
const ETIQUETAS_ESTADO = {
  created: "Creada",
  pending: "Pendiente",
  paid: "Pagada",
  packed: "Empacada",
  shipped: "Enviada",
  delivered: "Entregada",
  cancelled: "Cancelada",
  receipt_confirmed: "Recepción Confirmada",
};

// Orden de flujo de estados
const FLUJO_ESTADOS = ["created", "pending", "paid", "packed", "shipped", "delivered"];

/**
 * Componente Seguimiento
 * Vista premium sincronizada con el estilo Nexora para el seguimiento de paquetes.
 * El progreso lo controla el vendedor desde su panel, no es automático.
 */
const Tracking = ({ isEmbedded = false, orden = null }) => {
  const { isDarkMode: esModoOscuro } = useTheme();
  const { user, logout: cerrarSesion } = useAuth();
  const { cartCount: cantidadCarrito } = useCart();
  const location = useLocation();
  const navegar = useNavigate();
  
  const [datosEnvio, setDatosEnvio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarRuleta, setMostrarRuleta] = useState(false);
  const [entregaConfirmada, setEntregaConfirmada] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [errorEntrega, setErrorEntrega] = useState('');

  useEffect(() => {
    cargarDatosTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orden]);

  const cargarDatosTracking = () => {
    // Obtener la orden: puede venir como prop, del estado de navegación, o ser nula
    const ordenDatos = orden || location.state?.order;

    if (!ordenDatos) {
      // Sin orden, mostrar estado vacío
      setCargando(false);
      return;
    }

    // Calcular el índice actual del estado en el flujo
    const estadoActual = ordenDatos.status || "created";
    const indiceEstadoActual = FLUJO_ESTADOS.indexOf(estadoActual);

    // Generar ID de tracking legible
    const idRastreo = (ordenDatos._id || "NEXORA-ORD").toString().slice(-10).toUpperCase();

    // Calcular fecha estimada basada en statusHistory o fecha de creación
    const fechaCreacion = new Date(ordenDatos.createdAt || Date.now());
    const fechaEstimada = new Date(fechaCreacion.getTime() + 5 * 24 * 60 * 60 * 1000);

    // Construir pasos con estado real de la orden
    const pasos = PASOS_TRACKING.map((paso, indice) => {
      const indicePaso = FLUJO_ESTADOS.indexOf(paso.estadoRequerido);
      return {
        ...paso,
        completado: indicePaso <= indiceEstadoActual,
        activo: indicePaso === indiceEstadoActual,
      };
    });

    // Revisar si ya fue confirmada la entrega en el historial
    const yaConfirmado = (ordenDatos.statusHistory || []).some(
      (h) => h.estado === 'receipt_confirmed'
    );
    setEntregaConfirmada(yaConfirmado);

    // Construir historial desde statusHistory real de la orden
    const historial = (ordenDatos.statusHistory || [])
      .slice()
      .reverse()
      .map((entrada) => ({
        evento: ETIQUETAS_ESTADO[entrada.estado] || entrada.estado,
        ubicacion: entrada.comentario
          ? (entrada.comentario === 'Orden creada' ? 'Orden creada'
            : entrada.comentario === 'Cliente confirmó la recepción del paquete' ? 'Cliente confirmó la recepción del paquete'
            : `Avanzado a ${ETIQUETAS_ESTADO[entrada.estado] || entrada.estado}`)
          : `Avanzado a ${ETIQUETAS_ESTADO[entrada.estado] || entrada.estado}`,
        fecha: new Date(entrada.fecha).toLocaleString('es-ES'),
        usuario: entrada.usuarioQueCambio?.nombre || "",
      }));

    // Si no hay historial, crear uno mínimo
    if (historial.length === 0) {
      historial.push({
        evento: "Orden Creada",
        ubicacion: "Plataforma Nexora",
        fecha: fechaCreacion.toLocaleString('es-ES'),
      });
    }

    const destino = ordenDatos.shippingAddress
      ? `${ordenDatos.shippingAddress.ciudad}, ${ordenDatos.shippingAddress.pais || 'CR'}`
      : "San José, Costa Rica";

    setDatosEnvio({
      idRastreo,
      estadoActual: indiceEstadoActual,
      estado: estadoActual,
      transportista: "Logística Express",
      fechaEstimada: fechaEstimada.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
      destino,
      origen: "Centro de Distribución Nexora",
      pasos,
      historial,
      ordenOriginal: ordenDatos,
    });

    setCargando(false);
  };

  // Manejar "Confirmar Entrega" / "Recoger Paquete"
  const manejarConfirmarEntrega = async () => {
    if (confirmando) return;
    setConfirmando(true);
    setErrorEntrega('');
    try {
      // 1. Llamar al backend para confirmar recepción (agregar al statusHistory)
      if (datosEnvio?.ordenOriginal?._id) {
        await api.put(`/orders/${datosEnvio.ordenOriginal._id}/confirm-receipt`);
      }
      // Solo marcar como confirmada si el backend respondió exitosamente
      setEntregaConfirmada(true);

      // 2. Consultar perfil de usuario para ver si amerita ruleta
      try {
        const respuesta = await api.get('/auth/profile');
        const datosUsuario = respuesta.data.data;

        if (datosUsuario.firstPurchaseCompleted && !datosUsuario.wheelSpun) {
          // ¡Es primera compra! Mostrar la ruleta
          setMostrarRuleta(true);
        }
      } catch (profileErr) {
        // Error al obtener perfil no es crítico, la entrega ya se confirmó
        console.warn("No se pudo verificar elegibilidad de ruleta:", profileErr);
      }
    } catch (err) {
      console.error("Error al confirmar entrega:", err);
      const status = err.response?.status;
      const mensaje = err.response?.data?.message || '';

      if (status === 400 && mensaje.includes('ya fue confirmada')) {
        // El backend dice que ya estaba confirmada, sincronizar estado local
        setEntregaConfirmada(true);
      } else {
        // Error real (red, servidor, permisos) → NO marcar como confirmada
        setErrorEntrega(mensaje || 'Error al confirmar la entrega. Intenta de nuevo.');
      }
    } finally {
      setConfirmando(false);
    }
  };

  // Cerrar modal de ruleta
  const cerrarRuleta = () => {
    setMostrarRuleta(false);
    navegar('/');
  };

  // Pantalla de carga con estética limpia
  if (cargando) {
    return (
      <div className="contenedor-seguimiento">
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <Clock className="animacion-pulso" size={48} color="#4f46e5" />
          <p style={{ marginTop: '20px', color: '#64748b' }}>Buscando información de tu paquete...</p>
        </div>
      </div>
    );
  }

  // Sin datos de orden
  if (!datosEnvio) {
    return (
      <div className="contenedor-seguimiento">
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <Package size={48} color="#64748b" style={{ opacity: 0.5 }} />
          <p style={{ marginTop: '20px', color: '#64748b' }}>No hay información de seguimiento disponible.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isEmbedded ? '' : `contenedor-seguimiento-externo ${!esModoOscuro ? 'modo-claro' : ''}`}>
      {!isEmbedded && (
        <NavbarSecundario 
          user={user} 
          logout={cerrarSesion} 
          cartCount={cantidadCarrito} 
        />
      )}
      <div className="contenedor-seguimiento">
        {/* Botón para regresar opcional */}
      {!isEmbedded && (
        <button className="boton-volver" onClick={() => window.history.back()}>
          <ArrowLeft size={18} />
          Volver a mis pedidos
        </button>
      )}

      {/* Encabezado Principal */}
      <header className="encabezado-rastreo">
        <div>
          <h1>Rastreo de Paquete</h1>
          <p className="subtitulo-rastreo">ID: <span className="texto-id-rastreo">{datosEnvio.idRastreo}</span></p>
        </div>
        <div className="etiqueta-estado">
          {ETIQUETAS_ESTADO[datosEnvio.estado] || datosEnvio.estado}
        </div>
      </header>

      {/* Grid de Información Rápida */}
      <section className="resumen-info-grid">
        <div className="tarjeta-info">
          <div className="icono-contenedor">
            <Calendar size={24} />
          </div>
          <div className="info-texto">
            <h3>Entrega Estimada</h3>
            <p>{datosEnvio.fechaEstimada}</p>
          </div>
        </div>

        <div className="tarjeta-info">
          <div className="icono-contenedor">
            <Truck size={24} />
          </div>
          <div className="info-texto">
            <h3>Transportista</h3>
            <p>{datosEnvio.transportista}</p>
          </div>
        </div>

        <div className="tarjeta-info">
          <div className="icono-contenedor">
            <MapPin size={24} />
          </div>
          <div className="info-texto">
            <h3>Destino</h3>
            <p>{datosEnvio.destino}</p>
          </div>
        </div>
      </section>

      {/* Sección de Progreso (Stepper Visual) */}
      <section className="seccion-proceso">
        <div className="contenedor-stepper">
          {/* Línea de fondo del progreso */}
          <div className="linea-progreso">
            <div 
              className="barra-progreso-llenado" 
              style={{ width: `${Math.min((datosEnvio.estadoActual / (datosEnvio.pasos.length - 1)) * 100, 100)}%` }}
            ></div>
          </div>

          {/* Renderizado de cada paso del stepper */}
          {datosEnvio.pasos.map((paso, indice) => (
            <div 
              key={indice} 
              className={`paso-stepper ${paso.completado ? 'completado' : ''} ${paso.activo ? 'activo' : ''}`}
            >
              <div className="circulo-paso">
                {paso.completado && !paso.activo ? <CheckCircle2 size={24} /> : paso.icono}
              </div>
              <span className="nombre-paso">{paso.nombre}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Grid Inferior: Historial y Mapa */}
      <div className="grid-detalles">
        
        {/* Registro de Actividad */}
        <section className="tarjeta-detalle">
          <h2><Clock size={22} /> Historial de Actividad</h2>
          <div className="linea-actividad">
            {datosEnvio.historial.map((actividad, index) => (
              <div key={index} className="item-actividad">
                <div className="punto-actividad"></div>
                <div className="contenido-actividad">
                  <p className="evento-actividad">{actividad.evento}</p>
                  <p className="ubicacion-actividad">{actividad.ubicacion}</p>
                  <p className="fecha-actividad">{actividad.fecha}</p>
                  {actividad.usuario && (
                    <p className="fecha-actividad">Por: {actividad.usuario}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Botón de Confirmar Entrega — Solo visible cuando estado es "delivered" */}
          {datosEnvio.estado === 'delivered' && !entregaConfirmada && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button 
                className="boton-recoger-paquete" 
                onClick={manejarConfirmarEntrega}
                disabled={confirmando}
                style={confirmando ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              >
                <Gift size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                {confirmando ? 'Confirmando...' : 'Confirmar Entrega del Paquete'}
              </button>
              {errorEntrega && (
                <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '10px', fontWeight: 600 }}>
                  {errorEntrega}
                </p>
              )}
            </div>
          )}

          {entregaConfirmada && !mostrarRuleta && (
            <div style={{ marginTop: '20px', textAlign: 'center', color: '#10b981' }}>
              <CheckCircle2 size={32} />
              <p style={{ fontWeight: '700', marginTop: '8px' }}>¡Has confirmado la entrega de este paquete!</p>
            </div>
          )}
        </section>

        {/* Visualización de Ubicación Actual (Mapa Real) */}
        <section className="tarjeta-detalle">
          <h2><MapPin size={22} /> Ubicación en Tiempo Real</h2>
          <div className="visualizacion-mapa">
            <MapContainer 
              center={[9.9333, -84.0833]}
              zoom={13} 
              scrollWheelZoom={false} 
              style={{ height: "100%", width: "100%", borderRadius: "15px" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[9.9333, -84.0833]}>
                <Popup>
                  Tu paquete está aquí: <br /> <b>Centro de Distribución San José</b>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
          <p className="ubicacion-actividad" style={{ marginTop: '1rem', textAlign: 'center' }}>
            Estado actual: {ETIQUETAS_ESTADO[datosEnvio.estado] || datosEnvio.estado} — actualizado por el vendedor.
          </p>
        </section>

      </div>
      </div>

      {/* Modal de Ruleta de Primera Compra */}
      {mostrarRuleta && (
        <div className="modal-overlay-ruleta" onClick={cerrarRuleta}>
          <div className="modal-contenido-ruleta" onClick={(e) => e.stopPropagation()}>
            <button className="boton-cerrar-ruleta" onClick={cerrarRuleta}>✕</button>
            <RuletaPrimeraCompra />
          </div>
        </div>
      )}
    </div>
  );
};

export default Tracking;
