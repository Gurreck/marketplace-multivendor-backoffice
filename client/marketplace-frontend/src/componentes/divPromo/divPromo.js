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
        <section className="promo-banner">
            <div className="promo-content">
                <div className="promo-text-side">
                    <p className="promo-subtitle">— Bueno, Bonito, Barato —</p>
                    <h2 className="promo-title">HASTA <span className="highlight">10% EN PRODUCTOS</span></h2>
                </div>

                <div className="promo-products-side">
                    {promoProducts.map((product, index) => (
                        <div
                            key={`${product._id || product.id}-${index}`}
                            className="promo-mini-card clickeable"
                            onClick={() => handlePromoAddToCart(product)}
                        >
                            <div className="mini-card-image">
                                <img src={product.images[0]} alt={product.name} />
                            </div>
                            <div className="mini-card-footer">
                                <span className="mini-price-original">₡ {product.price.toLocaleString()}</span>
                                <span className="mini-price">₡ {Math.floor(product.price * 0.90).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
