import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import servicioGamificacion from '../../services/gamificationService';
import api from '../../services/api';
import { Gift, RotateCcw, PartyPopper, AlertCircle, Copy, CheckCircle2 } from 'lucide-react';
import './RuletaPrimeraCompra.css';

const SEGMENTOS = [
  { etiqueta: '5%', valor: 5, color: '#6366f1' },
  { etiqueta: '10%', valor: 10, color: '#8b5cf6' },
  { etiqueta: '15%', valor: 15, color: '#a855f7' },
  { etiqueta: '20%', valor: 20, color: '#d946ef' },
  { etiqueta: '25%', valor: 25, color: '#ec4899' },
  { etiqueta: '10%', valor: 10, color: '#f43f5e' },
  { etiqueta: '5%', valor: 5, color: '#f97316' },
  { etiqueta: '15%', valor: 15, color: '#eab308' },
];

export default function RuletaPrimeraCompra() {
  const { user } = useAuth();
  const [girando, setGirando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const [rotacion, setRotacion] = useState(0);
  const [copiado, setCopiado] = useState(false);
  const [perfilFresco, setPerfilFresco] = useState(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);

  // Obtener datos frescos del perfil al montar (evitar datos stale del contexto)
  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const resp = await api.get('/auth/profile');
        setPerfilFresco(resp.data.data);
      } catch (err) {
        console.error('Error al cargar perfil para ruleta:', err);
      } finally {
        setCargandoPerfil(false);
      }
    };
    cargarPerfil();
  }, []);

  // Usar datos frescos del perfil si están disponibles, sino caer al contexto
  const datosUsuario = perfilFresco || user;
  const puedeGirar = datosUsuario?.firstPurchaseCompleted && !datosUsuario?.wheelSpun && !resultado;

  const manejarGiro = async () => {
    if (girando || !puedeGirar) return;

    setGirando(true);
    setError('');

    try {
      const respuesta = await servicioGamificacion.girarRuleta();

      // Calcular rotación basada en el descuento obtenido
      const indiceSegmento = SEGMENTOS.findIndex(s => s.valor === respuesta.data.descuentoPorcentaje);
      const anguloSegmento = 360 / SEGMENTOS.length;
      const anguloObjetivo = 360 - (indiceSegmento * anguloSegmento + anguloSegmento / 2);
      const vueltas = 5 + Math.random() * 3;
      const rotacionTotal = rotacion + vueltas * 360 + anguloObjetivo;

      setRotacion(rotacionTotal);

      // Esperar a que la animación termine
      setTimeout(() => {
        setResultado(respuesta.data);
        setGirando(false);
      }, 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al girar la ruleta');
      setGirando(false);
    }
  };

  const manejarCopiar = () => {
    if (resultado?.codigo) {
      navigator.clipboard.writeText(resultado.codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  // Generar paths SVG para los segmentos
  const renderizarRuleta = () => {
    const cx = 200, cy = 200, r = 190;
    const total = SEGMENTOS.length;
    const anguloPorSegmento = 360 / total;

    return SEGMENTOS.map((seg, i) => {
      const anguloInicio = (i * anguloPorSegmento - 90) * (Math.PI / 180);
      const anguloFin = ((i + 1) * anguloPorSegmento - 90) * (Math.PI / 180);
      const x1 = cx + r * Math.cos(anguloInicio);
      const y1 = cy + r * Math.sin(anguloInicio);
      const x2 = cx + r * Math.cos(anguloFin);
      const y2 = cy + r * Math.sin(anguloFin);
      const arcoGrande = anguloPorSegmento > 180 ? 1 : 0;

      const anguloMedio = ((i * anguloPorSegmento + anguloPorSegmento / 2) - 90) * (Math.PI / 180);
      const textoX = cx + (r * 0.65) * Math.cos(anguloMedio);
      const textoY = cy + (r * 0.65) * Math.sin(anguloMedio);
      const rotarTexto = i * anguloPorSegmento + anguloPorSegmento / 2;

      return (
        <g key={i}>
          <path
            d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${arcoGrande} 1 ${x2} ${y2} Z`}
            fill={seg.color}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />
          <text
            x={textoX}
            y={textoY}
            fill="white"
            fontSize="18"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${rotarTexto}, ${textoX}, ${textoY})`}
          >
            {seg.etiqueta}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="ruleta-container">
      <div className="ruleta-header">
        <Gift size={32} />
        <h1>Ruleta de Primera Compra</h1>
        <p>¡Gira la ruleta y obtén un cupón de descuento exclusivo!</p>
      </div>

      {error && (
        <div className="ruleta-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {!datosUsuario?.firstPurchaseCompleted && !cargandoPerfil && (
        <div className="ruleta-info">
          <AlertCircle size={24} />
          <div>
            <h3>¡Aún no has realizado tu primera compra!</h3>
            <p>Completa tu primera compra para desbloquear la ruleta de descuentos.</p>
          </div>
        </div>
      )}

      {datosUsuario?.wheelSpun && !resultado && !cargandoPerfil && (
        <div className="ruleta-info already-spun">
          <CheckCircle2 size={24} />
          <div>
            <h3>Ya has utilizado tu giro</h3>
            <p>La ruleta solo puede girarse una vez después de tu primera compra.</p>
          </div>
        </div>
      )}

      <div className="ruleta-wheel-container">
        <div className="ruleta-pointer">▼</div>
        <svg
          width="400"
          height="400"
          viewBox="0 0 400 400"
          className="ruleta-wheel"
          style={{
            transform: `rotate(${rotacion}deg)`,
            transition: girando ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          }}
        >
          {renderizarRuleta()}
          <circle cx="200" cy="200" r="30" fill="#1a1a2e" stroke="white" strokeWidth="3" />
          <text x="200" y="200" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
            GIRA
          </text>
        </svg>
      </div>

      {!resultado && (
        <button
          className={`ruleta-spin-btn ${(!puedeGirar || girando) ? 'disabled' : ''}`}
          onClick={manejarGiro}
          disabled={!puedeGirar || girando}
        >
          <RotateCcw size={20} className={girando ? 'spinning-icon' : ''} />
          {girando ? 'Girando...' : 'Girar Ruleta'}
        </button>
      )}

      {resultado && (
        <div className="ruleta-result">
          <PartyPopper size={48} />
          <h2>¡Felicidades! 🎉</h2>
          <p className="result-discount">Has ganado un <strong>{resultado.descuentoPorcentaje}%</strong> de descuento</p>
          <div className="result-coupon">
            <span className="coupon-code">{resultado.codigo}</span>
            <button className="copy-btn" onClick={manejarCopiar}>
              {copiado ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              {copiado ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <p className="result-expiry">
            Válido hasta: {new Date(resultado.validoHasta).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
