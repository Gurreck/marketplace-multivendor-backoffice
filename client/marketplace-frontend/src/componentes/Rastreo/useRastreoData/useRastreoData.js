import { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import api from '../../../services/api';
import socket from '../../../services/socket';
import {
  Package,
  Star,
  Box,
  Shuffle,
  CheckCircle2,
} from 'lucide-react';

// Definición de los pasos del tracking y sus íconos
const PASOS_TRACKING = [
  { nombre: "Pedido", icono: <Package size={20} />, estadoRequerido: "created" },
  { nombre: "Pagado", icono: <Star size={20} />, estadoRequerido: "paid" },
  { nombre: "Empacado", icono: <Box size={20} />, estadoRequerido: "packed" },
  { nombre: "Despachado", icono: <Shuffle size={20} />, estadoRequerido: "shipped" },
  { nombre: "Entregado", icono: <CheckCircle2 size={20} />, estadoRequerido: "delivered" },
];

// Mapeo de estados a etiquetas en español
export const ETIQUETAS_ESTADO = {
  created: "Creada",
  pending: "Pendiente",
  paid: "Pagada",
  packed: "Empacada",
  shipped: "Enviada",
  delivered: "Entregada",
  cancelled: "Cancelada",
  receipt_confirmed: "Recepción Confirmada",
};

// Orden de flujo de estados
const FLUJO_ESTADOS = ["created", "pending", "paid", "packed", "shipped", "delivered", "receipt_confirmed"];

/**
 * Hook que centraliza toda la lógica de datos del componente Rastreo.
 */
export default function useRastreoData({ orden }) {
  const location = useLocation();
  const { id } = useParams();

  const [datosEnvio, setDatosEnvio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarRuleta, setMostrarRuleta] = useState(false);
  const [entregaConfirmada, setEntregaConfirmada] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [errorEntrega, setErrorEntrega] = useState('');

  const cargarDatosTracking = useCallback((ordenParam = null) => {
    const ordenDatos = ordenParam || orden || location.state?.order;

    if (!ordenDatos) {
      setCargando(false);
      return;
    }

    const yaConfirmado = (ordenDatos.statusHistory || []).some(
      (h) => h.estado === 'receipt_confirmed'
    );
    setEntregaConfirmada(yaConfirmado);

    let estadoActual = ordenDatos.status || "created";
    if (yaConfirmado) {
      estadoActual = "receipt_confirmed";
    }

    const indiceEstadoActual = FLUJO_ESTADOS.indexOf(estadoActual);
    const idRastreo = (ordenDatos._id || "NEXORA-ORD").toString().slice(-10).toUpperCase();
    const fechaCreacion = new Date(ordenDatos.createdAt || Date.now());
    const fechaEstimada = new Date(fechaCreacion.getTime() + 5 * 24 * 60 * 60 * 1000);

    const pasos = PASOS_TRACKING.map((paso) => {
      const indicePaso = FLUJO_ESTADOS.indexOf(paso.estadoRequerido);
      return {
        ...paso,
        completado: indicePaso <= indiceEstadoActual,
        activo: indicePaso === indiceEstadoActual,
      };
    });

    const historial = (ordenDatos.statusHistory || [])
      .slice()
      .reverse()
      .map((entrada) => ({
        evento: ETIQUETAS_ESTADO[entrada.estado] || entrada.estado,
        ubicacion: entrada.comentario
          ? (
              entrada.comentario === 'Orden creada'
                ? 'Orden creada'
                : entrada.comentario === 'Cliente confirmó la recepción del paquete'
                ? 'Cliente confirmó la recepción del paquete'
                : `Avanzado a ${ETIQUETAS_ESTADO[entrada.estado] || entrada.estado}`
            )
          : `Avanzado a ${ETIQUETAS_ESTADO[entrada.estado] || entrada.estado}`,
        fecha: new Date(entrada.fecha).toLocaleString('es-ES'),
        usuario: entrada.usuarioQueCambio?.nombre || "",
      }));

    if (historial.length === 0) {
      historial.push({
        evento: "Orden Creada",
        ubicacion: "Plataforma Nexora",
        fecha: fechaCreacion.toLocaleString('es-ES'),
      });
    }

    const destino = ordenDatos.shippingAddress
      ? `${ordenDatos.shippingAddress.ciudad}, ${ordenDatos.shippingAddress.pais || 'CR'}`
      : "San José, Costa Rica";

    setDatosEnvio({
      idRastreo,
      estadoActual: indiceEstadoActual,
      estado: estadoActual,
      transportista: "Logística Express",
      fechaEstimada: fechaEstimada.toLocaleDateString('es-ES', {
        day: 'numeric', month: 'long', year: 'numeric'
      }),
      destino,
      origen: "Centro de Distribución Nexora",
      pasos,
      historial,
      ordenOriginal: ordenDatos,
    });

    setCargando(false);
  }, [orden, location.state]);

  useEffect(() => {
    const cargarOrdenInicial = async () => {
      try {
        setCargando(true);
        const ordenDatos = orden || location.state?.order;
        if (ordenDatos) {
          cargarDatosTracking(ordenDatos);
          return;
        }
        if (!id) {
          setCargando(false);
          return;
        }
        const response = await api.get(`/orders/${id}`);
        cargarDatosTracking(response.data.data);
      } catch (error) {
        console.error("Error cargando orden inicial:", error);
        setCargando(false);
      }
    };
    cargarOrdenInicial();
  }, [orden, location.state, id, cargarDatosTracking]);

  // Socket real-time
  useEffect(() => {
    const roomId = datosEnvio?.ordenOriginal?._id || id;
    if (!roomId) return;

    socket.emit("joinOrderRoom", roomId.toString());
    const handleOrderStatusUpdated = (ordenActualizada) => {
      cargarDatosTracking(ordenActualizada);
    };
    socket.on("orderStatusUpdated", handleOrderStatusUpdated);

    return () => {
      socket.emit("leaveOrderRoom", roomId.toString());
      socket.off("orderStatusUpdated", handleOrderStatusUpdated);
    };
  }, [datosEnvio, id, cargarDatosTracking]);

  const manejarConfirmarEntrega = async () => {
    if (confirmando) return;
    setConfirmando(true);
    setErrorEntrega('');

    try {
      if (datosEnvio?.ordenOriginal?._id) {
        const respuesta = await api.put(`/orders/${datosEnvio.ordenOriginal._id}/confirm-receipt`);
        if (respuesta.data && respuesta.data.data) {
          cargarDatosTracking(respuesta.data.data);
        }
      }
      setEntregaConfirmada(true);

      try {
        const respuesta = await api.get('/auth/profile');
        const datosUsuario = respuesta.data.data;
        if (datosUsuario.firstPurchaseCompleted && !datosUsuario.wheelSpun) {
          setMostrarRuleta(true);
        }
      } catch (profileErr) {
        console.warn("No se pudo verificar elegibilidad de ruleta:", profileErr);
      }
    } catch (err) {
      console.error("Error al confirmar entrega:", err);
      const status = err.response?.status;
      const mensaje = err.response?.data?.message || '';
      if (status === 400 && mensaje.includes('ya fue confirmada')) {
        setEntregaConfirmada(true);
      } else {
        setErrorEntrega(mensaje || 'Error al confirmar la entrega. Intenta de nuevo.');
      }
    } finally {
      setConfirmando(false);
    }
  };

  return {
    datosEnvio,
    cargando,
    mostrarRuleta, setMostrarRuleta,
    entregaConfirmada,
    confirmando,
    errorEntrega,
    manejarConfirmarEntrega,
    id,
  };
}

