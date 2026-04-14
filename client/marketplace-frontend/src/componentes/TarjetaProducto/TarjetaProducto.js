import React from 'react';
import './TarjetaProducto.css';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

/**
 * TarjetaProducto
 * Render card for a single product in the catalog grid.
 */
export default function TarjetaProducto({ product, onAddToCart, onNoStock }) {
    const navigate = useNavigate();
    const productId = product._id || product.id;

    return (
        <div className="tarjeta-producto">
            {/* Imagen y Vendedor */}
            <div
                className="imagen-producto"
                onClick={() => navigate(`/product/${productId}`)}
                style={{ cursor: 'pointer' }}
            >
                <img
                    src={product.images[0]?.url || "https://via.placeholder.com/300"}
                    alt={product.name}
                    className="imagen-real-producto"
                />
                <div className="etiqueta-producto">
                    {product.vendor?.nombre || product.vendor}
                </div>
            </div>

            {/* Detalle y Acción */}
            <div className="informacion-producto">
                <h3
                    className="nombre-producto"
                    onClick={() => navigate(`/product/${productId}`)}
                    style={{ cursor: 'pointer' }}
                >
                    {product.name}
                </h3>
                <p className="descripcion-corta-producto">
                    {product.description?.substring(0, 60)}...
                </p>
                <p className="vendedor-producto">
                    Vendedor: {product.vendor?.nombre || product.vendor}
                </p>

                <div className="pie-producto">
                    <span className="precio-producto">
                        ₡{product.price.toLocaleString()}
                    </span>
                    {product.stock > 0 ? (
                        <button
                            className="boton-agregar"
                            onClick={() => onAddToCart(product)}
                        >
                            <Plus size={16} />
                            Agregar
                        </button>
                    ) : (
                        <button
                            className="boton-agregar sin-stock"
                            onClick={() => onNoStock()}
                        >
                            Sin stock
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

