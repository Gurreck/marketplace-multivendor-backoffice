import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import NavbarSecundario from '../NavbarSecundario/NavbarSecundario';
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
  Box,
  Shuffle,
  Flag
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

/**
 * Componente Tracking
 * Vista premium sincronizada con el estilo Nexora para el seguimiento de paquetes.
 */
const Tracking = ({ isEmbedded = false }) => {
  const { isDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  
  // Estado para simular la carga de datos del paquete
  const [datosEnvio, setDatosEnvio] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Simulación de una llamada a API para obtener datos de rastreo
    const obtenerDatos = () => {
      setTimeout(() => {
        setDatosEnvio({
          idRastreo: "MX-98234-7721",
          estadoActual: 3, // Corresponde al índice del paso actual (en camino)
          transportista: "Logística Express",
          fechaEstimada: "31 de Marzo, 2026",
          destino: "San José, Costa Rica",
          origen: "Ciudad de México, México",
          pasos: [
            { nombre: "Pedido", icono: <Package size={20} />, completado: true },
            { nombre: "Procesado", icono: <Box size={20} />, completado: true },
            { nombre: "Despachado", icono: <Shuffle size={20} />, completado: true },
            { nombre: "En Camino", icono: <Truck size={20} />, activo: true },
            { nombre: "Entregado", icono: <Flag size={20} />, completado: false }
          ],
          historial: [
            { 
              evento: "Llegada al Centro de Distribución Local", 
              ubicacion: "San José, CR", 
              fecha: "30 Mar 2026 - 09:15 AM" 
            },
            { 
              evento: "En Tránsito Internacional", 
              ubicacion: "Aduana Aeropuerto Juan Santamaría", 
              fecha: "29 Mar 2026 - 02:30 PM" 
            },
            { 
              evento: "Salida del Centro de Clasificación", 
              ubicacion: "Ciudad de México, MX", 
              fecha: "28 Mar 2026 - 11:00 AM" 
            },
            { 
              evento: "Paquete Recibido por Transportista", 
              ubicacion: "Ciudad de México, MX", 
              fecha: "27 Mar 2026 - 10:45 AM" 
            }
          ]
        });
        setCargando(false);
      }, 1000);
    };

    obtenerDatos();
  }, []);

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

  return (
    <div className={isEmbedded ? '' : `contenedor-seguimiento-externo ${!isDarkMode ? 'modo-claro' : ''}`}>
      {!isEmbedded && (
        <NavbarSecundario 
          user={user} 
          logout={logout} 
          cartCount={cartCount} 
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
          {datosEnvio.pasos[datosEnvio.estadoActual].nombre}
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
              style={{ width: `${(datosEnvio.estadoActual / (datosEnvio.pasos.length - 1)) * 100}%` }}
            ></div>
          </div>

          {/* Renderizado de cada paso del stepper */}
          {datosEnvio.pasos.map((paso, indice) => (
            <div 
              key={indice} 
              className={`paso-stepper ${indice <= datosEnvio.estadoActual ? 'completado' : ''} ${indice === datosEnvio.estadoActual ? 'activo' : ''}`}
            >
              <div className="circulo-paso">
                {indice < datosEnvio.estadoActual ? <CheckCircle2 size={24} /> : paso.icono}
              </div>
              <span className="nombre-paso">{paso.nombre}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Grid Inferior: Historial y Mapa */}
      <div className="grid-detalles">
        
        {/* Registro Local de Actividad */}
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
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Visualización de Ubicación Actual (Mapa Real) */}
        <section className="tarjeta-detalle">
          <h2><MapPin size={22} /> Ubicación en Tiempo Real</h2>
          <div className="visualizacion-mapa">
            <MapContainer 
              center={[9.9333, -84.0833]} // Coordenadas aproximadas de San José, Costa Rica
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
            Última actualización: hace 15 minutos en el nodo central.
          </p>
        </section>

      </div>
      </div>
    </div>
  );
};

export default Tracking;
