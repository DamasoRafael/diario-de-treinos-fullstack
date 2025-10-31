import React from 'react';

// 1. Importando os componentes da rota e as suas páginas
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

function App(){
  return (
    // 2. Definindo as rotas
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rota Padrão (Ex: Home) - Por enquanto, vamos redirecionar para o login */}
      <Route path="/" element={<Login />} />
    </Routes>
  );
}

export default App;