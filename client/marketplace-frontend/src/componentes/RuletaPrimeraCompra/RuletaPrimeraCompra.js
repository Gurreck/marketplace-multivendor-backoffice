import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import servicioGamificacion from '../../services/gamificationService';
import { Gift, RotateCcw, PartyPopper, AlertCircle, Copy, CheckCircle2 } from 'lucide-react';
import './RuletaPrimeraCompra.css';

const SEGMENTS = [
  { label: '5%', value: 5, color: '#6366f1' },
  { label: '10%', value: 10, color: '#8b5cf6' },
  { label: '15%', value: 15, color: '#a855f7' },
  { label: '20%', value: 20, color: '#d946ef' },
  { label: '25%', value: 25, color: '#ec4899' },
  { label: '10%', value: 10, color: '#f43f5e' },
  { label: '5%', value: 5, color: '#f97316' },
  { label: '15%', value: 15, color: '#eab308' },
];

export default function RuletaPrimeraCompra() {
  const { user } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [rotation, setRotation] = useState(0);
  const [copied, setCopied] = useState(false);

  const canSpin = user?.firstPurchaseCompleted && !user?.wheelSpun && !result;

  const handleSpin = async () => {
    if (spinning || !canSpin) return;

    setSpinning(true);
    setError('');

    try {
      const response = await servicioGamificacion.spinWheel();

      // Calcular rotación basada en el descuento obtenido
      const segIndex = SEGMENTS.findIndex(s => s.value === response.data.descuentoPorcentaje);
      const segAngle = 360 / SEGMENTS.length;
      const targetAngle = 360 - (segIndex * segAngle + segAngle / 2);
      const spins = 5 + Math.random() * 3;
      const totalRotation = rotation + spins * 360 + targetAngle;

      setRotation(totalRotation);

      // Esperar a que la animación termine
      setTimeout(() => {
        setResult(response.data);
        setSpinning(false);
      }, 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al girar la ruleta');
      setSpinning(false);
    }
  };

  const handleCopy = () => {
    if (result?.codigo) {
      navigator.clipboard.writeText(result.codigo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Generar paths SVG para los segmentos
  const renderWheel = () => {
    const cx = 200, cy = 200, r = 190;
    const total = SEGMENTS.length;
    const anglePerSeg = 360 / total;

    return SEGMENTS.map((seg, i) => {
      const startAngle = (i * anglePerSeg - 90) * (Math.PI / 180);
      const endAngle = ((i + 1) * anglePerSeg - 90) * (Math.PI / 180);
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = anglePerSeg > 180 ? 1 : 0;

      const midAngle = ((i * anglePerSeg + anglePerSeg / 2) - 90) * (Math.PI / 180);
      const textX = cx + (r * 0.65) * Math.cos(midAngle);
      const textY = cy + (r * 0.65) * Math.sin(midAngle);
      const textRotate = i * anglePerSeg + anglePerSeg / 2;

      return (
        <g key={i}>
          <path
            d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
            fill={seg.color}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />
          <text
            x={textX}
            y={textY}
            fill="white"
            fontSize="18"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${textRotate}, ${textX}, ${textY})`}
          >
            {seg.label}
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

      {!user?.firstPurchaseCompleted && (
        <div className="ruleta-info">
          <AlertCircle size={24} />
          <div>
            <h3>¡Aún no has realizado tu primera compra!</h3>
            <p>Completa tu primera compra para desbloquear la ruleta de descuentos.</p>
          </div>
        </div>
      )}

      {user?.wheelSpun && !result && (
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
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          }}
        >
          {renderWheel()}
          <circle cx="200" cy="200" r="30" fill="#1a1a2e" stroke="white" strokeWidth="3" />
          <text x="200" y="200" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
            GIRA
          </text>
        </svg>
      </div>

      {!result && (
        <button
          className={`ruleta-spin-btn ${(!canSpin || spinning) ? 'disabled' : ''}`}
          onClick={handleSpin}
          disabled={!canSpin || spinning}
        >
          <RotateCcw size={20} className={spinning ? 'spinning-icon' : ''} />
          {spinning ? 'Girando...' : 'Girar Ruleta'}
        </button>
      )}

      {result && (
        <div className="ruleta-result">
          <PartyPopper size={48} />
          <h2>¡Felicidades! 🎉</h2>
          <p className="result-discount">Has ganado un <strong>{result.descuentoPorcentaje}%</strong> de descuento</p>
          <div className="result-coupon">
            <span className="coupon-code">{result.codigo}</span>
            <button className="copy-btn" onClick={handleCopy}>
              {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <p className="result-expiry">
            Válido hasta: {new Date(result.validoHasta).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
