// Importações (o 'useState' já deve estar aí)
import React, { useState } from 'react';
import api from '../services/api';
import Modal from './Modal'; 
import { Link } from 'react-router-dom';

function FichaCard({ ficha, onDelete, onUpdate }) {
  
  // --- estados para os Modais ---
  // modal de Edição 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [novoNomeFicha, setNovoNomeFicha] = useState(ficha.nomeFicha);

  // --- ADIÇÃO 1: Estados para o Modal de "Apagar" ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


  // --- AÇÃO DE DELETAR (agora abre o Modal) ---
  const handleDelete = () => {
    // Em vez de 'window.confirm', nós apenas ABRIMOS o modal de confirmação
    setIsDeleteModalOpen(true); 
  };

  // --- ADIÇÃO 2: a função que o Modal de "Apagar" vai chamar ---
  const handleConfirmDelete = async () => {
    try {
      // 1. "Telefona" para a rota DELETE
      await api.delete(`/fichas/${ficha.id}`);
      
      // 2. avisa o "pai" (Dashboard) que esta ficha foi apagada
      onDelete(ficha.id);
      
      // 3. fecha o modal 
      setIsDeleteModalOpen(false);

    } catch (error) {
      console.error("Erro ao deletar ficha:", error);
      alert('Ocorreu um erro ao deletar a ficha.');
      setIsDeleteModalOpen(false); // fecha o modal mesmo se der erro
    }
  };

  // --- AÇÃO DE EDITAR  ---
  const handleSubmitEdit = async (evento) => {
    evento.preventDefault(); 

    if (!novoNomeFicha) {
      alert('O nome não pode ficar vazio.');
      return;
    }
    try {
      const response = await api.put(`/fichas/${ficha.id}`, {
        nomeFicha: novoNomeFicha
      });
      onUpdate(response.data); 
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar ficha:", error);
      alert('Ocorreu um erro ao atualizar a ficha.');
    }
  };


  return (
    // react.fragment permite retornar mais de um item (<> e </>)
    <>
      <li>
        <Link to={`/ficha/${ficha.id}`}>
          {ficha.nomeFicha}
        </Link>
        <button 
          onClick={() => setIsEditModalOpen(true)}
          style={{ marginLeft: '10px' }}
        >
          Editar
        </button>
        <button 
          onClick={handleDelete} // <-- esta função agora abre o Modal de Apagar
          style={{ marginLeft: '5px' }}
        >
          Apagar
        </button>
      </li>

      {/* --- Modal de Edição --- */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <h2>Editar Ficha</h2>
        <form onSubmit={handleSubmitEdit}>
          <label>Novo nome da ficha:</label>
          <input 
            type="text"
            value={novoNomeFicha}
            onChange={(e) => setNovoNomeFicha(e.target.value)}
            style={{ width: '100%', marginTop: '10px' }}
          />
          <button type="submit" style={{ marginTop: '15px' }}>
            Salvar Alterações
          </button>
        </form>
      </Modal>

      {/* --- ADIÇÃO 3: o novo Modal de "Apagar" --- */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <h2>Confirmar Exclusão</h2>
        <p>Tem a certeza que deseja apagar a ficha: "{ficha.nomeFicha}"?</p>
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

export default FichaCard;