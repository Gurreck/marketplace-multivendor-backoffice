import React, { useState, useEffect } from 'react';
import './divPromo.css';

export default function DivPromo({ products, handlePromoAddToCart }) {
    const [promoProducts, setPromoProducts] = useState([]);

    // Lógica para rotar productos de promoción cada 30 segundos
    useEffect(() => {
        if (!products || products.length === 0) return;

        const getRandomProducts = () => {
            const shuffled = [...products].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, 2);
        };

        setPromoProducts(getRandomProducts());

        const interval = setInterval(() => {
            setPromoProducts(getRandomProducts());
        }, 30000);

        return () => clearInterval(interval);
    }, [products]);

    if (promoProducts.length === 0) return null;

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
                    {promoProducts.map((product, index) => (
                            <div 
                                key={product._id} 
                                className="mini-tarjeta-promo pulsable"
                                onClick={() => handlePromoAddToCart(product)}
                            >
                                <div className="imagen-mini-tarjeta">
                                    <img src={product.images[0]} alt={product.name} />
                                </div>
                                <div className="pie-mini-tarjeta">
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
