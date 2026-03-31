import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, X, Send } from 'lucide-react';
import './DejarReseña.css';

/**
 * Componente DejarReseña
 * Modal premium para que los usuarios califiquen productos y dejen comentarios.
 * 
 * @param {boolean} isOpen - Controla la visibilidad del modal (no necesario si isEmbedded es true)
 * @param {function} onClose - Función para cerrar el modal
 * @param {function} onSubmit - Función que se ejecuta al enviar la reseña
 * @param {object} product - Datos del producto (opcional, para personalizar el mensaje)
 * @param {boolean} isEmbedded - Si es true, se muestra como un div fijo, no como modal
 */
const DejarReseña = ({ isOpen, onClose, onSubmit, product = null, isEmbedded = false }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reiniciar estado cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setComment("");
    }
  }, [isOpen]);

  if (!isEmbedded && !isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    // Simulación de envío a API
    setTimeout(() => {
      if (onSubmit) {
        onSubmit({ rating, comment, productId: product?._id });
      }
      setIsSubmitting(false);
      onClose();
    }, 1500);
  };

  const handleRatingClick = (val) => {
    setRating(val);
  };

  const currentDisplayRating = hoverRating || rating;

  const renderContent = () => (
    <div className={isEmbedded ? "reseña-contenido-embebido" : "modal-reseña-contenedor"}>
      
      {/* Cabecera */}
      <div className="header-reseña">
        <h2>{isEmbedded ? "Valorar Producto" : "¿Qué te pareció tu compra?"}</h2>
        <p>Tu opinión nos ayuda a mejorar la experiencia Nexora</p>
        {!isEmbedded && (
          <button className="btn-cerrar-modal" onClick={onClose} aria-label="Cerrar">
             <X size={20} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Calificación por Estrellas */}
        <div className={`estrellas-selector ${isEmbedded ? 'embebido' : ''}`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`estrella-btn ${star <= currentDisplayRating ? 'activa' : ''}`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleRatingClick(star)}
            >
              <Star 
                size={isEmbedded ? 32 : 42} 
                fill={star <= currentDisplayRating ? "var(--nexora-cyan)" : "transparent"} 
                color={star <= currentDisplayRating ? "var(--nexora-cyan)" : "rgba(148, 163, 184, 0.3)"}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem', opacity: rating > 0 ? 1 : 0.4 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            {rating === 0 ? "Selecciona una calificación" : 
             rating === 1 ? "No me gustó" : 
             rating === 2 ? "Podría mejorar" : 
             rating === 3 ? "Está bien" : 
             rating === 4 ? "¡Muy bueno!" : "¡Excelente producto!"}
          </span>
        </div>

        {/* Área de Comentario */}
        <div style={{ position: 'relative' }}>
          <MessageSquare 
            size={18} 
            style={{ position: 'absolute', top: '15px', left: '15px', opacity: 0.3, zIndex: 2 }} 
          />
          <textarea
            className="comentario-area"
            placeholder="Escribe tu comentario aquí..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={300}
          />
          <span style={{ 
            position: 'absolute', 
            bottom: '25px', 
            right: '15px', 
            fontSize: '0.7rem', 
            opacity: 0.4,
            zIndex: 2
          }}>
            {comment.length}/300
          </span>
        </div>

        {/* Botones de Acción */}
        <div className="acciones-reseña">
          {!isEmbedded && (
            <button 
              type="button" 
              className="btn-reseña btn-cancelar" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
          )}
          <button 
            type="submit" 
            className={`btn-reseña btn-enviar ${isEmbedded ? 'full-width' : ''}`}
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar Reseña"}
          </button>
        </div>

      </form>
    </div>
  );

  if (isEmbedded) {
    return renderContent();
  }

  return (
    <div className="modal-reseña-overlay" onClick={(e) => e.target.className === 'modal-reseña-overlay' && onClose()}>
      {renderContent()}
    </div>
  );
};

export default DejarReseña;
