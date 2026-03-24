import React, { useState, useEffect } from 'react';
import './divPromo.css';

/**
 * Componente DivPromo
 * Muestra una sección transversal con productos en oferta que rotan aleatoriamente.
 * 
 * @param {Array} products - Lista de todos los productos disponibles
 * @param {function} handlePromoAddToCart - Función para manejar el clic en un producto en oferta
 */
export default function DivPromo({ products, handlePromoAddToCart }) {
    // ===== ESTADO =====
    const [promoProducts, setPromoProducts] = useState([]); // Productos seleccionados para mostrar en la promo

    // ===== EFECTOS =====
    /**
     * Lógica para rotar productos de promoción cada 30 segundos
     */
    useEffect(() => {
        // Si no hay productos, no iniciar el intervalo
        if (!products || products.length === 0) return;

        /**
         * Selecciona 2 productos aleatorios de la lista general
         */
        const getRandomProducts = () => {
            const shuffled = [...products].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, 2);
        };

        // Inicializar con productos aleatorios
        setPromoProducts(getRandomProducts());

        // Establecer el intervalo de cambio
        const interval = setInterval(() => {
            setPromoProducts(getRandomProducts());
        }, 30000);

        // Limpiar el intervalo al desmontar el componente
        return () => clearInterval(interval);
    }, [products]);

    // Si no hay productos promocionales, no mostrar nada
    if (promoProducts.length === 0) return null;

    // ===== RENDERIZADO =====
    return (
        <div className="transversal-promociones">
            <div className="contenido-promocional">
                <div className="lado-texto-promo">
                    <span className="subtitulo-promo">OFERTAS DE TEMPORADA</span>
                    <h2 className="titulo-promo">
                        Tecnología que <span className="resaltado">Impacta</span>
                    </h2>
                </div>

                <div className="lado-productos-promo">
                    {/* Lista de productos destacados */}
                    {promoProducts.map((product) => (
                            <div 
                                key={product._id} 
                                className="mini-tarjeta-promo pulsable"
                                onClick={() => handlePromoAddToCart(product)}
                                title={`Agregar ${product.name} al carrito`}
                            >
                                <div className="imagen-mini-tarjeta">
                                    <img src={product.images[0]} alt={product.name} />
                                </div>
                                <div className="pie-mini-tarjeta">
                                    {/* Precio original calculado un 40% más alto para simular descuento */}
                                    <span className="precio-original-mini">₡{(product.price * 1.4).toLocaleString()}</span>
                                    <span className="precio-mini">₡{product.price.toLocaleString()}</span>
                                </div>
                            </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
