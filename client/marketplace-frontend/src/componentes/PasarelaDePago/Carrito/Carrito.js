import React, { useState, useEffect } from "react";
import "./Carrito.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";
import { useTheme } from "../../../context/ThemeContext";
import { commentService } from "../../../services/commentService";
import NavbarSecundario from "../../NavbarSecundario/NavbarSecundario";
import Productos from "./Productos";
import Resumen from "./Resumen";
import {
  CheckCircle2,
  ShoppingBag
} from "lucide-react";

const getItemId = (item) => item.product?._id || item.product?.id || item._id || item.id;

const Carrito = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, cartCount } = useCart();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const [productComments, setProductComments] = useState({});
  const [loadingComments, setLoadingComments] = useState(true);
  const [paymentSuccess] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});

  useEffect(() => {
    const initial = {};
    cartItems.forEach((item) => {
      initial[getItemId(item)] = true;
    });
    setSelectedItems(initial);
  }, [cartItems]);

  const fetchProductComments = async (productId) => {
    try {
      const response = await commentService.getCommentsByProduct(productId);
      if (response.data.success) {
        return {
          averageRating: response.data.averageRating,
          count: response.data.count,
        };
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
    return { averageRating: 0, count: 0 };
  };

  useEffect(() => {
    const loadAllComments = async () => {
      if (cartItems.length === 0) {
        setLoadingComments(false);
        return;
      }

      setLoadingComments(true);
      const commentsData = {};

      for (const item of cartItems) {
        const productId = getItemId(item);
        commentsData[productId] = await fetchProductComments(productId);
      }

      setProductComments(commentsData);
      setLoadingComments(false);
    };

    loadAllComments();
  }, [cartItems]);

  const selectedCount = cartItems.filter(
    (item) => selectedItems[getItemId(item)],
  ).length;
  const isAllSelected =
    cartItems.length > 0 && selectedCount === cartItems.length;

  const selectedSubtotal = cartItems.reduce((acc, item) => {
    return selectedItems[getItemId(item)]
      ? acc + item.price * item.quantity
      : acc;
  }, 0);

  const toggleSelection = (id) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems({});
    } else {
      const allSelected = {};
      cartItems.forEach((item) => {
        allSelected[getItemId(item)] = true;
      });
      setSelectedItems(allSelected);
    }
  };

  const handleRemove = (id) => {
    removeFromCart(id);
    const newSelected = { ...selectedItems };
    delete newSelected[id];
    setSelectedItems(newSelected);
  };

  const handleProceedToPayment = () => {
    if (selectedCount === 0) {
      alert("Por favor selecciona al menos un producto");
      return;
    }

    const selectedCartItems = cartItems.filter(
      (item) => selectedItems[getItemId(item)],
    );

    navigate("/pasarela-pago", {
      state: {
        selectedItems: selectedCartItems,
        selectedSubtotal: selectedSubtotal,
        selectedCount: selectedCount,
      },
    });
  };

  // ===== RENDERIZADOS DE ESTADO =====

  if (paymentSuccess) {
    return (
      <div className="contenedor-pago vista-exito">
        <div className="tarjeta-exito">
          <div className="icono-exito">
            <CheckCircle2 size={60} color="#10b981" />
          </div>
          <h1>¡Pedido Realizado!</h1>
          <p>Gracias por tu compra. Te contactaremos pronto.</p>
          <button className="boton-volver-inicio" onClick={() => navigate("/")}>
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="contenedor-pago vista-vacia">
        <div className="tarjeta-vacia">
          <ShoppingBag
            size={60}
            opacity={0.3}
            style={{ marginBottom: "20px" }}
          />
          <h1>Tu carrito está vacío</h1>
          <p>Agrega productos para comenzar tu compra.</p>
          <button className="boton-volver-inicio" onClick={() => navigate("/")}>
            Explorar productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`barra-navegacion-secundaria ${!isDarkMode ? "modo-claro" : ""}`}>
        <NavbarSecundario
          toggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
          user={user}
          logout={logout}
          cartCount={cartCount}
        />
      </div>

      <div className={`contenedor-pago ${!isDarkMode ? "modo-claro" : ""}`}>
        <div className="contenido-principal-pago">
          <Productos 
            cartItems={cartItems}
            selectedItems={selectedItems}
            toggleSelection={toggleSelection}
            toggleSelectAll={toggleSelectAll}
            isAllSelected={isAllSelected}
            handleRemove={handleRemove}
            updateQuantity={updateQuantity}
            loadingComments={loadingComments}
            productComments={productComments}
            getItemId={getItemId}
          />

          <Resumen 
            selectedSubtotal={selectedSubtotal}
            selectedCount={selectedCount}
            handleProceedToPayment={handleProceedToPayment}
          />
        </div>
      </div>
    </>
  );
};

export default Carrito;
