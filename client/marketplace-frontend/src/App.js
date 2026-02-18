import React, { useState } from 'react';
import './App.css';

import Login from './Inicio/login';
import Register from './Inicio/register';
import ForgotPassword from './Inicio/forgot_Password';
import Principal from './pages/page'; 

function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'forgot-password', 'principal'
  const [userEmail, setUserEmail] = useState('');

  const handleLoginSuccess = (email) => {
    setUserEmail(email);
    setCurrentView('principal');
  };

  const handleLogout = () => {
    setUserEmail('');
    setCurrentView('login');
  };

  return (
    <div className="App">
      {currentView === 'register' ? (
        <Register onBackToLogin={() => setCurrentView('login')} onRegisterSuccess={(email) => handleLoginSuccess(email)} />
      ) : currentView === 'forgot-password' ? (
        <ForgotPassword onBackToLogin={() => setCurrentView('login')} />
      ) : currentView === 'principal' ? (
        <Principal userEmail={userEmail} onLogout={handleLogout} />
      ) : (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onRegisterClick={() => setCurrentView('register')}
          onForgotClick={() => setCurrentView('forgot-password')}
        />
      )}
    </div>
  );
}

export default App;