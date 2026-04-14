import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import NavbarSecundario from '../../NavbarSecundario/NavbarSecundario';
import RuletaPrimeraCompra from '../../RuletaPrimeraCompra/RuletaPrimeraCompra';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  ArrowLeft,
  Gift
} from 'lucide-react';
import './Rastreo.css';
import useRastreoData, { ETIQUETAS_ESTADO } from '../useRastreoData/useRastreoData';

// Configuración necesaria para que los iconos de Leaflet se carguen correctamente en React
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const Rastreo = ({ isEmbedded = false, orden = null }) => {
  const { isDarkMode: esModoOscuro } = useTheme();
  const { user, logout: cerrarSesion } = useAuth();
  const { cartCount: cantidadCarrito } = useCart();
  const navegar = useNavigate();

  const {
    datosEnvio, cargando, mostrarRuleta, setMostrarRuleta,
    entregaConfirmada, confirmando, errorEntrega,
    manejarConfirmarEntrega,
  } = useRastreoData({ orden });

  const cerrarRuleta = () => {
    setMostrarRuleta(false);
    navegar('/');
  };

  if (cargando) {
    return (
      <div className="contenedor-seguimiento">
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <Clock className="animacion-pulso" size={48} color="#4f46e5" />
          <p style={{ marginTop: '20px', color: '#64748b' }}>
            Buscando información de tu paquete...
          </p>
        </div>
      </div>
    );
  }

  if (!datosEnvio) {
    return (
      <div className="contenedor-seguimiento">
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <Package size={48} color="#64748b" style={{ opacity: 0.5 }} />
          <p style={{ marginTop: '20px', color: '#64748b' }}>
            No hay información de seguimiento disponible.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={isEmbedded ? '' : `contenedor-seguimiento-externo ${!esModoOscuro ? 'modo-claro' : ''}`}>
      {!isEmbedded && (
        <NavbarSecundario user={user} logout={cerrarSesion} cartCount={cantidadCarrito} />
      )}

      <div className="contenedor-seguimiento">
        {!isEmbedded && (
          <button className="boton-volver" onClick={() => window.history.back()}>
            <ArrowLeft size={18} /> Volver a mis pedidos
          </button>
        )}

        <header className="encabezado-rastreo">
          <div>
            <h1>Rastreo de Paquete</h1>
            <p className="subtitulo-rastreo">
              ID: <span className="texto-id-rastreo">{datosEnvio.idRastreo}</span>
            </p>
          </div>
          <div className="etiqueta-estado">
            {ETIQUETAS_ESTADO[datosEnvio.estado] || datosEnvio.estado}
          </div>
        </header>

        <section className="resumen-info-grid">
          <div className="tarjeta-info">
            <div className="icono-contenedor"><Calendar size={24} /></div>
            <div className="info-texto"><h3>Entrega Estimada</h3><p>{datosEnvio.fechaEstimada}</p></div>
          </div>
          <div className="tarjeta-info">
            <div className="icono-contenedor"><Truck size={24} /></div>
            <div className="info-texto"><h3>Transportista</h3><p>{datosEnvio.transportista}</p></div>
          </div>
          <div className="tarjeta-info">
            <div className="icono-contenedor"><MapPin size={24} /></div>
            <div className="info-texto"><h3>Destino</h3><p>{datosEnvio.destino}</p></div>
          </div>
        </section>

        <section className="seccion-proceso">
          <div className="contenedor-stepper">
            <div className="linea-progreso">
              <div className="barra-progreso-llenado" style={{ width: `${Math.min((datosEnvio.estadoActual / (datosEnvio.pasos.length - 1)) * 100, 100)}%` }}></div>
            </div>
            {datosEnvio.pasos.map((paso, indice) => (
              <div key={indice} className={`paso-stepper ${paso.completado ? 'completado' : ''} ${paso.activo ? 'activo' : ''}`}>
                <div className="circulo-paso">
                  {paso.completado && !paso.activo ? <CheckCircle2 size={24} /> : paso.icono}
                </div>
                <span className="nombre-paso">{paso.nombre}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="grid-detalles">
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

            {datosEnvio.estado === 'delivered' && !entregaConfirmada && (
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button className="boton-recoger-paquete" onClick={manejarConfirmarEntrega}
                  disabled={confirmando} style={confirmando ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
                  <Gift size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  {confirmando ? 'Confirmando...' : 'Confirmar Entrega del Paquete'}
                </button>
                {errorEntrega && (
                  <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '10px', fontWeight: 600 }}>{errorEntrega}</p>
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

          <section className="tarjeta-detalle">
            <h2><MapPin size={22} /> Ubicación en Tiempo Real</h2>
            <div className="visualizacion-mapa">
              <MapContainer center={[9.9333, -84.0833]} zoom={13} scrollWheelZoom={false}
                style={{ height: "100%", width: "100%", borderRadius: "15px" }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[9.9333, -84.0833]}>
                  <Popup>Tu paquete está aquí: <br /> <b>Centro de Distribución San José</b></Popup>
                </Marker>
              </MapContainer>
            </div>
            <p className="ubicacion-actividad" style={{ marginTop: '1rem', textAlign: 'center' }}>
              Estado actual: {ETIQUETAS_ESTADO[datosEnvio.estado] || datosEnvio.estado} — actualizado por el vendedor.
            </p>
          </section>
        </div>
      </div>

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

export default Rastreo;