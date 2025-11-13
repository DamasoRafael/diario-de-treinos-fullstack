import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../services/api'
import FichaCard from '../components/FichaCard'; 

function Dashboard() {
  const navigate = useNavigate();
  const [fichas, setFichas] = useState([]); // 3. um estado para guardar as fichas
  const [loading, setLoading] = useState(true); // para mostrar "Carregando..."

  // 1a adicao para o CRUD na dashboard
  // novo estado para guardar o nome da nova ficha
  const [nomeNovaFicha, setNomeNovaFicha] = useState('');

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

  // --- 2a adicao: funcao para criar uma nova ficha ---
  const handleCreateFicha = async (evento) => {
    evento.preventDefault(); // impede o formulario de recarregar a pagina

    // validacao simples
    if (!nomeNovaFicha) {
      alert('Por favor, dê um nome para a ficha.');
      return;
    }

    try {
      // 1. telefona para a rota post que foi criada no back
      const response = await api.post('/fichas', {
        nomeFicha: nomeNovaFicha
      });

      // 2. back devolve a ficha que foi criada
      const novaFichaCriada = response.data;

      // 3. atualiza a lista de fichas na TELA (sem recarregar)
      //    adiciona a nova ficha à lista de fichas que ja tinha
      setFichas( (fichasAnteriores) => [...fichasAnteriores, novaFichaCriada] );

      // 4. limpa o campo de texto
      setNomeNovaFicha('');

    } catch (error) {
      console.error("Erro ao criar ficha:", error);
      alert('Ocorreu um erro ao criar a ficha.');
    }
  };

  const handleDeleteFicha = (idDaFichaApagada) => {
  // atualiza a lista de fichas na tela removendo a que foi apagada
  setFichas( (fichasAnteriores) => 
    fichasAnteriores.filter(ficha => ficha.id !== idDaFichaApagada)
  );
};

const handleUpdateFicha = (fichaAtualizada) => {
  // atualiza a lista de fichas na tela trocando a antiga pela nova
  setFichas( (fichasAnteriores) => 
    fichasAnteriores.map(ficha => 
      ficha.id === fichaAtualizada.id ? fichaAtualizada : ficha
    )
  );
};

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return <div>Carregando fichas...</div>;
  }

  return (
    <div>
      <h1>Meu Diário de Treinos (Página Privada!)</h1>
      <p>Bem-vindo! Você está logado.</p>
      
      <button onClick={handleLogout}>
        Sair (Logout)
      </button>

      <hr />

      {/* --- ADIÇÃO 3: O formulário para criar a nova ficha --- */}
      <div>
        <h2>Criar Nova Ficha de Treino</h2>
        <form onSubmit={handleCreateFicha}>
          <label>Nome da Ficha:</label>
          <input 
            type="text"
            value={nomeNovaFicha}
            onChange={ (e) => setNomeNovaFicha(e.target.value) }
          />
          <button type="submit">Criar Ficha</button>
        </form>
      </div>

      <hr />

      {/* --- ADIÇÃO 4: A lista de fichas (já existia) --- */}
      <h2>Minhas Fichas de Treino:</h2>
      {fichas.length === 0 ? (
        <p>Você ainda não tem nenhuma ficha de treino.</p>
      ) : (
        <ul>
          {fichas.map(ficha => (
            <FichaCard 
             key={ficha.id} 
             ficha={ficha} 
             onDelete={handleDeleteFicha}
             onUpdate={handleUpdateFicha}
          />
      ))} 
    </ul>
      )}
    </div>
  );
}

export default Dashboard;
