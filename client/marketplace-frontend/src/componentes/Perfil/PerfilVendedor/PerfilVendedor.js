import React, { useState, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { MapPin, Edit2, Loader, User, CheckCircle, AlertCircle } from 'lucide-react';
import PerfilTienda from '../../PerfilTienda/PerfilTienda';
import './PerfilVendedor.css';

export default function PerfilVendedor() {
    const { user, updateProfile, uploadProfilePicture } = useAuth();
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    
    // Estados de edición individuales
    const [editPersonal, setEditPersonal] = useState(false);
    const [editAddress, setEditAddress] = useState(false);
    const [editStore, setEditStore] = useState(false);
    
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
        },
        storeDescription: user?.storeDescription || '',
        storeBanner: user?.storeBanner || ''
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
                if (formData.password?.trim()) dataToUpdate.password = formData.password;
            }
            if (section === 'address') dataToUpdate.shippingAddress = formData.shippingAddress;
            if (section === 'store') { dataToUpdate.storeDescription = formData.storeDescription; dataToUpdate.storeBanner = formData.storeBanner; }

            await updateProfile(dataToUpdate);
            setMessage("Información actualizada con éxito");
            
            if (section === 'personal') { setEditPersonal(false); setFormData(p => ({ ...p, password: '' })); }
            if (section === 'address') setEditAddress(false);
            if (section === 'store') setEditStore(false);
        } catch (error) {
            setMessage("Error al actualizar la información");
        } finally {
            setLoading(false); setTimeout(() => setMessage(''), 3000);
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
        <div className="resumen-perfil">
            {/* Cabecera del Perfil */}
            <div className="perfil-header-seccion">
                <div className="perfil-avatar-container-v2">
                    <img 
                        src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre || 'V')}&background=0ea5e9&color=fff`} 
                        alt="avatar" 
                        className="perfil-avatar-grande-v2"
                        style={{ opacity: uploading ? 0.5 : 1 }}
                    />
                    <div className="perfil-avatar-edit-v2" onClick={triggerFileInput} title="Cambiar foto de perfil">
                        {uploading ? <Loader size={18} className="lucide-spin" /> : <Edit2 size={18} />}
                    </div>
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        onChange={handleFileChange}
                    />
                </div>
                <div className="perfil-header-texto">
                    <h2>Configuración de Tienda</h2>
                    <p>Administradoristra tu identidad comercial y detalles de contacto</p>
                </div>
            </div>

            {/* Mensajes de Alerta */}
            {message && (
                <div className={`alerta-v2 ${message.includes('Error') ? 'error' : 'exito'}`}>
                    {message.includes('Error') ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                    {message}
                </div>
            )}
            
            <div className="perfil-grid-v2">
                {/* Información Personal */}
                <div className="perfil-card-v2">
                    <div className="perfil-card-header">
                        <h3><User size={20} strokeWidth={2.5} color="var(--vend-azul)" /> Información Personal</h3>
                        {!editPersonal ? (
                            <button className="btn-edit-v2" onClick={() => setEditPersonal(true)}>Editar</button>
                        ) : (
                            <div className="perfil-card-acciones">
                                <button className="btn-cancel-v2" onClick={() => setEditPersonal(false)}>Cancelar</button>
                                <button className="btn-save-v2" onClick={() => handleSave('personal')} disabled={loading}>
                                    {loading ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="info-group-v2">
                        <label>Nombre de la Tienda / Vendedor</label>
                        {editPersonal ? (
                            <input 
                                type="text" 
                                name="nombre" 
                                value={formData.nombre} 
                                onChange={handleInputChange} 
                                className="input-field-v2" 
                            />
                        ) : (
                            <p>{user?.nombre}</p>
                        )}
                    </div>
                    <div className="info-group-v2">
                        <label>Contraseña</label>
                        {editPersonal ? (
                            <input 
                                type="password" 
                                name="password" 
                                value={formData.password} 
                                onChange={handleInputChange} 
                                className="input-field-v2" 
                                placeholder="Nueva contraseña (dejar vacío para no cambiar)" 
                            />
                        ) : (
                            <p>••••••••••••••</p>
                        )}
                    </div>
                    <div className="info-group-v2">
                        <label>Correo Electrónico</label>
                        <p>{user?.email}</p>
                    </div>
                    <div className="info-group-v2">
                        <label>Rol de Usuario</label>
                        <span className="tag-rol-v2">{user?.role}</span>
                    </div>
                </div>

                {/* Dirección de Tienda */}
                <div className="perfil-card-v2">
                    <div className="perfil-card-header">
                        <h3><MapPin size={20} strokeWidth={2.5} color="var(--vend-azul)" /> Ubicación del Negocio</h3>
                        {!editAddress ? (
                            <button className="btn-edit-v2" onClick={() => setEditAddress(true)}>Editar</button>
                        ) : (
                            <div className="perfil-card-acciones">
                                <button className="btn-cancel-v2" onClick={() => setEditAddress(false)}>Cancelar</button>
                                <button className="btn-save-v2" onClick={() => handleSave('address')} disabled={loading}>
                                    {loading ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {!editAddress ? (
                        user?.shippingAddress?.direccion ? (
                            <div className="direccion-container-v2">
                                <MapPin size={32} color="var(--vend-azul)" style={{ opacity: 0.8 }} />
                                <div className="address-details-v2">
                                    <h4>{user.shippingAddress.direccion}</h4>
                                    <p>{user.shippingAddress.ciudad}, {user.shippingAddress.provincia}</p>
                                    <p>{user.shippingAddress.pais} • {user.shippingAddress.codigoPostal}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="no-data">No has configurado una ubicación para tu negocio.</p>
                        )
                    ) : (
                        <div className="edit-form-v2">
                            <div className="info-group-v2">
                                <label>Dirección (Calle, número)</label>
                                <input type="text" name="addr_direccion" value={formData.shippingAddress.direccion} onChange={handleInputChange} className="input-field-v2" placeholder="Ej. Av. Siempreviva 123" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                                <div className="info-group-v2">
                                    <label>País</label>
                                    <input type="text" name="addr_pais" value={formData.shippingAddress.pais} onChange={handleInputChange} className="input-field-v2" />
                                </div>
                                <div className="info-group-v2"><label>Provincia/Estado</label><input type="text" name="addr_provincia" value={formData.shippingAddress.provincia} onChange={handleInputChange} className="input-field-v2" /></div>
                                <div className="info-group-v2"><label>Ciudad</label><input type="text" name="addr_ciudad" value={formData.shippingAddress.ciudad} onChange={handleInputChange} className="input-field-v2" /></div>
                                <div className="info-group-v2">
                                    <label>Código Postal</label>
                                    <input type="text" name="addr_codigoPostal" value={formData.shippingAddress.codigoPostal} onChange={handleInputChange} className="input-field-v2" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Perfil Público de Tienda */}
                <PerfilTienda
                    user={user}
                    editStore={editStore}
                    setEditStore={setEditStore}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSave={handleSave}
                    loading={loading}
                />
            </div>
        </div>
    );
}

