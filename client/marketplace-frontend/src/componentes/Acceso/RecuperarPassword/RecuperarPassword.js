import React, { useState } from 'react';
import './RecuperarPassword.css';
import logo from '../../../resource/logo1.png';
import { useNavigate } from 'react-router-dom';
import {
    Sun,
    Moon,
    Mail,
    CheckCircle,
    AlertTriangle,
    Loader2,
    ArrowLeft
} from 'lucide-react';

export default function RecuperarPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        setError('Por favor, ingresa un email válido');
        setLoading(false);
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Ocurrió un error al procesar la solicitud');
        }

        setMessage(
            data.message || 'Si el correo existe, se enviará un enlace de recuperación.'
        );
        setEmail('');
    } catch (err) {
        setError(err.message || 'Error al enviar la solicitud');
    } finally {
        setLoading(false);
    }
};

    return (
        <div className={`contenedor-olvido ${!isDarkMode ? 'modo-claro' : ''}`}>
            <div className="tarjeta-olvido">
                <button
                    className="alternador-tema"
                    onClick={toggleTheme}
                    title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="icono-olvido">
                    <img src={logo} alt="Nexora Logo" className="imagen-logotipo" />
                </div>

                <h2 className="titulo-olvido">¿Olvidaste tu contraseña?</h2>
                <p className="subtitulo-olvido">
                    Ingresa tu email para recibir un enlace de recuperación
                </p>

                {error && (
                    <div className="error-olvido">
                        <AlertTriangle size={18} /> {error}
                    </div>
                )}

                {message && (
                    <div className="mensaje-exito-olvido">
                        <CheckCircle size={18} /> {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="formulario-olvido">
                    <div className="grupo-formulario">
                        <label htmlFor="email">
                            <span className="icono-etiqueta">
                                <Mail size={18} />
                            </span>
                            {' '}Email de recuperación
                        </label>

                        <div className="contenedor-entrada-icono">
                            <input
                                type="email"
                                id="email"
                                placeholder="tú@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`boton-olvido ${loading ? 'cargando' : ''}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animacion-giro" size={20} />
                                Procesando...
                            </>
                        ) : (
                            'Enviar instrucciones'
                        )}
                    </button>
                </form>

                <div className="pie-olvido">
                    <button
                        type="button"
                        className="boton-enlace"
                        onClick={() => navigate('/login')}
                        disabled={loading}
                    >
                        <ArrowLeft
                            size={16}
                            style={{ marginRight: '5px', verticalAlign: 'middle' }}
                        />
                        Volver al inicio de sesión
                    </button>
                </div>
            </div>
        </div>
    );
}