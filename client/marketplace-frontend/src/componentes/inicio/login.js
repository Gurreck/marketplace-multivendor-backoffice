import React, { useState } from 'react';
import './login.css';
import logo from '../../resource/logo1.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login({ onRegisterClick, onForgotClick }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const redirectByRole = (role) => {
    switch (role) {
      case 'administrador':
        return '/admin';
      case 'vendedor':
        return '/vendedor';        
      case 'cliente':
        return '/cliente';
      default:
        return '/';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(email, password);
      navigate(redirectByRole(userData.role));
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Error al iniciar sesión. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-container ${!isDarkMode ? 'light-mode' : ''}`}>
      <div className="login-card">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        <div className="login-icon">
          <img src={logo} alt="Nexora Logo" className="logo-img" />
        </div>

        <h1 className="login-title">Nexora</h1>
        <p className="login-subtitle">Inicia sesión en tu cuenta</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">
              <span className="label-icon">📧</span> Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="tú@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <span className="label-icon">🔐</span> Contraseña
            </label>
            <div className="password-input-container">
              <input 
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
              </button>
            </div>
          </div>

          <button
            type="button"
            className="forgot-link-btn"
            onClick={() => navigate('/forgot-password')}
          >
            ¿Olvidaste tu contraseña?
          </button>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? '⏳ Iniciando sesión...' : '➕ Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <span>¿No tienes cuenta? </span>
          <button
            type="button"
            className="link-button"
            onClick={() => navigate('/register')}
          >
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
}