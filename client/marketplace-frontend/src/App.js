import React, { useState } from 'react';
import './App.css';
import Login from './componentes/login';
import Register from './componentes/register';

function App() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="App">
      {showRegister ? (
        <Register onBackToLogin={() => setShowRegister(false)} />
      ) : (
        <Login onRegisterClick={() => setShowRegister(true)} />
      )}
    </div>
  );
}

export default App;
