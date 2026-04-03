import React, { useState } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import NavbarSecundario from '../NavbarSecundario/NavbarSecundario';
import MisOrdenes from '../MisOrdenes/MisOrdenes';
import DetalleOrden from '../DetalleOrden/DetalleOrden';
import MisTickets from '../MisTickets/MisTickets';
import SolicitarDevolucion from '../SolicitarDevolucion/SolicitarDevolucion';
import MisReseñas from '../MisReseñas/MisReseñas';
import './PerfilCliente.css';
import { 
    User, 
    ShoppingBag, 
    Ticket, 
    RotateCcw, 
    CreditCard, 
    MapPin, 
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

function ResumenPerfil({ user }) {
    const { updateProfile } = useAuth();
    
    // Estados de edición individuales
    const [editPersonal, setEditPersonal] = useState(false);
    const [editCard, setEditCard] = useState(false);
    const [editAddress, setEditAddress] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    
    const [formData, setFormData] = useState({
        nombre: user?.nombre || '',
        password: '',
        debitCard: {
            cardNumber: user?.debitCard?.cardNumber || '',
            cardName: user?.debitCard?.cardName || '',
            expiryDate: user?.debitCard?.expiryDate || '',
            cvv: user?.debitCard?.cvv || ''
        },
        telefono: user?.telefono || '',
        shippingAddress: {
            pais: user?.shippingAddress?.pais || '',
            provincia: user?.shippingAddress?.provincia || '',
            ciudad: user?.shippingAddress?.ciudad || '',
            codigoPostal: user?.shippingAddress?.codigoPostal || '',
            direccion: user?.shippingAddress?.direccion || ''
        }
    });

    // Sincronizar formData cuando el usuario cambie (ej: tras guardar)
    React.useEffect(() => {
        setFormData({
            nombre: user?.nombre || '',
            password: '',
            debitCard: {
                cardNumber: user?.debitCard?.cardNumber || '',
                cardName: user?.debitCard?.cardName || '',
                expiryDate: user?.debitCard?.expiryDate || '',
                cvv: user?.debitCard?.cvv || ''
            },
            telefono: user?.telefono || '',
            shippingAddress: {
                pais: user?.shippingAddress?.pais || '',
                provincia: user?.shippingAddress?.provincia || '',
                ciudad: user?.shippingAddress?.ciudad || '',
                codigoPostal: user?.shippingAddress?.codigoPostal || '',
                direccion: user?.shippingAddress?.direccion || ''
            }
        });
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('card_')) {
            const cardField = name.replace('card_', '');
            setFormData(prev => ({
                ...prev,
                debitCard: { ...prev.debitCard, [cardField]: value }
            }));
        } else if (name.startsWith('addr_')) {
            const addrField = name.replace('addr_', '');
            setFormData(prev => ({
                ...prev,
                shippingAddress: { ...prev.shippingAddress, [addrField]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async (section) => {
        try {
            setLoading(true);
            const dataToUpdate = {};
            
            if (section === 'personal') {
                dataToUpdate.nombre = formData.nombre;
                if (formData.password && formData.password.trim() !== '') {
                    dataToUpdate.password = formData.password;
                }
                dataToUpdate.telefono = formData.telefono;
            }
            if (section === 'card') dataToUpdate.debitCard = formData.debitCard;
            if (section === 'address') {
                dataToUpdate.shippingAddress = formData.shippingAddress;
                dataToUpdate.telefono = formData.telefono;
            }

            await updateProfile(dataToUpdate);
            setMessage("Información actualizada con éxito");
            
            if (section === 'personal') {
                setEditPersonal(false);
                setFormData(prev => ({ ...prev, password: '' }));
            }
            if (section === 'card') setEditCard(false);
            if (section === 'address') setEditAddress(false);
        } catch (error) {
            setMessage("Error al actualizar la información");
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div className="resumen-perfil">
            <h2 className="titulo-seccion">Mi Perfil</h2>
            {message && <p className={`mensaje-alerta ${message.includes('Error') ? 'error' : 'exito'}`} style={{ marginBottom: '15px' }}>{message}</p>}
            
            <div className="perfil-grid">
                {/* Información Personal */}
                <div className="perfil-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid var(--info-bg)', paddingBottom: '10px' }}>
                        <h3 style={{ margin: 0, border: 'none', padding: 0 }}>Información Personal</h3>
                        {!editPersonal ? (
                            <button className="boton-secundario" onClick={() => setEditPersonal(true)} style={{ padding: '5px 10px', fontSize: '0.85rem' }}>Editar</button>
                        ) : (
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button className="boton-secundario" onClick={() => setEditPersonal(false)} style={{ padding: '5px 10px', fontSize: '0.85rem' }}>Cancelar</button>
                                <button className="boton-primario" onClick={() => handleSave('personal')} disabled={loading} style={{ padding: '5px 10px', fontSize: '0.85rem' }}>Guardar</button>
                            </div>
                        )}
                    </div>
                    
                    <div className="info-group">
                        <label>Nombre Completo</label>
                        {editPersonal ? (
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="input-field" />
                        ) : (
                            <p>{user?.nombre}</p>
                        )}
                    </div>
                    <div className="info-group">
                        <label>Contraseña</label>
                        {editPersonal ? (
                            <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="input-field" placeholder="Nueva contraseña (dejar vacío para no cambiar)" />
                        ) : (
                            <p>**************</p>
                        )}
                    </div>
                    <div className="info-group">
                        <label>Teléfono de Contacto</label>
                        {editPersonal ? (
                            <input type="text" name="telefono" value={formData.telefono} onChange={handleInputChange} className="input-field" placeholder="Ej. 88888888" />
                        ) : (
                            <p>{user?.telefono || "No especificado"}</p>
                        )}
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

                {/* Tarjeta de Débito */}
                <div className="perfil-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid var(--info-bg)', paddingBottom: '10px' }}>
                        <h3 style={{ margin: 0, border: 'none', padding: 0 }}>Tarjeta de Débito / Crédito</h3>
                        {!editCard ? (
                            <button className="boton-secundario" onClick={() => setEditCard(true)} style={{ padding: '5px 10px', fontSize: '0.85rem' }}>Editar</button>
                        ) : (
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button className="boton-secundario" onClick={() => setEditCard(false)} style={{ padding: '5px 10px', fontSize: '0.85rem' }}>Cancelar</button>
                                <button className="boton-primario" onClick={() => handleSave('card')} disabled={loading} style={{ padding: '5px 10px', fontSize: '0.85rem' }}>Guardar</button>
                            </div>
                        )}
                    </div>
                    
                    {!editCard ? (
                        user?.debitCard?.cardNumber ? (
                            <div className="direccion-info" style={{ marginTop: '10px' }}>
                                <CreditCard size={24} color="#0094FF" />
                                <div>
                                    <p>{user.debitCard.cardName}</p>
                                    <p>**** **** **** {user.debitCard.cardNumber.slice(-4)}</p>
                                    <p>Expira: {user.debitCard.expiryDate}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="no-data">No has agregado ninguna tarjeta.</p>
                        )
                    ) : (
                        <div className="form-group-tarjeta" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                            <div className="info-group">
                                <label>Nombre en la tarjeta</label>
                                <input type="text" name="card_cardName" value={formData.debitCard.cardName} onChange={handleInputChange} className="input-field" placeholder="Titular" />
                            </div>
                            <div className="info-group">
                                <label>Número de Tarjeta</label>
                                <input type="text" name="card_cardNumber" value={formData.debitCard.cardNumber} onChange={handleInputChange} className="input-field" placeholder="1234 5678 9101 1121" />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div className="info-group" style={{ flex: 1 }}>
                                    <label>Fecha de Expiración</label>
                                    <input type="text" name="card_expiryDate" value={formData.debitCard.expiryDate} onChange={handleInputChange} className="input-field" placeholder="MM/AA" />
                                </div>
                                <div className="info-group" style={{ flex: 1 }}>
                                    <label>CVV</label>
                                    <input type="text" name="card_cvv" value={formData.debitCard.cvv} onChange={handleInputChange} className="input-field" placeholder="123" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Dirección de Envío */}
                <div className="perfil-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid var(--info-bg)', paddingBottom: '10px' }}>
                        <h3 style={{ margin: 0, border: 'none', padding: 0 }}>Dirección de Envío</h3>
                        {!editAddress ? (
                            <button className="boton-secundario" onClick={() => setEditAddress(true)} style={{ padding: '5px 10px', fontSize: '0.85rem' }}>Editar</button>
                        ) : (
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button className="boton-secundario" onClick={() => setEditAddress(false)} style={{ padding: '5px 10px', fontSize: '0.85rem' }}>Cancelar</button>
                                <button className="boton-primario" onClick={() => handleSave('address')} disabled={loading} style={{ padding: '5px 10px', fontSize: '0.85rem' }}>Guardar</button>
                            </div>
                        )}
                    </div>
                    
                    {!editAddress ? (
                        user?.shippingAddress?.direccion ? (
                            <div className="direccion-info" style={{ marginTop: '10px' }}>
                                <MapPin size={24} color="#0094FF" />
                                <div>
                                    <p>{user.shippingAddress.direccion}</p>
                                    <p>{user.shippingAddress.ciudad}, {user.shippingAddress.provincia}</p>
                                    <p>{user.shippingAddress.pais} - {user.shippingAddress.codigoPostal}</p>
                                    {user.telefono && <p style={{ marginTop: '5px', color: 'var(--nexora-blue)' }}><strong>Tel:</strong> {user.telefono}</p>}
                                </div>
                            </div>
                        ) : (
                            <p className="no-data">No has configurado una dirección de envío.</p>
                        )
                    ) : (
                        <div className="form-group-tarjeta" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                            <div className="info-group">
                                <label>Dirección (Calle, número)</label>
                                <input type="text" name="addr_direccion" value={formData.shippingAddress.direccion} onChange={handleInputChange} className="input-field" placeholder="Ej. Av. Siempreviva 123" />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div className="info-group" style={{ flex: 1 }}>
                                    <label>País</label>
                                    <input type="text" name="addr_pais" value={formData.shippingAddress.pais} onChange={handleInputChange} className="input-field" />
                                </div>
                                <div className="info-group" style={{ flex: 1 }}>
                                    <label>Provincia/Estado</label>
                                    <input type="text" name="addr_provincia" value={formData.shippingAddress.provincia} onChange={handleInputChange} className="input-field" />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div className="info-group" style={{ flex: 1 }}>
                                    <label>Ciudad</label>
                                    <input type="text" name="addr_ciudad" value={formData.shippingAddress.ciudad} onChange={handleInputChange} className="input-field" />
                                </div>
                                <div className="info-group" style={{ flex: 1 }}>
                                    <label>Código Postal</label>
                                    <input type="text" name="addr_codigoPostal" value={formData.shippingAddress.codigoPostal} onChange={handleInputChange} className="input-field" />
                                </div>
                            </div>
                            <div className="info-group">
                                <label>Teléfono de Contacto</label>
                                <input type="text" name="telefono" value={formData.telefono} onChange={handleInputChange} className="input-field" placeholder="Ej. 88888888" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
