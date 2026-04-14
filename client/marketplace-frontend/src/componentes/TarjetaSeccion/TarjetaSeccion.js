import React from 'react';
import './TarjetaSeccion.css';
import { CreditCard } from 'lucide-react';

/**
 * Sección de tarjeta de débito/crédito del perfil del cliente.
 */
export default function TarjetaSeccion({
    user,
    editCard,
    setEditCard,
    formData,
    handleInputChange,
    handleSave,
    loading
}) {
    return (
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
    );
}

