import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Edit2, Loader } from 'lucide-react';
import './PerfilCliente.css';

export default function PerfilVendedor() {
    const { user, updateProfile, uploadProfilePicture } = useAuth();
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    
    // Estados de edición individuales
    const [editPersonal, setEditPersonal] = useState(false);
    const [editAddress, setEditAddress] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    
    const [formData, setFormData] = useState({
        nombre: user?.nombre || '',
        password: '',
        shippingAddress: {
            pais: user?.shippingAddress?.pais || '',
            provincia: user?.shippingAddress?.provincia || '',
            ciudad: user?.shippingAddress?.ciudad || '',
            codigoPostal: user?.shippingAddress?.codigoPostal || '',
            direccion: user?.shippingAddress?.direccion || ''
        }
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('addr_')) {
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
            }
            if (section === 'address') dataToUpdate.shippingAddress = formData.shippingAddress;

            await updateProfile(dataToUpdate);
            setMessage("Información actualizada con éxito");
            
            if (section === 'personal') {
                setEditPersonal(false);
                setFormData(prev => ({ ...prev, password: '' }));
            }
            if (section === 'address') setEditAddress(false);
        } catch (error) {
            setMessage("Error al actualizar la información");
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setUploading(true);
                await uploadProfilePicture(file);
            } catch (error) {
                console.error("Error subiendo foto:", error);
                setMessage("Hubo un error al subir la foto de perfil");
            } finally {
                setUploading(false);
            }
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="resumen-perfil" style={{ padding: '10px', maxWidth: '900px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                <div className="perfil-avatar-container" style={{ margin: 0, width: '90px', height: '90px' }}>
                    <img 
                        src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre || 'V')}&background=0ea5e9&color=fff`} 
                        alt="avatar" 
                        className="perfil-avatar-grande"
                        style={{ opacity: uploading ? 0.5 : 1, width: '100%', height: '100%', objectFit: 'cover' }}
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
                <div>
                    <h2 className="titulo-seccion-vend" style={{ color: 'var(--vend-texto)', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Perfil de Tienda</h2>
                    <p style={{ color: 'var(--vend-texto-secundario)', margin: '5px 0 0 0' }}>Administra tu información personal y de tienda</p>
                </div>
            </div>
            {message && <p className={`mensaje-alerta ${message.includes('Error') ? 'error' : 'exito'}`} style={{ marginBottom: '15px' }}>{message}</p>}
            
            <div className="perfil-grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr)', gap: '20px' }}>
                {/* Información Personal */}
                <div className="perfil-card" style={{ background: 'var(--vend-card)', border: '1px solid var(--vend-borde)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid var(--vend-borde)', paddingBottom: '10px' }}>
                        <h3 style={{ margin: 0, border: 'none', padding: 0, color: 'var(--vend-texto)' }}>Información Personal</h3>
                        {!editPersonal ? (
                            <button className="boton-secundario" onClick={() => setEditPersonal(true)} style={{ padding: '5px 15px', fontSize: '0.85rem' }}>Editar</button>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="boton-secundario" onClick={() => setEditPersonal(false)} style={{ padding: '5px 15px', fontSize: '0.85rem' }}>Cancelar</button>
                                <button className="boton-primario" onClick={() => handleSave('personal')} disabled={loading} style={{ padding: '5px 15px', fontSize: '0.85rem', background: 'var(--vend-azul)', color: 'white', border: 'none', borderRadius: '8px' }}>{loading ? 'Guardando...' : 'Guardar'}</button>
                            </div>
                        )}
                    </div>
                    
                    <div className="info-group">
                        <label style={{ color: 'var(--vend-texto-secundario)' }}>Nombre de la Tienda / Vendedor</label>
                        {editPersonal ? (
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="input-field" style={{ background: 'var(--vend-bg)', color: 'var(--vend-texto)', border: '1px solid var(--vend-borde)' }} />
                        ) : (
                            <p style={{ color: 'var(--vend-texto)' }}>{user?.nombre}</p>
                        )}
                    </div>
                    <div className="info-group">
                        <label style={{ color: 'var(--vend-texto-secundario)' }}>Contraseña</label>
                        {editPersonal ? (
                            <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="input-field" placeholder="Nueva contraseña (dejar vacío para no cambiar)" style={{ background: 'var(--vend-bg)', color: 'var(--vend-texto)', border: '1px solid var(--vend-borde)' }} />
                        ) : (
                            <p style={{ color: 'var(--vend-texto)' }}>**************</p>
                        )}
                    </div>
                    <div className="info-group">
                        <label style={{ color: 'var(--vend-texto-secundario)' }}>Correo Electrónico</label>
                        <p style={{ color: 'var(--vend-texto)' }}>{user?.email}</p>
                    </div>
                    <div className="info-group">
                        <label style={{ color: 'var(--vend-texto-secundario)' }}>Rol de Usuario</label>
                        <div>
                            <p className="tag-rol" style={{ background: 'var(--vend-azul)', color: 'white', display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', margin: 0 }}>{user?.role}</p>
                        </div>
                    </div>
                </div>

                {/* Dirección de Tienda */}
                <div className="perfil-card" style={{ background: 'var(--vend-card)', border: '1px solid var(--vend-borde)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid var(--vend-borde)', paddingBottom: '10px' }}>
                        <h3 style={{ margin: 0, border: 'none', padding: 0, color: 'var(--vend-texto)' }}>Dirección de Tienda</h3>
                        {!editAddress ? (
                            <button className="boton-secundario" onClick={() => setEditAddress(true)} style={{ padding: '5px 15px', fontSize: '0.85rem' }}>Editar</button>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="boton-secundario" onClick={() => setEditAddress(false)} style={{ padding: '5px 15px', fontSize: '0.85rem' }}>Cancelar</button>
                                <button className="boton-primario" onClick={() => handleSave('address')} disabled={loading} style={{ padding: '5px 15px', fontSize: '0.85rem', background: 'var(--vend-azul)', color: 'white', border: 'none', borderRadius: '8px' }}>{loading ? 'Guardando...' : 'Guardar'}</button>
                            </div>
                        )}
                    </div>
                    
                    {!editAddress ? (
                        user?.shippingAddress?.direccion ? (
                            <div className="direccion-info" style={{ marginTop: '10px', display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                                <MapPin size={28} color="var(--vend-azul)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <p style={{ color: 'var(--vend-texto)', fontSize: '16px', marginBottom: '4px' }}>{user.shippingAddress.direccion}</p>
                                    <p style={{ color: 'var(--vend-texto-secundario)', marginBottom: '2px' }}>{user.shippingAddress.ciudad}, {user.shippingAddress.provincia}</p>
                                    <p style={{ color: 'var(--vend-texto-secundario)' }}>{user.shippingAddress.pais} - {user.shippingAddress.codigoPostal}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="no-data" style={{ color: 'var(--vend-texto-secundario)' }}>No has configurado una dirección para tu tienda.</p>
                        )
                    ) : (
                        <div className="form-group-tarjeta" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                            <div className="info-group">
                                <label style={{ color: 'var(--vend-texto-secundario)' }}>Dirección (Calle, número)</label>
                                <input type="text" name="addr_direccion" value={formData.shippingAddress.direccion} onChange={handleInputChange} className="input-field" placeholder="Ej. Av. Siempreviva 123" style={{ background: 'var(--vend-bg)', color: 'var(--vend-texto)', border: '1px solid var(--vend-borde)' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div className="info-group" style={{ flex: 1 }}>
                                    <label style={{ color: 'var(--vend-texto-secundario)' }}>País</label>
                                    <input type="text" name="addr_pais" value={formData.shippingAddress.pais} onChange={handleInputChange} className="input-field" style={{ background: 'var(--vend-bg)', color: 'var(--vend-texto)', border: '1px solid var(--vend-borde)' }} />
                                </div>
                                <div className="info-group" style={{ flex: 1 }}>
                                    <label style={{ color: 'var(--vend-texto-secundario)' }}>Provincia/Estado</label>
                                    <input type="text" name="addr_provincia" value={formData.shippingAddress.provincia} onChange={handleInputChange} className="input-field" style={{ background: 'var(--vend-bg)', color: 'var(--vend-texto)', border: '1px solid var(--vend-borde)' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div className="info-group" style={{ flex: 1 }}>
                                    <label style={{ color: 'var(--vend-texto-secundario)' }}>Ciudad</label>
                                    <input type="text" name="addr_ciudad" value={formData.shippingAddress.ciudad} onChange={handleInputChange} className="input-field" style={{ background: 'var(--vend-bg)', color: 'var(--vend-texto)', border: '1px solid var(--vend-borde)' }} />
                                </div>
                                <div className="info-group" style={{ flex: 1 }}>
                                    <label style={{ color: 'var(--vend-texto-secundario)' }}>Código Postal</label>
                                    <input type="text" name="addr_codigoPostal" value={formData.shippingAddress.codigoPostal} onChange={handleInputChange} className="input-field" style={{ background: 'var(--vend-bg)', color: 'var(--vend-texto)', border: '1px solid var(--vend-borde)' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
