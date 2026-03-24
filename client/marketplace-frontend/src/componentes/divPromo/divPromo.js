import React, { useState, useEffect } from 'react';
import './divPromo.css';
import { Zap, Sparkles } from 'lucide-react';

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

    useEffect(() => {
        // Si no hay productos, no iniciar el intervalo
        if (!products || products.length === 0) return;

        /**
         * Selecciona 2 productos aleatorios de la lista general
         */
        const getRandomProducts = () => {
            const temp = [...products];
            for (let i = temp.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [temp[i], temp[j]] = [temp[j], temp[i]];
            }
            return temp.slice(0, 2);
        };

        // Inicializar con productos aleatorios
        setPromoProducts(getRandomProducts());

        // Establecer el intervalo de cambio
        const interval = setInterval(() => {
            setPromoProducts(getRandomProducts());
        }, 15000); // Rotar cada 15 seg para dinamismo

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
                    <div className="etiqueta-viva">
                        <Zap size={14} fill="currentColor" />
                        <span>OFERTAS EN VIVO</span>
                    </div>
                    <h2 className="titulo-promo">
                        Tecnología que <span className="resaltado">Impacta</span>
                        <Sparkles size={20} className="icono-chispa" />
                    </h2>
                </div>

                <div className="lado-productos-promo">
                    {promoProducts.map((product) => (
                            <div 
                                key={product._id} 
                                className="mini-tarjeta-promo pulsable"
                                onClick={() => handlePromoAddToCart(product)}
                                title={`Agregar ${product.name} (Oferta)`}
                            >
                                <div className="etiqueta-descuento-mini">-30%</div>
                                <div className="imagen-mini-tarjeta">
                                    <img src={product.images[0]?.url || "https://via.placeholder.com/80"} alt={product.name} />
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
