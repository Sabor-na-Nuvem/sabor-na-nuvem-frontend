import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { LuX } from 'react-icons/lu';
import Button from '../../Button';
import InputCelular from '../../InputCelular';
import styles from './ContatoModal.module.css';
import shared from '../ModalShared.module.css';

const ContatoModal = ({ onClose, onContinue }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [celular, setCelular] = useState('');
  const [celularReserva, setCelularReserva] = useState('');
  const [errors, setErrors] = useState({});

  const handleClose = () => setIsClosing(true);

  const handleAnimationEnd = (e) => {
    if (e.target !== e.currentTarget) return;

    if (isClosing) {
      onClose();
      setIsClosing(false);
    }
  };

  // Remove formatação para verificar se tem dados reais
  const rawCelular = celular.replace(/\D/g, '');
  const rawReserva = celularReserva.replace(/\D/g, '');

  // Lógica principal: Se tiver pelo menos 1 número digitado, considera que tem dados
  const hasData = rawCelular.length > 0 || rawReserva.length > 0;

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    // Validação Celular Principal (apenas se preenchido)
    if (rawCelular.length > 0) {
      if (rawCelular.length < 10) {
        newErrors.celular = 'Mínimo 10 dígitos (com DDD).';
        isValid = false;
      }
    }

    // Validação Celular Reserva (apenas se preenchido)
    if (rawReserva.length > 0) {
      if (rawReserva.length < 10) {
        newErrors.celularReserva = 'Mínimo 10 dígitos (com DDD).';
        isValid = false;
      } else if (rawReserva === rawCelular) {
        newErrors.celularReserva = 'Os números não podem ser iguais.';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Cenário 1: Usuário não digitou nada -> Pular
    if (!hasData) {
      onContinue(null);
      return;
    }

    // Cenário 2: Usuário digitou algo -> Validar e Salvar
    if (validate()) {
      onContinue({ celular, celularReserva });
    }
  };

  // Limpa erro ao digitar
  const handleChangeCelular = (e) => {
    setCelular(e.target.value);
    if (errors.celular) setErrors((prev) => ({ ...prev, celular: null }));
  };

  const handleChangeReserva = (e) => {
    setCelularReserva(e.target.value);
    if (errors.celularReserva) setErrors((prev) => ({ ...prev, celularReserva: null }));
  };

  return (
    <div
      className={`${shared.overlay} ${isClosing ? shared.overlayClosing : ''}`}
      onClick={handleClose}
      onAnimationEnd={handleAnimationEnd}
    >
      <div
        className={`${shared.modalContainer} ${isClosing ? shared.modalContainerClosing : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={shared.modalHeader}>
          <h2 className={shared.modalTitle}>Informações de Contato</h2>
          <button className={shared.closeButton} onClick={handleClose}>
            <LuX size={24} />
          </button>
        </div>

        <div className={shared.modalContent}>
          <form id="contato-form" className={styles.formColumn}>
            <InputCelular
              label="Celular (opcional)"
              name="celular"
              value={celular}
              onChange={handleChangeCelular}
              error={errors.celular}
            />
            <InputCelular
              label="Celular reserva (opcional)"
              name="celularReserva"
              value={celularReserva}
              onChange={handleChangeReserva}
              error={errors.celularReserva}
            />
          </form>
        </div>

        <div className={shared.modalFooter}>
          <Button
            form="contato-form"
            variant={hasData ? 'primary' : 'outline-red'}
            onClick={handleSubmit}
            className={styles.fullButton}
          >
            {hasData ? 'Salvar e continuar' : 'Pular etapa'}
          </Button>
        </div>
      </div>
    </div>
  );
};

ContatoModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onContinue: PropTypes.func.isRequired,
};

export default ContatoModal;
