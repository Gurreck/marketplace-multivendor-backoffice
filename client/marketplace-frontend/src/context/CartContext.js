import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import cartService from "../services/cartService";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();

  // Helper para obtener el ID real del producto (soporta _id de MongoDB e id)
  const getProductId = (product) => product.product?._id || product.product?.id || product._id || product.id;

  // Cargar carrito desde localStorage o backend
  useEffect(() => {
  const loadCart = async () => {
    // Usuario no autenticado: usar localStorage
    if (!token || !user) {
      const storedCart = localStorage.getItem("marketplace_cart");

      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      } else {
        setCartItems([]);
      }

      return;
    }

    // Usuario autenticado: cargar desde backend
    try {
      setLoading(true);
      const response = await cartService.getCart();
      let backendItems = response.data.items || [];

      // Si el backend está vacío pero hay items en localStorage, sincronizar
      if (backendItems.length === 0) {
        const storedCart = localStorage.getItem("marketplace_cart");

        if (storedCart) {
          const localItems = JSON.parse(storedCart);

          if (localItems.length > 0) {
            for (const item of localItems) {
              try {
                await cartService.addToCart(
                  item.product || item.id || item._id,
                  item.quantity
                );
              } catch (error) {
                console.error("Error syncing local cart item:", error);
              }
            }

            const updatedResponse = await cartService.getCart();
            backendItems = updatedResponse.data.items || [];

            localStorage.removeItem("marketplace_cart");
          }
        }
      }

      setCartItems(backendItems);
    } catch (error) {
      console.error("Error loading cart from backend:", error);

      // Fallback a localStorage
      const storedCart = localStorage.getItem("marketplace_cart");

      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      } else {
        setCartItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  loadCart();
}, [token, user]);

  // Guardar en localStorage cuando cambia (solo si no está autenticado)
  useEffect(() => {
    if (!token || !user) {
      localStorage.setItem("marketplace_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, token, user]);

  const addToCart = async (product) => {
    const productId = getProductId(product);

    if (token && user) {
      // Usuario autenticado: usar backend
      try {
        setLoading(true);
        const response = await cartService.addToCart(productId, 1);
        setCartItems(response.data.items);
      } catch (error) {
        console.error("Error adding to cart:", error);
        // Fallback: agregar localmente
        setCartItems((prevItems) => {
          const existingItem = prevItems.find((item) => getProductId(item) === productId);
          if (existingItem) {
            return prevItems.map((item) =>
              getProductId(item) === productId
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            );
          } else {
            return [...prevItems, { ...product, id: productId, quantity: 1 }];
          }
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Usuario no autenticado: usar localStorage
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => getProductId(item) === productId);
        if (existingItem) {
          return prevItems.map((item) =>
            getProductId(item) === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
        } else {
          return [...prevItems, { ...product, id: productId, quantity: 1 }];
        }
      });
    }
  };

  const removeFromCart = async (productId) => {
    if (token && user) {
      // Usuario autenticado: usar backend
      try {
        setLoading(true);
        const response = await cartService.removeFromCart(productId);
        setCartItems(response.data.items);
      } catch (error) {
        console.error("Error removing from cart:", error);
        // Fallback: remover localmente
        setCartItems((prevItems) =>
          prevItems.filter((item) => getProductId(item) !== productId),
        );
      } finally {
        setLoading(false);
      }
    } else {
      // Usuario no autenticado: usar localStorage
      setCartItems((prevItems) =>
        prevItems.filter((item) => getProductId(item) !== productId),
      );
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    if (token && user) {
      // Usuario autenticado: usar backend
      try {
        setLoading(true);
        const response = await cartService.updateCartItem(productId, newQuantity);
        setCartItems(response.data.items);
      } catch (error) {
        console.error("Error updating cart:", error);
        // Fallback: actualizar localmente
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            getProductId(item) === productId ? { ...item, quantity: newQuantity } : item,
          ),
        );
      } finally {
        setLoading(false);
      }
    } else {
      // Usuario no autenticado: usar localStorage
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          getProductId(item) === productId ? { ...item, quantity: newQuantity } : item,
        ),
      );
    }
  };

  const clearCart = async () => {
    if (token && user) {
      // Usuario autenticado: usar backend
      try {
        setLoading(true);
        await cartService.clearCart();
        setCartItems([]);
      } catch (error) {
        console.error("Error clearing cart:", error);
        // Fallback: limpiar localmente
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    } else {
      // Usuario no autenticado: usar localStorage
      setCartItems([]);
    }
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
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};