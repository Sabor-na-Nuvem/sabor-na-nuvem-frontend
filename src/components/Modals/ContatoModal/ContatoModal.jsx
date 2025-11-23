import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { LuX } from 'react-icons/lu';
import Button from '../../Button';
import InputCelular from '../../InputCelular';
import styles from './ContatoModal.module.css';
import shared from '../ModalShared.module.css';
import ModalWrapper from '../ModalWrapper';

const ContatoModal = ({ onClose, onContinue }) => {
  const [celular, setCelular] = useState('');
  const [celularReserva, setCelularReserva] = useState('');
  const [errors, setErrors] = useState({});

  // Remove formatação para verificar se tem dados reais
  const rawCelular = celular.replace(/\D/g, '');
  const rawReserva = celularReserva.replace(/\D/g, '');

  const hasData = rawCelular.length > 0 || rawReserva.length > 0;

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    // Validação Celular Principal
    if (rawCelular.length > 0) {
      if (rawCelular.length < 10) {
        newErrors.celular = 'Mínimo 10 dígitos (com DDD).';
        isValid = false;
      }
    }

    // Validação Celular Reserva
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

  const handleChangeCelular = (e) => {
    setCelular(e.target.value);
    if (errors.celular) setErrors((prev) => ({ ...prev, celular: null }));
  };

  const handleChangeReserva = (e) => {
    setCelularReserva(e.target.value);
    if (errors.celularReserva) setErrors((prev) => ({ ...prev, celularReserva: null }));
  };

  return (
    <ModalWrapper onClose={onClose}>
      {({ requestClose }) => {
        const handleSubmit = (e) => {
          e.preventDefault();
          if (!hasData) {
            onContinue(null);
            requestClose(); // Fecha com animação
            return;
          }
          if (validate()) {
            onContinue({ celular, celularReserva });
            requestClose(); // Fecha com animação
          }
        };

        return (
          <>
            <div className={shared.modalHeader}>
              <h2 className={shared.modalTitle}>Informações de Contato</h2>

              <button className={shared.closeButton} onClick={requestClose}>
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
                type="button"
                form="contato-form"
                onClick={handleSubmit}
                variant={hasData ? 'primary' : 'outline-red'}
                className={styles.fullButton}
              >
                {hasData ? 'Salvar e continuar' : 'Pular etapa'}
              </Button>
            </div>
          </>
        );
      }}
    </ModalWrapper>
  );
};

ContatoModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onContinue: PropTypes.func.isRequired,
};

export default ContatoModal;
