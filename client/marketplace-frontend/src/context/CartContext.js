import React, { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Cargar carrito desde localStorage al inicio
  useEffect(() => {
    const storedCart = localStorage.getItem("marketplace_cart");
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  // Guardar en localStorage cada vez que cambia
  useEffect(() => {
    localStorage.setItem("marketplace_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Helper para obtener el ID real del producto (soporta _id de MongoDB e id)
  const getProductId = (product) => product._id || product.id;

  const addToCart = (product) => {
    const productId = getProductId(product);
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => getProductId(item) === productId);
      if (existingItem) {
        // Si ya existe, aumentar cantidad
        return prevItems.map((item) =>
          getProductId(item) === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        // Si no existe, agregar con cantidad 1 y normalizar el id
        return [...prevItems, { ...product, id: productId, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => getProductId(item) !== productId),
    );
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        getProductId(item) === productId ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Calcular total de items (para el badge)
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Calcular precio total
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