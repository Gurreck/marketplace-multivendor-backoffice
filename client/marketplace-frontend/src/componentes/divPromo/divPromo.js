import React, { useState, useEffect } from 'react';
import './divPromo.css';
import { Zap, Sparkles } from 'lucide-react';

export default function DivPromo({ products, handlePromoAddToCart }) {
    const [promoProducts, setPromoProducts] = useState([]);

    useEffect(() => {
        if (!products || products.length === 0) return;

        const getRandomProducts = () => {
            const temp = [...products];
            for (let i = temp.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [temp[i], temp[j]] = [temp[j], temp[i]];
            }
            return temp.slice(0, 2);
        };

        setPromoProducts(getRandomProducts());

        const interval = setInterval(() => {
            setPromoProducts(getRandomProducts());
        }, 15000); // Rotar cada 15 seg para dinamismo

        return () => clearInterval(interval);
    }, [products]);

    if (promoProducts.length === 0) return null;

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
