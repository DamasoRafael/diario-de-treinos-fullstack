import React, { useEffect, useState } from 'react'; 
import { useParams, Link } from 'react-router-dom'; 
import api from '../services/api'; 
import ExercicioCard from '../components/ExercicioCard';

function FichaDetalhe() {
  // 4. usa o useParams para pegar o "id" da url
  const { id } = useParams(); 

  // 5. estados para guardar os dados e o carregamento
  const [nomeFicha, setNomeFicha] = useState('');
  const [exercicios, setExercicios] = useState([]);
  const [loading, setLoading] = useState(true);

  // estadoos para novo formularioo de exercicio
  const [nomeExercicio, setNomeExercicio] = useState('');
  const [series, setSeries] = useState('');
  const [repeticoes, setRepeticoes] = useState('');

  // 6. useEffect() para buscar os dados quando a pagina carregar
  useEffect(() => {
    async function carregarExercicios() {
      try {
        // 7. "telefonar" para o back usando o ID da URL
        // o api.js vai anexar o token JWT automaticamente
        const response = await api.get(`/fichas/${id}/exercicios`);

        // 8. guarda os exercícios que o back enviou
        setExercicios(response.data);
        setLoading(false);

      } catch (error) {
        console.error("Erro ao buscar exercícios:", error);
        setLoading(false);
      }
    }

    carregarExercicios(); 
  }, [id]); // O [id] garante que isto rode novamente se o ID na URL mudar

  const handleCreateExercicio = async (evento) => {
    evento.preventDefault(); // Impede o formulário de recarregar a página

    // validação simples
    if (!nomeExercicio || !series || !repeticoes) {
      alert('Por favor, preencha todos os campos do exercício.');
      return;
    }

    try {
      const response = await api.post(`/fichas/${id}/exercicios`, {
        nomeExercicio: nomeExercicio,
        series: parseInt(series), // Envia 'series' como número
        repeticoes: repeticoes
      });

      // O back devolve o exercicio que acabou de criar
      const novoExercicioCriado = response.data;

      // atualizar a lista de exercícios na tela (sem recarregar)
      setExercicios( (exerciciosAnteriores) => [...exerciciosAnteriores, novoExercicioCriado] );

      // limpa os campos do formulário
      setNomeExercicio('');
      setSeries('');
      setRepeticoes('');

    } catch (error) {
      console.error("Erro ao criar exercício:", error);
      alert('Ocorreu um erro ao criar o exercício.');
    }
  };

  // acao chamada pelo ExercicioCard quando um exercicio eh apagado
const handleDeleteExercicio = (idDoExercicioApagado) => {
  // atualiza a lista de exercícios na tela removendo o que foi apagado
  setExercicios( (exerciciosAnteriores) => 
    exerciciosAnteriores.filter(ex => ex.id !== idDoExercicioApagado)
  );
};

// acao chamada pelo ExercicioCard quando um exercício eh editado
const handleUpdateExercicio = (exercicioAtualizado) => {
  // atualiza a lista de exercícios na tela trocando o antigo pelo novo
  setExercicios( (exerciciosAnteriores) => 
    exerciciosAnteriores.map(ex => 
      ex.id === exercicioAtualizado.id ? exercicioAtualizado : ex
    )
  );
};

  if (loading) {
    return <div>Carregando exercícios...</div>;
  }

  return (
    <div>
      <h1>Exercícios da Ficha (ID: {id})</h1>

      <Link to="/dashboard">Voltar para o Dashboard</Link>

      <hr />

      <div>
        <h2>Adicionar Novo Exercício</h2>
        <form onSubmit={handleCreateExercicio}>
          <div>
            <label>Nome:</label>
            <input 
              type="text"
              value={nomeExercicio}
              onChange={ (e) => setNomeExercicio(e.target.value) }
              placeholder="Ex: Supino Reto"
            />
          </div>
          <div>
            <label>Séries:</label>
            <input 
              type="number" // tipo 'number' para facilitar
              value={series}
              onChange={ (e) => setSeries(e.target.value) }
              placeholder="Ex: 4"
            />
          </div>
          <div>
            <label>Repetições:</label>
            <input 
              type="text"
              value={repeticoes}
              onChange={ (e) => setRepeticoes(e.target.value) }
              placeholder="Ex: 10-12"
            />
          </div>
          <button type="submit">Adicionar Exercício</button>
        </form>
      </div>

      <hr />

      {/* Listar os exercícios */}
      <h2>Exercícios:</h2>
      {exercicios.length === 0 ? (
        <p>Você ainda não tem nenhum exercício nesta ficha.</p>
      ) : (
        <ul>
          {exercicios.map(exercicio => (
            <ExercicioCard 
              key={exercicio.id} 
              exercicio={exercicio}
              onDelete={handleDeleteExercicio}
              onUpdate={handleUpdateExercicio}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default FichaDetalhe;