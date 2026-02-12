import React from "react";
import { useCart } from "../context/CartContext";
// import "./ProductCard.css"; // Reuse App.css or specific

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="card product-card glass-effect hover-scale">
      <div className="product-image-container">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="product-image"
          />
        ) : (
          <div className="no-image-placeholder">Sin Imagen</div>
        )}
        <div className="product-category-badge">{product.category}</div>
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">${product.price.toFixed(2)}</p>
        <p className="product-vendor">
          Vendido por: {product.vendor?.nombre || "Marketplace"}
        </p>

        <button
          className="btn btn-primary btn-block mt-2"
          onClick={() => addToCart(product)}
          disabled={product.stock <= 0}
        >
          {product.stock > 0 ? "Agregar al Carrito" : "Agotado"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
