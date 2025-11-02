import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Apaga o token do navegador
    localStorage.removeItem("token");
    // Envia usuario de volta para o login
    navigate("/login");
  };

  return (
    <div>
      <h1>Meu Diário de Treinos (Página Privada)</h1>
      <p>Bem-vindo! Você está logado.</p>

      <button onClick={handleLogout}>Sair (Logout)</button>
    </div>
  );
}

export default Dashboard;
