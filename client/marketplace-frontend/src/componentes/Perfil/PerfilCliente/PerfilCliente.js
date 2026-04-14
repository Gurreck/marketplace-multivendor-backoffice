import React, { useState } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { useCart } from '../../../context/CartContext';
import NavbarSecundario from '../../NavbarSecundario/NavbarSecundario';
import MisOrdenes from '../../MisOrdenes/MisOrdenes';
import DetalleOrden from '../../DetalleOrden/DetalleOrden';
import MisTickets from '../../MisTickets/MisTickets';
import SolicitarDevolucion from '../../SolicitarDevolucion/SolicitarDevolucion';
import MisReseñas from '../../MisReseñas/MisReseñas';
import ResumenPerfil from '../../ResumenPerfil/ResumenPerfil';
import './PerfilCliente.css';
import { 
    User, 
    ShoppingBag, 
    Ticket, 
    RotateCcw, 
    CreditCard, 
    ChevronRight,
    LogOut,
    Edit2,
    Loader,
    Star
} from 'lucide-react';
import { useRef } from 'react';

export default function PerfilCliente() {
    const { user, logout, uploadProfilePicture } = useAuth();
    const { isDarkMode } = useTheme();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname.includes(path);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setUploading(true);
                await uploadProfilePicture(file);
            } catch (error) {
                console.error("Error subiendo foto:", error);
                alert("Hubo un error al subir la foto de perfil");
            } finally {
                setUploading(false);
            }
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

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
                        <div className="perfil-avatar-container">
                            <img 
                                src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre || 'U')}&background=0094FF&color=fff`} 
                                alt="avatar" 
                                className="perfil-avatar-grande"
                                style={{ opacity: uploading ? 0.5 : 1 }}
                            />
                            <div className="perfil-avatar-edit" onClick={triggerFileInput} title="Cambiar foto de perfil">
                                {uploading ? <Loader size={16} className="lucide-spin" /> : <Edit2 size={16} />}
                            </div>
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                onChange={handleFileChange}
                            />
                        </div>
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
                        <Link to="/cliente/perfil/resenas" className={`perfil-menu-item ${isActive('resenas') ? 'activo' : ''}`}>
                            <Star size={20} />
                            <span>Mis Reseñas</span>
                            <ChevronRight size={16} className="arrow" />
                        </Link>
                        <Link to="/carrito" className="perfil-menu-item">
                            <CreditCard size={20} />
                            <span>Carrito / Compra</span>
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
                        <Route path="resenas" element={<MisReseñas />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}
