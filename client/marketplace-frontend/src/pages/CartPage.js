import React from "react";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } =
    useCart();

  return (
    <div className="public-layout">
      <Navbar />

      <div className="container mt-4">
        <div className="card glass-effect cart-container">
          <div className="card-header">
            <h2>Carrito de Compras</h2>
            {cartItems.length > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={clearCart}>
                Vaciar Carrito
              </button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <h3>Tu carrito está vacío</h3>
              <Link to="/" className="btn btn-primary mt-3">
                Ir a Comprar
              </Link>
            </div>
          ) : (
            <div className="cart-content">
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item._id} className="cart-item">
                    <div className="item-image">
                      {item.images && item.images.length > 0 ? (
                        <img src={item.images[0]} alt={item.name} />
                      ) : (
                        <div className="no-image">Sin Img</div>
                      )}
                    </div>
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p className="text-muted">
                        Unitario: ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="item-quantity">
                      <button
                        className="btn-icon"
                        onClick={() =>
                          updateQuantity(item._id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className="btn-icon"
                        onClick={() =>
                          updateQuantity(item._id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.stock}
                      >
                        +
                      </button>
                    </div>
                    <div className="item-total">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button
                      className="btn-icon delete"
                      onClick={() => removeFromCart(item._id)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <button
                  className="btn btn-primary btn-block btn-lg mt-3"
                  onClick={() =>
                    alert("¡Checkout simulado! Gracias por tu compra.")
                  }
                >
                  Proceder al Pago
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
