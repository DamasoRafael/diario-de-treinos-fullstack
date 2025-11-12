import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../services/api'

function Dashboard() {
  const navigate = useNavigate();
  const [fichas, setFichas] = useState([]); // 3. um estado para guardar as fichas
  const [loading, setLoading] = useState(true); // para mostrar "Carregando..."

  // 4. o useEffect() roda uma vez assim que o componente é montado
  useEffect(() => {

    // 5. "liga" para a rota protegida
    async function carregarFichas() {
      try {
        // O "api.js" vai automaticamente pegar o token do localStorage
        // e anexa a esta requisição GET /fichas.
        const response = await api.get('/fichas');

        // 6. Se o deixar passar, guarda os dados no estado
        setFichas(response.data);
        setLoading(false);
      } catch (error) {
        // 7. se (token inválido ou expirado)
        console.error("Erro ao buscar fichas:", error);
        setLoading(false);
        // por agora apenas registra erro, futuramente posso forcar um logout
      }
    }

    carregarFichas(); // chama nova funcao
  }, []); // O [] vazio garante que isto rode apenas uma vez

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // 9. mostrar um feedback de carregamento
  if (loading) {
    return <div>Carregando fichas...</div>;
  }

  return (
    <div>
      <h1>Meu Diário de Treinos</h1>
      <p>Bem-vindo! Você está logado.</p>

      <button onClick={handleLogout}>
        Sair (Logout)
      </button>

      {/* 10. nova secao de fichas */}
      <h2>Minhas Fichas de Treino:</h2>
      {fichas.length === 0 ? (
        <p>Você ainda não tem nenhuma ficha de treino.</p>
      ) : (
        <ul>
          {fichas.map(ficha => (
            <li key={ficha.id}>{ficha.nomeFicha}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;
