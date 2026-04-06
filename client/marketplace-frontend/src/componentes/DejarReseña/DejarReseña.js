import React, { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, X, Send, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { commentService } from '../../services/commentService';
import './DejarReseña.css';

/**
 * Componente DejarReseña
 * Modal premium para que los usuarios califiquen productos y dejen comentarios.
 */
const DejarReseña = ({ isOpen, onClose, onSubmit, product = null, isEmbedded = false }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorLocal, setErrorLocal] = useState("");
  
  const [hasReviewed, setHasReviewed] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Intentar extraer el ID de la forma más robusta posible
  const getProductId = useCallback(() => {
    if (!product) return null;
    if (typeof product === 'string') return product;
    return product._id || product.id || product.productId || (product.product && (product.product._id || product.product.id || product.product));
  }, [product]);

  const productId = getProductId();

  // Función para verificar si ya existe una reseña
  const checkStatus = useCallback(async () => {
    if (!productId) return;
    
    try {
      setLoadingStatus(true);
      const response = await commentService.checkUserReviewStatus(productId);
      if (response.data && response.data.success) {
        setHasReviewed(response.data.hasReviewed);
      }
    } catch (err) {
      console.error("Error al verificar estado de reseña:", err);
    } finally {
      setLoadingStatus(false);
    }
  }, [productId]);

  // Verificar estado al montar o abrir
  useEffect(() => {
    if (isOpen || isEmbedded) {
      checkStatus();
      
      if (!isSent) {
          setRating(0);
          setComment("");
          setErrorLocal("");
      }
    }
  }, [isOpen, isEmbedded, isSent, checkStatus]);

  if (!isEmbedded && !isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;
    setErrorLocal("");
    setIsSubmitting(true);

    try {
      if (onSubmit) {
        // Esperar a que el padre complete la operación
        await onSubmit({ 
            rating, 
            text: comment, // El backend espera 'text'
            productId: productId 
        });
      }
      setIsSent(true);
      setIsSubmitting(false);
      setHasReviewed(true); // Actualizar estado local

      // Si es un modal, lo cerramos automáticamente después de 2 segundos
      if (!isEmbedded && onClose) {
        setTimeout(onClose, 2000);
      }
    } catch (err) {
      console.error("Error al enviar reseña:", err);
      // Si el error es un 400 (duplicado), actualizamos hasReviewed
      if (err.response?.status === 400) {
        setHasReviewed(true);
        setErrorLocal("Ya has dejado una reseña para este producto.");
      } else {
        setErrorLocal("No se pudo enviar la reseña. Inténtalo de nuevo.");
      }
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (val) => {
    setRating(val);
  };

  const currentDisplayRating = hoverRating || rating;

  const renderContent = () => (
    <div className={isEmbedded ? "reseña-contenido-embebido" : "modal-reseña-contenedor"}>
      {loadingStatus ? (
        <div className="cargando-estado-reseña">
          <Loader2 className="animacion-giro" size={30} color="var(--nexora-cyan)" />
          <p>Verificando estado...</p>
        </div>
      ) : isSent ? (
        <div className="mensaje-exito-reseña">
          <CheckCircle2 size={50} color="var(--nexora-cyan)" />
          <h3>¡Muchas gracias!</h3>
          <p>Tu opinión ha sido guardada. Ayudará a otros usuarios en sus compras.</p>
        </div>
      ) : hasReviewed ? (
        <div className="ya-reseñado-contenedor">
          <Info size={40} color="var(--nexora-blue)" />
          <h3>Ya dejaste una reseña</h3>
          <p>Solo se permite una opinión por producto comprado. ¡Gracias por compartir tu experiencia con nosotros!</p>
          {!isEmbedded && (
            <button className="btn-reseña btn-enviar full-width" onClick={onClose} style={{ marginTop: '1rem' }}>
              Entendido
            </button>
          )}
        </div>
      ) : (
        <>
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
            {errorLocal && <div className="mensaje-error-reseña">{errorLocal}</div>}
            
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
        </>
      )}
    </div>
  );

  if (isEmbedded) return renderContent();

  return (
    <div className="modal-reseña-overlay" onClick={(e) => e.target.className === 'modal-reseña-overlay' && onClose && onClose()}>
      {renderContent()}
    </div>
  );
};

export default DejarReseña;
