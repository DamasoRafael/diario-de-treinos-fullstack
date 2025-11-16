import React from 'react';

// esqueleto modal simples para atender o modal que me foi pedido
// ele recebe 'isOpen' (para saber se deve estar visivel)
// e 'onClose' (a funcao que ele deve chamar para se fechar)
// e 'children' (o conteudo que vai dentro dele)
function Modal({ isOpen, onClose, children }) {

  // se nao estiver aberto não renderiza nada (null)
  if (!isOpen) {
    return null;
  }

  // se for para estar aberto, renderiza o Modal
  return (
    // o Fundo Preto Transparente (Overlay)
    <div style={styles.overlay} onClick={onClose}>

      {/* O Cartão Branco do Modal (Conteúdo) */}
      {/* Uso e.stopPropagation() para impedir que o clique DENTRO do modal feche o modal */}
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* um botão "X" para fechar */}
        <button style={styles.closeButton} onClick={onClose}>
          X
        </button>

        {/* O conteúdo que foi "embrulhado" (ex: o formulário de edição) */}
        {children}

      </div>
    </div>
  );
}

// estilos CSS "inline" (dentro do JS) para o Modal
// (eu poderia usar um .module.css mas assim eh mais rápido para um componente genérico)
const styles = {
  overlay: {
    position: 'fixed', // Fica "flutuando" por cima de tudo
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Preto com 70% de transparência
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // garante que fica na frente de tudo
  },
  modal: {
    background: 'white',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    minWidth: '300px',
    maxWidth: '500px',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'transparent',
    border: 'none',
    color: '#888',
    fontSize: '18px',
  }
};

export default Modal;