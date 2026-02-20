import React, { useState } from 'react';
import './forgot_Password.css';
import logo from '../../resource/logo1.png';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            alert('Por favor, ingresa un email válido');
            setLoading(false);
            return;
        }

        // Simulación de envío de correo
        setTimeout(() => {
            console.log('Recuperar contraseña para:', email);
            alert(`Si el correo ${email} está registrado, recibirás instrucciones para restablecer tu contraseña.`);
            setLoading(false);
            navigate('/login');
        }, 1500);
    };

    return (
        <div className={`forgot-container ${!isDarkMode ? 'light-mode' : ''}`}>
            <div className="forgot-card">
                <button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                >
                    {isDarkMode ? '☀️' : '🌙'}
                </button>

                <div className="forgot-icon">
                    <img src={logo} alt="Nexora Logo" className="logo-img" />
                </div>

                <h1 className="forgot-title">Recuperar Acceso</h1>
                <p className="forgot-subtitle">Ingresa tu correo para recibir un enlace de recuperación</p>

                <form onSubmit={handleSubmit} className="forgot-form">
                    <div className="form-group">
                        <label htmlFor="email">
                            <span className="label-icon">📧</span> Email de recuperación
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="tú@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="forgot-button"
                        disabled={loading}
                    >
                        {loading ? '⏳ Procesando...' : 'Aceptar'}
                    </button>
                </form>

                <div className="forgot-footer">
                    <button
                        type="button"
                        className="link-button"
                        onClick={() => navigate('/login')}
                        disabled={loading}
                    >
                        Volver al inicio de sesión
                    </button>
                </div>
            </div>
        </div>
    );
}
