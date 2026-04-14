import React from 'react';
import './PerfilTienda.css';
import { Store, Image as ImageIcon } from 'lucide-react';
import '../Perfil/PerfilVendedor/PerfilVendedor.css';

/**
 * Sección de Perfil Público de la tienda del vendedor.
 */
export default function PerfilTienda({
    user,
    editStore,
    setEditStore,
    formData,
    handleInputChange,
    handleSave,
    loading
}) {
    return (
        <div className="perfil-card-v2" style={{ gridColumn: '1 / -1' }}>
            <div className="perfil-card-header">
                <h3><Store size={20} strokeWidth={2.5} color="var(--vend-azul)" /> Perfil Público</h3>
                {!editStore ? (
                    <button className="btn-edit-v2" onClick={() => setEditStore(true)}>Editar</button>
                ) : (
                    <div className="perfil-card-acciones">
                        <button className="btn-cancel-v2" onClick={() => setEditStore(false)}>Cancelar</button>
                        <button className="btn-save-v2" onClick={() => handleSave('store')} disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                )}
            </div>
            
            <div className="info-group-v2">
                <label>Descripción de la Tienda</label>
                {editStore ? (
                    <textarea 
                        name="storeDescription" 
                        value={formData.storeDescription} 
                        onChange={handleInputChange} 
                        className="input-field-v2" 
                        style={{ minHeight: '120px', resize: 'vertical' }}
                        placeholder="Cuéntale a tus clientes sobre tu negocio..."
                    />
                ) : (
                    <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                        {user?.storeDescription || <span style={{ color: '#4b5563', fontStyle: 'italic' }}>Sin descripción (haz clic en editar para añadir una)</span>}
                    </p>
                )}
            </div>
            
            <div className="info-group-v2">
                <label><ImageIcon size={14} style={{ marginBottom: '-2px' }} /> Banner de la Tienda (URL)</label>
                {editStore ? (
                    <input 
                        type="text" 
                        name="storeBanner" 
                        value={formData.storeBanner} 
                        onChange={handleInputChange} 
                        className="input-field-v2" 
                        placeholder="https://ejemplo.com/banner.jpg"
                    />
                ) : (
                    user?.storeBanner ? (
                        <img src={user.storeBanner} alt="Banner Tienda" className="store-banner-preview" />
                    ) : (
                        <div className="no-banner-placeholder">
                            Sin imagen de banner configurada
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

