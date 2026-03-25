import React from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import NavbarSecundario from '../NavbarSecundario/NavbarSecundario';
import MisOrdenes from '../pageMisOrdenes/MisOrdenes';
import DetalleOrden from '../pageDetalleOrden/DetalleOrden';
import MisTickets from '../pageMisTickets/MisTickets';
import SolicitarDevolucion from '../pageSolicitarDevolucion/SolicitarDevolucion';
import './PerfilCliente.css';
import { 
    User, 
    ShoppingBag, 
    Ticket, 
    RotateCcw, 
    CreditCard, 
    MapPin, 
    ChevronRight,
    LogOut
} from 'lucide-react';

export default function PerfilCliente() {
    const { user, logout } = useAuth();
    const { isDarkMode } = useTheme();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname.includes(path);

    return (
        <div className={`perfil-cliente-container ${!isDarkMode ? 'modo-claro' : ''}`}>
            <NavbarSecundario 
                user={user} 
                logout={logout} 
                cartCount={cartCount} 
            />
            
            <div className="perfil-layout">
                {/* Sidebar */}
                <aside className="perfil-sidebar">
                    <div className="perfil-info-resumen">
                        <img 
                            src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre || 'U')}&background=0094FF&color=fff`} 
                            alt="avatar" 
                            className="perfil-avatar-grande"
                        />
                        <div className="perfil-nombres">
                            <h3>{user?.nombre || "Usuario"}</h3>
                            <p>{user?.email}</p>
                        </div>
                    </div>

                    <nav className="perfil-menu">
                        <Link to="/cliente/perfil" className={`perfil-menu-item ${location.pathname === '/cliente/perfil' ? 'activo' : ''}`}>
                            <User size={20} />
                            <span>Mi Perfil</span>
                            <ChevronRight size={16} className="arrow" />
                        </Link>
                        <Link to="/cliente/perfil/ordenes" className={`perfil-menu-item ${isActive('ordenes') ? 'activo' : ''}`}>
                            <ShoppingBag size={20} />
                            <span>Mis Órdenes</span>
                            <ChevronRight size={16} className="arrow" />
                        </Link>
                        <Link to="/cliente/perfil/tickets" className={`perfil-menu-item ${isActive('tickets') ? 'activo' : ''}`}>
                            <Ticket size={20} />
                            <span>Mis Tickets</span>
                            <ChevronRight size={16} className="arrow" />
                        </Link>
                        <Link to="/cliente/perfil/devoluciones" className={`perfil-menu-item ${isActive('devoluciones') ? 'activo' : ''}`}>
                            <RotateCcw size={20} />
                            <span>Devoluciones</span>
                            <ChevronRight size={16} className="arrow" />
                        </Link>
                        <Link to="/checkout" className="perfil-menu-item">
                            <CreditCard size={20} />
                            <span>Checkout / Pago</span>
                            <ChevronRight size={16} className="arrow" />
                        </Link>
                        <div className="divisor" />
                        <button onClick={handleLogout} className="perfil-menu-item logout">
                            <LogOut size={20} />
                            <span>Cerrar Sesión</span>
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="perfil-contenido">
                    <Routes>
                        <Route path="/" element={<ResumenPerfil user={user} />} />
                        <Route path="ordenes" element={<MisOrdenes />} />
                        <Route path="ordenes/:id" element={<DetalleOrden />} />
                        <Route path="tickets" element={<MisTickets />} />
                        <Route path="devoluciones" element={<SolicitarDevolucion />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

function ResumenPerfil({ user }) {
    return (
        <div className="resumen-perfil">
            <h2 className="titulo-seccion">Mi Perfil</h2>
            <div className="perfil-grid">
                <div className="perfil-card">
                    <h3>Información Personal</h3>
                    <div className="info-group">
                        <label>Nombre Completo</label>
                        <p>{user?.nombre}</p>
                    </div>
                    <div className="info-group">
                        <label>Correo Electrónico</label>
                        <p>{user?.email}</p>
                    </div>
                    <div className="info-group">
                        <label>Rol de Usuario</label>
                        <p className="tag-rol">{user?.role}</p>
                    </div>
                </div>

                <div className="perfil-card">
                    <h3>Dirección de Envío</h3>
                    {user?.shippingAddress?.direccion ? (
                        <div className="direccion-info">
                            <MapPin size={24} color="#0094FF" />
                            <div>
                                <p>{user.shippingAddress.direccion}</p>
                                <p>{user.shippingAddress.ciudad}, {user.shippingAddress.provincia}</p>
                                <p>{user.shippingAddress.pais} - {user.shippingAddress.codigoPostal}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="no-data">No has configurado una dirección de envío.</p>
                    )}
                    <button className="boton-secundario">Editar Dirección</button>
                </div>
            </div>
        </div>
    );
}
