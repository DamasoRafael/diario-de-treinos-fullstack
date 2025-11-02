import React from 'react';
import { Navigate } from 'react-router-dom';

// Esse componente vai "embrulhar" as paginas privadas
// Children eh a pagina que esta protegendo (ex: dashboard)

function ProtectedRoute({ children }) {
  // 1. Verifica se o token existe no local storage
  const token = localStorage.getItem("token");

  // 2. Se nao exisitr token
  if (!token) {
    // expulsa o usuario para a pagina de login
    // O navigate direciona
    return <Navigate to="/login" replace />;
  }

  // 3. Se o token existir, permitir acesso
  // Renderiza a pagina que estava tentando ser acessado (children)
  return children;
}

export default ProtectedRoute;
