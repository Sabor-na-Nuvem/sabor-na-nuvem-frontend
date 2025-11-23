import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './ModalShared.module.css';

const ModalWrapper = ({ children, onClose, containerClassName = '' }) => {
  const [isClosing, setIsClosing] = useState(false);

  // --- 1. BLOQUEIO DE SCROLL (GLOBAL) ---
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // --- 2. LÓGICA DE ANIMAÇÃO DE SAÍDA ---
  // Inicia a animação visual de fechamento
  const handleCloseRequest = () => {
    setIsClosing(true);
  };

  // Aguarda o fim da animação CSS para desmontar o componente real
  const handleAnimationEnd = (e) => {
    if (e.target !== e.currentTarget) return; // Evita bubbling de filhos

    if (isClosing) {
      onClose(); // Chama a função do pai para remover do DOM
      setIsClosing(false);
    }
  };

  return (
    <div
      className={`${styles.overlay} ${isClosing ? styles.overlayClosing : ''}`}
      onClick={handleCloseRequest} // Clicar no overlay inicia fechamento suave
      onAnimationEnd={handleAnimationEnd}
    >
      <div
        className={`${styles.modalContainer} ${containerClassName} ${isClosing ? styles.modalContainerClosing : ''}`}
        onClick={(e) => e.stopPropagation()} // Impede que cliques dentro fechem o modal
      >
        {typeof children === 'function' ? children({ requestClose: handleCloseRequest }) : children}
      </div>
    </div>
  );
};

ModalWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
  containerClassName: PropTypes.string,
};

export default ModalWrapper;
