import React from 'react';
import api from '../services/api';

// esse componente recebe o "exercicio" e as funções onDelete e onUpdate
// como props (propriedades) vindas da página FichaDetalhe.
function ExercicioCard({ exercicio, onDelete, onUpdate }) {

  // --- AÇÃO DE DELETAR ---
  const handleDelete = async () => {
    const confirmar = window.confirm(`Tem a certeza que deseja apagar o exercício: "${exercicio.nomeExercicio}"?`);

    if (confirmar) {
      try {
        // 1. telefona para a rota DELETE que do back-end
        await api.delete(`/exercicios/${exercicio.id}`);

        // 2. avisa o "pai" (FichaDetalhe) que este exercício foi apagado
        onDelete(exercicio.id);

      } catch (error) {
        console.error("Erro ao deletar exercício:", error);
        alert('Ocorreu um erro ao deletar o exercício.');
      }
    }
  };

  // --- AÇÃO DE EDITAR ---
  const handleUpdate = async () => {
    // Pede ao usuário os novos dados
    // ideal seria eu usar modal, mas vou sem por enquanto
    const novoNome = window.prompt("Novo nome:", exercicio.nomeExercicio);
    const novasSeries = window.prompt("Novas séries:", exercicio.series);
    const novasRepeticoes = window.prompt("Novas repetições:", exercicio.repeticoes);

    // se o usuário nao cancelar
    if (novoNome && novasSeries && novasRepeticoes) {
      try {
        // 1. rota put do back
        const response = await api.put(`/exercicios/${exercicio.id}`, {
          nomeExercicio: novoNome,
          series: parseInt(novasSeries),
          repeticoes: novasRepeticoes
        });

        // 2. avisa o "pai" (FichaDetalhe) que este exercício foi atualizado
        onUpdate(response.data); // Envia o exercício atualizado de volta

      } catch (error) {
        console.error("Erro ao atualizar exercício:", error);
        alert('Ocorreu um erro ao atualizar o exercício.');
      }
    }
  };

  return (
    <li>
      <strong>{exercicio.nomeExercicio}</strong> - {exercicio.series} séries x {exercicio.repeticoes} reps
      <button onClick={handleUpdate} style={{ marginLeft: '10px' }}>
        Editar
      </button>
      <button onClick={handleDelete} style={{ marginLeft: '5px' }}>
        Apagar
      </button>
    </li>
  );
}

export default ExercicioCard;