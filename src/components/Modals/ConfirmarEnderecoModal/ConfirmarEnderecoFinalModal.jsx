import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { LuChevronLeft } from 'react-icons/lu';
import Button from '../../Button';
import styles from './ConfirmarEnderecoModal.module.css';
import shared from '../ModalShared.module.css';

const ConfirmarEnderecoFinalModal = ({ endereco, onBack, onConfirm }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [actionType, setActionType] = useState(null); // 'back' ou 'confirm'

  // Função unificada para iniciar animação de saída
  const handleExit = (type) => {
    setActionType(type);
    setIsClosing(true);
  };

  // Executa a ação real quando a animação termina
  const handleAnimationEnd = (e) => {
    if (e.target !== e.currentTarget) return;

    if (isClosing) {
      if (actionType === 'back') {
        onBack();
      } else if (actionType === 'confirm') {
        onConfirm();
      }
      setIsClosing(false);
    }
  };

  return (
    <div
      className={`${shared.overlay} ${isClosing ? shared.overlayClosing : ''}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className={`${shared.modalContainer} ${isClosing ? shared.modalContainerClosing : ''}`}>
        <div className={shared.modalHeader}>
          {/* Botão de Voltar na esquerda com animação */}
          <button className={styles.backButton} onClick={() => handleExit('back')}>
            <LuChevronLeft size={24} />
          </button>
          <h2 className={shared.modalTitle}>Confirme o endereço</h2>
        </div>

        <div className={shared.modalContent}>
          <div className={styles.addressSummary}>
            <h3>{endereco.bairro || 'Endereço'}</h3>
            <p>{`${endereco.logradouro}, ${endereco.numero}, ${endereco.cidade}, ${endereco.estado}, ${endereco.cep}`}</p>
          </div>

          {/* Placeholder do Mapa */}
          <div className={styles.mapPlaceholder}>
            <div className={styles.pinIcon}>📍</div>
            {/* <iframe ... Google Maps ... /> */}
          </div>
        </div>

        <div className={shared.modalFooter}>
          <Button
            variant="primary"
            onClick={() => handleExit('confirm')}
            className={styles.fullButton}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
};

ConfirmarEnderecoFinalModal.propTypes = {
  endereco: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default ConfirmarEnderecoFinalModal;
