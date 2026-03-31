import React from 'react';
import { Star, User } from 'lucide-react';
import './Reseña.css';

/**
 * Componente Reseña (Individual)
 * Muestra la calificación, comentario y datos del usuario de forma elegante.
 * 
 * @param {string} user - Nombre del usuario que deja la reseña
 * @param {number} rating - Calificación de 1 a 5
 * @param {string} comment - Texto del comentario
 * @param {string} date - Fecha de publicación
 */
const Reseña = ({ user = "Usuario Nexora", rating = 5, comment, date = "Reciente" }) => {
  // Generar la inicial para el avatar
  const inicial = user.charAt(0).toUpperCase();

  return (
    <div className="contenedor-reseña">
      
      {/* Encabezado: Información del Usuario */}
      <div className="usuario-info-reseña">
        <div className="avatar-reseña">
          {inicial || <User size={20} />}
        </div>
        <div className="detalles-usuario-reseña">
          <span className="nombre-usuario-reseña">{user}</span>
          <span className="fecha-reseña">{date}</span>
        </div>
      </div>

      {/* Cuerpo: Estrellas y Comentario */}
      <div className="cuerpo-reseña">
        <div className="estrellas-reseña">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star}
              size={16}
              fill={star <= rating ? "var(--nexora-cyan)" : "transparent"}
              color={star <= rating ? "var(--nexora-cyan)" : "rgba(148, 163, 184, 0.3)"}
              strokeWidth={1.5}
            />
          ))}
        </div>
        {comment && (
          <p className="texto-reseña">"{comment}"</p>
        )}
      </div>

    </div>
  );
};

export default Reseña;
