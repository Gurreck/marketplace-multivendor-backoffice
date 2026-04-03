import React, { useState, useEffect } from 'react';
import { Star, Loader, Trash2, Calendar } from 'lucide-react';
import api from '../../services/api';
import './MisReseñas.css';
import { Link } from 'react-router-dom';

export default function MisReseñas() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await api.get('/comments/user');
                if (response.data.success) {
                    setReviews(response.data.data);
                }
            } catch (error) {
                console.error("Error al cargar reseñas:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta reseña?")) return;
        
        try {
            const response = await api.delete(`/comments/${id}`);
            if (response.data.success) {
                setReviews(reviews.filter(r => r._id !== id));
            }
        } catch (error) {
            console.error("Error al eliminar reseña:", error);
            alert("No se pudo eliminar la reseña.");
        }
    };

    if (loading) {
        return (
            <div className="mis-resenas-loading">
                <Loader className="lucide-spin" size={32} />
                <p>Cargando tu historial de reseñas...</p>
            </div>
        );
    }

    return (
        <div className="mis-resenas-container">
            <h2 className="titulo-seccion">Mis Reseñas</h2>
            <p className="subtitulo-seccion">Historial de las valoraciones y comentarios que has dejado en los productos.</p>
            
            {reviews.length === 0 ? (
                <div className="mis-resenas-vacio">
                    <Star size={48} color="rgba(255,255,255,0.2)" />
                    <p>Aún no has dejado ninguna reseña.</p>
                </div>
            ) : (
                <div className="resenas-grid">
                    {reviews.map(review => (
                        <div key={review._id} className="resena-card">
                            <div className="resena-header">
                                <div className="resena-producto">
                                    <img src={review.product?.images?.[0]?.url || "https://via.placeholder.com/60"} alt={review.product?.name} />
                                    <div>
                                        <Link to={`/product/${review.product?._id}`}>{review.product?.name}</Link>
                                        <span className="resena-fecha"><Calendar size={12}/> {new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <button className="btn-eliminar-resena" onClick={() => handleDelete(review._id)} title="Eliminar reseña">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            
                            <div className="resena-estrellas">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        size={18} 
                                        fill={i < review.rating ? "#fbbf24" : "transparent"} 
                                        color={i < review.rating ? "#fbbf24" : "var(--text-muted)"} 
                                    />
                                ))}
                            </div>
                            
                            <p className="resena-texto">{review.text}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
