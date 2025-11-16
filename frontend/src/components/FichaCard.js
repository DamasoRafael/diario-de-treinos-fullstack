import React from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

// recebe a ficha inteira e duas funções (onDelete, onUpdate)
// como "props" (propriedades) vindas do Dashboard.
function FichaCard({ ficha, onDelete, onUpdate }) {

  // --- AÇÃO DE DELETAR ---
  const handleDelete = async () => {
    // Pede confirmação antes de apagar
    const confirmar = window.confirm(`Tem a certeza que deseja apagar a ficha: "${ficha.nomeFicha}"?`);

    if (confirmar) {
      try {
        // 1. "telefona" para a rota DELETE do back
        await api.delete(`/fichas/${ficha.id}`);

        // 2. avisa o "pai" (Dashboard) que esta ficha foi apagada
        onDelete(ficha.id);

      } catch (error) {
        console.error("Erro ao deletar ficha:", error);
        alert('Ocorreu um erro ao deletar a ficha.');
      }
    }
  };

  // --- AÇÃO DE EDITAR ---
  const handleUpdate = async () => {
    // pede ao usuário o novo nome
    const novoNome = window.prompt("Digite o novo nome para a ficha:", ficha.nomeFicha);

    // se o usuário não cancelar e o nome for válido
    if (novoNome && novoNome !== ficha.nomeFicha) {
      try {
        // 1. "Telefona" para a rota PUT que criámos no back-end
        const response = await api.put(`/fichas/${ficha.id}`, {
          nomeFicha: novoNome
        });

        // 2. avisa o "pai" (Dashboard) que esta ficha foi atualizada
        onUpdate(response.data); // Envia a ficha atualizada de volta

      } catch (error) {
        console.error("Erro ao atualizar ficha:", error);
        alert('Ocorreu um erro ao atualizar a ficha.');
      }
    }
  };

  return (
  <li>
    {/* O nome da ficha agora é um link clicável */}
    <Link to={`/ficha/${ficha.id}`}>
      {ficha.nomeFicha}
    </Link>

    <button onClick={handleUpdate} style={{ marginLeft: '10px' }}>
      Editar
    </button>
    <button onClick={handleDelete} style={{ marginLeft: '5px' }}>
      Apagar
    </button>
  </li>
);
}

export default FichaCard;