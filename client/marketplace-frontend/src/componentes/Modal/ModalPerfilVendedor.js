import React, { useState, useEffect, useCallback } from 'react';
import './ModalLogin.css';
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

    // Variables de tema
    const baseCardBg = isDarkMode ? '#000B18' : '#ffffff';
    const borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const textColor = isDarkMode ? 'white' : '#1f2937';
    const softTextColor = isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
    const headerBg = vendor?.storeBanner 
        ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url(${vendor.storeBanner}) center/cover no-repeat`
        : (isDarkMode ? 'linear-gradient(135deg, rgba(0,148,255,0.2) 0%, rgba(236,72,153,0.2) 100%)' : 'linear-gradient(135deg, rgba(0,148,255,0.1) 0%, rgba(236,72,153,0.1) 100%)');
    const tabBg = isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)';
    const itemBg = isDarkMode ? 'rgba(255,255,255,0.03)' : '#f9fafb';
    const itemBorder = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

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
        <div className="capa-modal" onClick={onClose} style={{ zIndex: 9999 }}>
            <div 
                className="contenido-modal" 
                onClick={e => e.stopPropagation()} 
                style={{ width: '90%', maxWidth: '600px', padding: '0', overflow: 'hidden', background: baseCardBg, border: `1px solid ${borderColor}` }}
            >
                {/* Header Profile */}
                <div style={{ position: 'relative', background: headerBg, padding: '40px 20px 20px', textAlign: 'center', borderBottom: `1px solid ${borderColor}` }}>
                    <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: textColor, cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                    
                    <img 
                        src={vendor.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.nombre || 'V')}&background=0ea5e9&color=fff&size=100`} 
                        alt="Foto del vendedor" 
                        style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #0094FF', objectFit: 'cover', margin: '0 auto 10px', display: 'block' }} 
                    />
                    <h2 style={{ margin: '0 0 5px 0', fontSize: '22px', color: vendor?.storeBanner ? 'white' : textColor }}>{vendor.nombre}</h2>
                    <p style={{ margin: '0 0 10px 0', color: vendor?.storeBanner ? 'rgba(255,255,255,0.8)' : softTextColor, fontSize: '14px' }}>Vendedor Oficial en Nexora</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', color: vendor?.storeBanner ? 'rgba(255,255,255,0.8)' : softTextColor, fontSize: '13px' }}>
                        {vendor.shippingAddress?.ciudad && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={14} /> {vendor.shippingAddress.ciudad}, {vendor.shippingAddress.pais}
                            </span>
                        )}
                        {vendor.createdAt && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={14} /> Miembro desde {new Date(vendor.createdAt).getFullYear()}
                            </span>
                        )}
                    </div>

                    {vendor.storeDescription && (
                        <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontStyle: 'italic', maxWidth: '80%', margin: '15px auto 0' }}>
                            {vendor.storeDescription}
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${borderColor}` }}>
                    <div style={{ flex: 1, padding: '15px', textAlign: 'center', borderRight: `1px solid ${borderColor}` }}>
                        <Package size={20} color="#0094FF" style={{ marginBottom: '5px' }} />
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: textColor }}>{vendorProducts.length}</div>
                        <div style={{ fontSize: '12px', color: softTextColor }}>Productos Activos</div>
                    </div>
                    <div style={{ flex: 1, padding: '15px', textAlign: 'center', borderRight: `1px solid ${borderColor}` }}>
                        <Star size={20} color="#fbbf24" style={{ marginBottom: '5px' }} />
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: textColor }}>{avgRating} <span style={{fontSize:'12px', color: softTextColor}}>/ 5</span></div>
                        <div style={{ fontSize: '12px', color: softTextColor }}>Valoración</div>
                    </div>
                    <div style={{ flex: 1, padding: '15px', textAlign: 'center' }}>
                        <MessageSquare size={20} color="#34d399" style={{ marginBottom: '5px' }} />
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: textColor }}>{vendorComments.length}</div>
                        <div style={{ fontSize: '12px', color: softTextColor }}>Reseñas</div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${borderColor}`, background: tabBg }}>
                    <button 
                        onClick={() => setActiveTab('products')}
                        style={{ flex: 1, padding: '12px', background: 'none', border: 'none', color: activeTab === 'products' ? '#0094FF' : softTextColor, borderBottom: activeTab === 'products' ? '2px solid #0094FF' : '2px solid transparent', fontWeight: activeTab === 'products' ? 'bold' : 'normal', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        Catálogo ({vendorProducts.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('reviews')}
                        style={{ flex: 1, padding: '12px', background: 'none', border: 'none', color: activeTab === 'reviews' ? '#0094FF' : softTextColor, borderBottom: activeTab === 'reviews' ? '2px solid #0094FF' : '2px solid transparent', fontWeight: activeTab === 'reviews' ? 'bold' : 'normal', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        Reseñas ({vendorComments.length})
                    </button>
                </div>

                {/* Content Area */}
                <div style={{ padding: '20px', height: '350px', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <p style={{ color: softTextColor }}>Cargando información del vendedor...</p>
                        </div>
                    ) : activeTab === 'products' ? (
                        vendorProducts.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px', overflowY: 'auto', paddingRight: '5px' }}>
                                {vendorProducts.slice(0, 12).map(prod => (
                                    <div 
                                        key={prod._id} 
                                        onClick={() => {
                                            onClose();
                                            navigate(`/product/${prod._id}`);
                                        }}
                                        style={{ 
                                            background: itemBg, 
                                            borderRadius: '8px', 
                                            border: `1px solid ${itemBorder}`, 
                                            padding: '10px', 
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            textAlign: 'center'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.borderColor = '#0094FF'}
                                        onMouseOut={e => e.currentTarget.style.borderColor = itemBorder}
                                    >
                                        <img src={prod.images?.[0]?.url || "https://via.placeholder.com/80"} alt={prod.name} style={{ width: '100%', height: '80px', objectFit: 'contain', marginBottom: '8px', borderRadius: '4px' }} />
                                        <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</p>
                                        <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: '#0094FF' }}>₡{prod.price.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: softTextColor, textAlign: 'center', padding: '20px 0' }}>No hay productos disponibles por ahora.</p>
                        )
                    ) : (
                        vendorComments.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {vendorComments.map(comment => (
                                    <div key={comment._id} style={{ background: itemBg, padding: '15px', borderRadius: '8px', border: `1px solid ${itemBorder}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: 'bold', color: textColor, fontSize: '14px' }}>{comment.user?.nombre || 'Usuario Anónimo'}</span>
                                            <span style={{ color: softTextColor, fontSize: '12px' }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div style={{ color: '#0094FF', fontSize: '12px', marginBottom: '5px' }}>Producto: {comment.product?.name}</div>
                                        <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                                            {[...Array(5)].map((star, i) => (
                                                <Star key={i} size={14} color={i < comment.rating ? "#fbbf24" : (isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)")} fill={i < comment.rating ? "#fbbf24" : "transparent"} />
                                            ))}
                                        </div>
                                        <p style={{ margin: 0, color: textColor, opacity: 0.8, fontSize: '14px', lineHeight: '1.4' }}>{comment.text}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: softTextColor, textAlign: 'center', padding: '20px 0' }}>No hay reseñas para este vendedor aún.</p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
