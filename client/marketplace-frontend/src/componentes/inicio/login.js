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
            <input
              type="password"
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
              className="forgot-link-btn"
              onClick={() => navigate('/forgot-password')}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

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