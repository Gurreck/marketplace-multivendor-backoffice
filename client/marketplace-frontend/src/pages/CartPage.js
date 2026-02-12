import React from "react";
import PublicLayout from "../components/PublicLayout";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import orderService from "../services/orderService"; // Assuming this path for orderService

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } =
    useCart();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    try {
      const orderData = {
        orderItems: cartItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          image: item.images?.[0] || "",
          price: item.price,
          product: item._id,
          vendor: item.vendor?._id || item.vendor,
        })),
        shippingAddress: {
          address: "Dirección de prueba 123",
          city: "Ciudad",
          country: "País",
        },
        paymentMethod: "Tarjeta de Crédito",
        itemsPrice: cartTotal,
        taxPrice: cartTotal * 0.15,
        shippingPrice: 10,
        totalPrice: cartTotal * 1.15 + 10,
      };

      const data = await orderService.createOrder(orderData);
      if (data.success) {
        alert("¡Pedido realizado con éxito!");
        clearCart();
        navigate("/orders");
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Error al procesar el pedido. Asegúrate de estar autenticado.",
      );
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  return (
    <PublicLayout>
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
                  onClick={handleCheckout}
                >
                  Proceder al Pago
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default CartPage;
