// --- Importações Essenciais ---
import React, { useState } from 'react';
import api from '../services/api';
import Modal from './Modal'; // o componente de Modal generico

function ExercicioCard({ exercicio, onDelete, onUpdate }) {
  
  // --- Estados para os Modais ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // --- Estados para o Formulário de Edição ---
  // preciso guardar os 3 campos do exercício
  const [editNome, setEditNome] = useState(exercicio.nomeExercicio);
  const [editSeries, setEditSeries] = useState(exercicio.series);
  const [editRepeticoes, setEditRepeticoes] = useState(exercicio.repeticoes);

  
  // --- AÇÃO DE DELETAR (agora abre o Modal) ---
  const handleDelete = () => {
    // em vez de 'window.confirm', apenas abre o modal
    setIsDeleteModalOpen(true); 
  };

  // funcao que o Modal de "Apagar" vai chamar
  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/exercicios/${exercicio.id}`);
      onDelete(exercicio.id); // avisa o "pai" (FichaDetalhe)
      setIsDeleteModalOpen(false); // fecha o modal
    } catch (error) {
      console.error("Erro ao deletar exercício:", error);
      alert('Ocorreu um erro ao deletar o exercício.');
      setIsDeleteModalOpen(false);
    }
  };

  // --- AÇÃO DE EDITAR (agora abre o Modal) ---
  const handleOpenEditModal = () => {
    // antes de abrir o modal, garanto que os campos
    // estao preenchidos com os dados atuais do exercicio
    setEditNome(exercicio.nomeExercicio);
    setEditSeries(exercicio.series);
    setEditRepeticoes(exercicio.repeticoes);
    setIsEditModalOpen(true); // abre o modal
  };

  // funcao que o Modal de "Editar" vai chamar
  const handleSubmitEdit = async (evento) => {
    evento.preventDefault(); 
    try {
      const response = await api.put(`/exercicios/${exercicio.id}`, {
        nomeExercicio: editNome,
        series: parseInt(editSeries),
        repeticoes: editRepeticoes
      });

      onUpdate(response.data); // avisa o "pai" (FichaDetalhe)
      setIsEditModalOpen(false); // fecha o modal

    } catch (error) {
      console.error("Erro ao atualizar exercício:", error);
      alert('Ocorreu um erro ao atualizar o exercício.');
    }
  };

  return (
    // react.fragment permite retornar mais de um item (<> e </>)
    <>
      {/* A nossa <li> original */}
      <li>
        <strong>{exercicio.nomeExercicio}</strong> - {exercicio.series} séries x {exercicio.repeticoes} reps
        
        <button 
          onClick={handleOpenEditModal} // abre o Modal de Edicao
          style={{ marginLeft: '10px' }}
        >
          Editar
        </button>
        
        <button 
          onClick={handleDelete} // abre o Modal de Apagar
          style={{ marginLeft: '5px' }}
        >
          Apagar
        </button>
      </li>

      {/* --- Modal de Edicao --- */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <h2>Editar Exercício</h2>
        <form onSubmit={handleSubmitEdit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label>Nome:</label>
            <input 
              type="text"
              value={editNome}
              onChange={(e) => setEditNome(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label>Séries:</label>
            <input 
              type="number"
              value={editSeries}
              onChange={(e) => setEditSeries(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label>Repetições:</label>
            <input 
              type="text"
              value={editRepeticoes}
              onChange={(e) => setEditRepeticoes(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <button type="submit" style={{ marginTop: '15px' }}>
            Salvar Alterações
          </button>
        </form>
      </Modal>

      {/* --- Modal de "Apagar" --- */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <h2>Confirmar Exclusão</h2>
        <p>Tem a certeza que deseja apagar o exercício: "{exercicio.nomeExercicio}"?</p>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            onClick={() => setIsDeleteModalOpen(false)} 
            style={{ backgroundColor: '#aaa' }}
          >
            Cancelar
          </button>
          <button 
            onClick={handleConfirmDelete} 
            style={{ backgroundColor: '#dc3545' }} // Cor vermelha
          >
            Sim, Apagar
          </button>
        </div>
      </Modal>
    </>
  );
}

export default ExercicioCard;