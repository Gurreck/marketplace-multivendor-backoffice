import React, { useState, useEffect, useCallback } from 'react';
import './ModalLogin.css';
import './ModalPerfilVendedor.css';
import { Package, X, Star, MapPin, Calendar, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export default function ModalPerfilVendedor({ isOpen, onClose, vendor }) {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    
    const [vendorProducts, setVendorProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [vendorComments, setVendorComments] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [activeTab, setActiveTab] = useState('products'); // 'products' o 'reviews'

    // El banner dinámico requiere estilo en línea para la imagen de fondo,
    // pero los colores base provienen del CSS de .modal-vendedor-overlay
    const headerBg = vendor?.storeBanner 
        ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url(${vendor.storeBanner}) center/cover no-repeat`
        : 'var(--vend-gradient)';
        
    const hasBanner = !!vendor?.storeBanner;

    const fetchVendorData = useCallback(async () => {
        try {
            setLoading(true);
            // Fetch products
            const response = await api.get('/products');
            if (response.data.success) {
                const misTabs = response.data.data.filter(
                    p => p.vendor?._id === vendor._id && p.isActive !== false
                );
                setVendorProducts(misTabs);
            }

            // Fetch reviews
            const commResponse = await api.get(`/comments/vendor/${vendor._id}`);
            if (commResponse.data.success) {
                setVendorComments(commResponse.data.data);
                setAvgRating(commResponse.data.averageRating);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [vendor]);

    useEffect(() => {
        if (isOpen && vendor?._id) {
            fetchVendorData();
        }
    }, [isOpen, vendor, fetchVendorData]);

    if (!isOpen || !vendor) return null;

    return (
        <div className={`capa-modal modal-vendedor-overlay ${!isDarkMode ? 'modo-claro' : ''}`} onClick={onClose}>
            <div className="modal-vendedor-content" onClick={e => e.stopPropagation()}>
                {/* Header Profile */}
                <div className="modal-vendedor-header" style={{ background: headerBg }}>
                    <button onClick={onClose} className="modal-vendedor-close-btn">
                        <X size={24} />
                    </button>
                    
                    <img 
                        src={vendor.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.nombre || 'V')}&background=0ea5e9&color=fff&size=100`} 
                        alt="Foto del vendedor" 
                        className="modal-vendedor-avatar"
                    />
                    <h2 className="modal-vendedor-name" style={{ color: hasBanner ? 'white' : 'var(--vend-text)' }}>
                        {vendor.nombre}
                    </h2>
                    <p className="modal-vendedor-subtitle" style={{ color: hasBanner ? 'rgba(255,255,255,0.8)' : 'var(--vend-text-soft)' }}>
                        Vendedor Oficial en Nexora
                    </p>
                    
                    <div className="modal-vendedor-info-row" style={{ color: hasBanner ? 'rgba(255,255,255,0.8)' : 'var(--vend-text-soft)' }}>
                        {vendor.shippingAddress?.ciudad && (
                            <span className="modal-vendedor-info-item">
                                <MapPin size={14} /> {vendor.shippingAddress.ciudad}, {vendor.shippingAddress.pais}
                            </span>
                        )}
                        {vendor.createdAt && (
                            <span className="modal-vendedor-info-item">
                                <Calendar size={14} /> Miembro desde {new Date(vendor.createdAt).getFullYear()}
                            </span>
                        )}
                    </div>

                    {vendor.storeDescription && (
                        <div className="modal-vendedor-desc">
                            {vendor.storeDescription}
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="modal-vendedor-stats-row">
                    <div className="modal-vendedor-stat-box">
                        <Package size={20} color="#0094FF" style={{ marginBottom: '5px' }} />
                        <div className="modal-vendedor-stat-value">{vendorProducts.length}</div>
                        <div className="modal-vendedor-stat-label">Productos Activos</div>
                    </div>
                    <div className="modal-vendedor-stat-box">
                        <Star size={20} color="#fbbf24" style={{ marginBottom: '5px' }} />
                        <div className="modal-vendedor-stat-value">{avgRating} <span style={{fontSize:'12px', color: 'var(--vend-text-soft)'}}>/ 5</span></div>
                        <div className="modal-vendedor-stat-label">Valoración</div>
                    </div>
                    <div className="modal-vendedor-stat-box">
                        <MessageSquare size={20} color="#34d399" style={{ marginBottom: '5px' }} />
                        <div className="modal-vendedor-stat-value">{vendorComments.length}</div>
                        <div className="modal-vendedor-stat-label">Reseñas</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="modal-vendedor-tabs">
                    <button 
                        onClick={() => setActiveTab('products')}
                        className={`modal-vendedor-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                    >
                        Catálogo ({vendorProducts.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('reviews')}
                        className={`modal-vendedor-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                    >
                        Reseñas ({vendorComments.length})
                    </button>
                </div>

                {/* Content Area */}
                <div className="modal-vendedor-body">
                    {loading ? (
                        <div className="modal-vendedor-loading">
                            <p>Cargando información del vendedor...</p>
                        </div>
                    ) : activeTab === 'products' ? (
                        vendorProducts.length > 0 ? (
                            <div className="modal-vendedor-products-grid">
                                {vendorProducts.slice(0, 12).map(prod => (
                                    <div 
                                        key={prod._id} 
                                        onClick={() => {
                                            onClose();
                                            navigate(`/product/${prod._id}`);
                                        }}
                                        className="modal-vendedor-product-card"
                                    >
                                        <img src={prod.images?.[0]?.url || "https://via.placeholder.com/80"} alt={prod.name} className="modal-vendedor-product-img" />
                                        <p className="modal-vendedor-product-title">{prod.name}</p>
                                        <p className="modal-vendedor-product-price">₡{prod.price.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="modal-vendedor-empty-msg">No hay productos disponibles por ahora.</p>
                        )
                    ) : (
                        vendorComments.length > 0 ? (
                            <div className="modal-vendedor-reviews-list">
                                {vendorComments.map(comment => (
                                    <div key={comment._id} className="modal-vendedor-review-card">
                                        <div className="modal-vendedor-review-header">
                                            <span className="modal-vendedor-review-user">{comment.user?.nombre || 'Usuario Anónimo'}</span>
                                            <span className="modal-vendedor-review-date">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="modal-vendedor-review-prod">Producto: {comment.product?.name}</div>
                                        <div className="modal-vendedor-review-stars">
                                            {[...Array(5)].map((star, i) => (
                                                <Star 
                                                    key={i} 
                                                    size={14} 
                                                    color={i < comment.rating ? "#fbbf24" : "var(--vend-item-border)"} 
                                                    fill={i < comment.rating ? "#fbbf24" : "transparent"} 
                                                />
                                            ))}
                                        </div>
                                        <p className="modal-vendedor-review-text">{comment.text}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="modal-vendedor-empty-msg">No hay reseñas para este vendedor aún.</p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
