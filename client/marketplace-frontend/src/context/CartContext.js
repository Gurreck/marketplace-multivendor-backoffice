import React, { createContext, useState, useContext, useEffect } from "react";
import cartService from "../services/cartService";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { isAuthenticated } = useAuth();

  // Cargar carrito desde localStorage al inicio o desde el servidor si está autenticado
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated) {
        try {
          const data = await cartService.getCart();
          if (data.success && data.data.items.length > 0) {
            // El backend devuelve items as [{product, quantity}]
            const items = data.data.items.map((i) => ({
              ...i.product,
              quantity: i.quantity,
            }));
            setCartItems(items);
            return;
          }
        } catch (error) {
          console.error("Error al cargar carrito del servidor", error);
        }
      }

      // Fallback a localStorage si no hay nada en el servidor o no está autenticado
      const storedCart = localStorage.getItem("marketplace_cart");
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    };

    loadCart();
  }, [isAuthenticated]);

  // Guardar en localStorage y sincronizar con servidor cada vez que cambia
  useEffect(() => {
    localStorage.setItem("marketplace_cart", JSON.stringify(cartItems));

    const syncCart = async () => {
      if (isAuthenticated) {
        try {
          const items = cartItems.map((item) => ({
            product: item._id,
            quantity: item.quantity,
          }));
          await cartService.updateCart(items);
        } catch (error) {
          console.error("Error al sincronizar carrito con el servidor", error);
        }
      }
    };

    syncCart();
  }, [cartItems, isAuthenticated]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === product._id);
      if (existingItem) {
        return prevItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item._id !== productId),
    );
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const clearCart = () => {
    setCartItems([]);
    if (isAuthenticated) {
      cartService.clearCart();
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const cartTotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
