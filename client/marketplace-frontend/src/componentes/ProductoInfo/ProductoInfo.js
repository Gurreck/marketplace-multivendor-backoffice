import React from 'react';
import './ProductoInfo.css';
import { Tag, User, Plus } from 'lucide-react';
import '../VistaProducto/VistaProducto.css';

/**
 * Componente que muestra la información del producto: nombre, descripción,
 * categoría, vendedor, precio, stock y botón de agregar al carrito.
 */
export default function ProductoInfo({
    product,
    onAddToCart,
    onShowVendorModal
}) {
    return (
        <div className="seccion-informacion">
            <h1 className="nombre-producto">{product.name}</h1>

            <div className="caja-descripcion">
                <h3>Descripción</h3>
                <p>{product.description}</p>
            </div>

            <div className="etiqueta-categoria">
                <Tag size={16} style={{ marginRight: '8px' }} />
                Categoría: <strong>{product.category}</strong>
            </div>

            <div className="meta-producto">
                <div 
                    className="vendedor" 
                    style={{ 
                        cursor: "pointer", color: "var(--color-primario)", 
                        padding: "4px 8px", borderRadius: "8px", 
                        background: "rgba(0,148,255,0.05)", 
                        display: "inline-flex", alignItems: "center", 
                        border: "1px solid rgba(0,148,255,0.1)" 
                    }}
                    onClick={onShowVendorModal}
                    title="Ver perfil del vendedor"
                >
                    <User size={16} style={{ marginRight: '8px' }} color="#0094FF" />
                    Vendedor: <strong style={{ marginLeft: "4px" }}>
                        {product.vendor?.nombre || product.vendor}
                    </strong>
                </div>
            </div>

            <div className="etiqueta-precio">
                <span className="precio-producto"> ₡ {product.price.toLocaleString()}</span>
            </div>

            {/* Stock Indicator */}
            {product.stock !== undefined && (
                <div style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '12px',
                    ...(product.stock <= 5
                        ? { background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }
                        : product.stock <= 20
                        ? { background: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }
                        : { background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' })
                }}>
                    {product.stock <= 5
                        ? `¡Solo quedan ${product.stock} unidades! 🔥`
                        : product.stock <= 20
                        ? `${product.stock} unidades disponibles`
                        : `En stock (${product.stock} disponibles)`}
                </div>
            )}

            <div className="botones-accion">
                <button className="boton-agregar-carrito" onClick={onAddToCart}>
                    <Plus size={20} style={{ marginRight: '10px' }} />
                    Agregar al Carrito
                </button>
            </div>
        </div>
    );
}

