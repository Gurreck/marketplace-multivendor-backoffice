import React from "react";
import "./Soporte.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  Ticket,
  RotateCcw,
  X,
  CheckCircle2,
  Moon,
  Sun,
  LogOut,
  Menu,
  Zap,
  XCircle,
  Package,
} from "lucide-react";

// Sub-componentes
import SoporteTicketsLista from "./SoporteTicketsLista";
import SoporteDetalleTicket from "./SoporteDetalleTicket";
import SoporteDevolucionesLista from "./SoporteDevolucionesLista";
import SoporteDetalleDevolucion from "./SoporteDetalleDevolucion";
import SoporteOrdenes from "./SoporteOrdenes";

// Custom hook con toda la lógica
import useSoporteData from "./useSoporteData";

export default function Soporte() {
  const navegar = useNavigate();
  const { logout: cerrarSesion } = useAuth();
  const { isDarkMode: esModoOscuro, toggleTheme: alternarTema } = useTheme();
  const data = useSoporteData();

  const manejarCerrarSesion = () => {
    cerrarSesion();
    navegar("/");
  };

  const elementosNav = [
    { clave: "tickets", icono: <Ticket size={20} />, etiqueta: "Tickets" },
    { clave: "devoluciones", icono: <RotateCcw size={20} />, etiqueta: "Devoluciones RMA" },
    { clave: "ordenes", icono: <Package size={20} />, etiqueta: "Envíos" },
  ];

  return (
    <div className={`contenedor-sop ${!esModoOscuro ? "modo-claro" : ""}`}>
      {/* Notificación */}
      {data.notificacion && (
        <div className={`notificacion-sop ${data.notificacion.tipo}`}>
          {data.notificacion.tipo === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          <span style={{ marginLeft: "8px" }}>{data.notificacion.mensaje}</span>
        </div>
      )}

      {/* Botón menú móvil */}
      <button className="boton-menu-movil-sop" onClick={() => data.setMenuAbierto(!data.menuAbierto)}>
        {data.menuAbierto ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Barra lateral */}
      <aside className={`barra-lateral-sop ${data.menuAbierto ? "abierta" : ""}`}>
        <div className="marca-barra-lateral-sop">
          <Zap size={24} color="var(--sop-azul)" />
          <h2>Nexora Soporte</h2>
        </div>

        <nav className="nav-sop">
          {elementosNav.map((elemento) => (
            <button
              key={elemento.clave}
              className={`item-nav-sop ${
                data.seccionActiva === elemento.clave ||
                (data.seccionActiva === "detalleTicket" && elemento.clave === "tickets") ||
                (data.seccionActiva === "detalleRMA" && elemento.clave === "devoluciones")
                  ? "activo" : ""
              }`}
              onClick={() => {
                data.setSeccionActiva(elemento.clave);
                if (window.innerWidth <= 768) data.setMenuAbierto(false);
              }}
            >
              <span>{elemento.icono}</span>
              <span>{elemento.etiqueta}</span>
            </button>
          ))}
        </nav>

        <div className="pie-barra-lateral-sop">
          <button className="boton-tema-sop" onClick={alternarTema}>
            <span>{esModoOscuro ? <Sun size={18} /> : <Moon size={18} />}</span>
            <span>{esModoOscuro ? "Modo Claro" : "Modo Oscuro"}</span>
          </button>
          <button className="boton-cerrar-sesion-sop" onClick={manejarCerrarSesion}>
            <span><LogOut size={18} /></span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="principal-sop">
        {data.seccionActiva === "tickets" && (
          <SoporteTicketsLista
            ticketsFiltrados={data.ticketsFiltrados} buscarTicket={data.buscarTicket}
            setBuscarTicket={data.setBuscarTicket} filtroEstadoTicket={data.filtroEstadoTicket}
            setFiltroEstadoTicket={data.setFiltroEstadoTicket} cargarTickets={data.cargarTickets}
            cargando={data.cargando} obtenerIniciales={data.obtenerIniciales}
            formatearFecha={data.formatearFecha} coloresEstadoTicket={data.coloresEstadoTicket}
            etiquetasEstadoTicket={data.etiquetasEstadoTicket}
            setTicketSeleccionado={data.setTicketSeleccionado}
            setSeccionActiva={data.setSeccionActiva} asignarseTicket={data.asignarseTicket}
          />
        )}
        {data.seccionActiva === "detalleTicket" && (
          <SoporteDetalleTicket
            ticket={data.ticketSeleccionado} setSeccionActiva={data.setSeccionActiva}
            formatearFecha={data.formatearFecha} obtenerIniciales={data.obtenerIniciales}
            coloresEstadoTicket={data.coloresEstadoTicket} etiquetasEstadoTicket={data.etiquetasEstadoTicket}
            estadosTicket={data.estadosTicket} cambiarEstadoTicket={data.cambiarEstadoTicket}
            asignarseTicket={data.asignarseTicket} mostrarEscalar={data.mostrarEscalar}
            setMostrarEscalar={data.setMostrarEscalar} comentarioEscalar={data.comentarioEscalar}
            setComentarioEscalar={data.setComentarioEscalar} escalarTicketHandler={data.escalarTicketHandler}
            respuestaTicket={data.respuestaTicket} setRespuestaTicket={data.setRespuestaTicket}
            responderTicketHandler={data.responderTicketHandler}
          />
        )}
        {data.seccionActiva === "devoluciones" && (
          <SoporteDevolucionesLista
            devolucionesFiltradas={data.devolucionesFiltradas} buscarRMA={data.buscarRMA}
            setBuscarRMA={data.setBuscarRMA} filtroEstadoRMA={data.filtroEstadoRMA}
            setFiltroEstadoRMA={data.setFiltroEstadoRMA} cargarDevoluciones={data.cargarDevoluciones}
            cargando={data.cargando} obtenerIniciales={data.obtenerIniciales}
            formatearFecha={data.formatearFecha} coloresEstadoRMA={data.coloresEstadoRMA}
            etiquetasEstadoRMA={data.etiquetasEstadoRMA} setRmaSeleccionada={data.setRmaSeleccionada}
            setSeccionActiva={data.setSeccionActiva} cambiarEstadoRMA={data.cambiarEstadoRMA}
          />
        )}
        {data.seccionActiva === "detalleRMA" && (
          <SoporteDetalleDevolucion
            rma={data.rmaSeleccionada} setSeccionActiva={data.setSeccionActiva}
            obtenerTransicionesRMA={data.obtenerTransicionesRMA} formatearFecha={data.formatearFecha}
            coloresEstadoRMA={data.coloresEstadoRMA} etiquetasEstadoRMA={data.etiquetasEstadoRMA}
            estadosRMA={data.estadosRMA} comentarioRMA={data.comentarioRMA}
            setComentarioRMA={data.setComentarioRMA} cambiarEstadoRMA={data.cambiarEstadoRMA}
            mostrarEscalarRMA={data.mostrarEscalarRMA} setMostrarEscalarRMA={data.setMostrarEscalarRMA}
            comentarioEscalarRMA={data.comentarioEscalarRMA} setComentarioEscalarRMA={data.setComentarioEscalarRMA}
            escalarRMAHandler={data.escalarRMAHandler}
          />
        )}
        {data.seccionActiva === "ordenes" && (
          <SoporteOrdenes
            ordenesFiltradas={data.ordenesFiltradas} buscarOrden={data.buscarOrden}
            setBuscarOrden={data.setBuscarOrden} filtroEstadoOrden={data.filtroEstadoOrden}
            setFiltroEstadoOrden={data.setFiltroEstadoOrden} cargarOrdenes={data.cargarOrdenes}
            cargando={data.cargando} coloresEstadoOrden={data.coloresEstadoOrden}
            etiquetasEstadoOrden={data.etiquetasEstadoOrden} formatearFecha={data.formatearFecha}
            cambiarEstadoOrdenSoporte={data.cambiarEstadoOrdenSoporte}
          />
        )}
      </main>
    </div>
  );
}
