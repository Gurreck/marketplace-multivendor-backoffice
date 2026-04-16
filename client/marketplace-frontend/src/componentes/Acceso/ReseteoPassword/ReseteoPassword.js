import React, { useState } from 'react';
import './ReseteoPassword.css';
import logo from '../../../resource/logo1.png';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Sun,
    Moon,
    Lock,
    CheckCircle,
    AlertTriangle,
    Loader2,
    ArrowLeft,
    Eye,
    EyeOff
} from 'lucide-react';

export default function ResetPassword() {
    const navigate = useNavigate();
    const { token } = useParams();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        if (!password || !confirmPassword) {
            setError('Debes completar ambos campos');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/auth/ReseteoPassword/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password,
                    confirmPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'No se pudo restablecer la contraseña');
            }

            setMessage(data.message || 'Contraseña actualizada correctamente');
            setPassword('');
            setConfirmPassword('');

            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Error al restablecer la contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`contenedor-reset ${!isDarkMode ? 'modo-claro' : ''}`}>
            <div className="tarjeta-reset">
                <button
                    className="alternador-tema"
                    onClick={toggleTheme}
                    title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="icono-reset">
                    <img src={logo} alt="Nexora Logo" className="imagen-logotipo" />
                </div>

                <h2 className="titulo-reset">Restablecer contraseña</h2>
                <p className="subtitulo-reset">
                    Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta
                </p>

                {error && (
                    <div className="error-reset">
                        <AlertTriangle size={18} /> {error}
                    </div>
                )}

                {message && (
                    <div className="mensaje-exito-reset">
                        <CheckCircle size={18} /> {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="formulario-reset">
                    <div className="grupo-formulario">
                        <label htmlFor="password">
                            <span className="icono-etiqueta"><Lock size={18} /></span>
                            Nueva contraseña
                        </label>
                        <div className="contenedor-entrada-icono">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                placeholder="Ingresa tu nueva contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                            <button
                                type="button"
                                className="btn-ver-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="grupo-formulario">
                        <label htmlFor="confirmPassword">
                            <span className="icono-etiqueta"><Lock size={18} /></span>
                            Confirmar contraseña
                        </label>
                        <div className="contenedor-entrada-icono">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                placeholder="Confirma tu nueva contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                            <button
                                type="button"
                                className="btn-ver-password"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`boton-reset ${loading ? 'cargando' : ''}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animacion-giro" size={20} />
                                Procesando...
                            </>
                        ) : (
                            'Guardar nueva contraseña'
                        )}
                    </button>
                </form>

                <div className="pie-reset">
                    <button
                        type="button"
                        className="boton-enlace"
                        onClick={() => navigate('/login')}
                        disabled={loading}
                    >
                        <ArrowLeft size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                        Volver al inicio de sesión
                    </button>
                </div>
            </div>
        </div>
    );
}