import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { LuX } from 'react-icons/lu';
import Button from '../../Button';
import styles from './AtualizarSenhaModal.module.css';
import shared from '../ModalShared.module.css';
import ModalWrapper from '../ModalWrapper';
import Input from '../../Input';

const AtualizarSenhaModal = ({ title, description, onConfirm, onCancel, onClose }) => {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [confirmarSenhaNova, setConfirmarSenhaNova] = useState('');

  const [senhaAtualError, setSenhaAtualError] = useState(null);
  const [senhaNovaError, setSenhaNovaError] = useState(null);
  const [confirmarSenhaNovaError, setConfirmarSenhaNovaError] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validarCampo = (name, value, allFormValues = {}) => {
    let error = null;
    const MIN_LENGTH = 6;

    if (!value) {
      if (name === 'senhaAtual') error = 'A senha atual é obrigatória.';
      else if (name === 'senhaNova') error = 'A senha nova é obrigatória.';
      else if (name === 'confirmarSenhaNova') error = 'A confirmação de senha é obrigatória.';
    }

    if (name === 'senhaAtual' && !error) {
      if (value.length < MIN_LENGTH) error = `A senha deve ter no mínimo ${MIN_LENGTH} caracteres.`;
    } else if (name === 'senhaNova' && !error) {
      if (value.length < MIN_LENGTH) error = `A senha deve ter no mínimo ${MIN_LENGTH} caracteres.`;
    } else if (name === 'confirmarSenhaNova' && !error) {
      const mainPasswordValue = allFormValues.senhaNova;
      if (value !== mainPasswordValue) error = 'As senhas não coincidem.';
    }

    if (name === 'senhaAtual') setSenhaAtualError(error);
    else if (name === 'senhaNova') setSenhaNovaError(error);
    else if (name === 'confirmarSenhaNova') setConfirmarSenhaNovaError(error);

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'senhaAtual') setSenhaAtual(value);
    if (name === 'senhaNova') setSenhaNova(value);
    if (name === 'confirmarSenhaNova') setConfirmarSenhaNova(value);

    if (isSubmitted) {
      const currentValues = {
        senhaAtual,
        senhaNova: name === 'senhaNova' ? value : senhaNova,
        confirmarSenhaNova: name === 'confirmarSenhaNova' ? value : confirmarSenhaNova,
      };
      validarCampo(name, value, currentValues);
      if (name === 'senhaNova')
        validarCampo('confirmarSenhaNova', confirmarSenhaNova, currentValues);
      if (name === 'confirmarSenhaNova') validarCampo('senhaNova', senhaNova, currentValues);
    }
  };

  const handleBlur = (e) => {
    if (isSubmitted) {
      const formValues = { senhaAtual, senhaNova, confirmarSenhaNova };
      validarCampo(e.target.name, e.target.value, formValues);
      if (e.target.name === 'senhaNova')
        validarCampo('confirmarSenhaNova', confirmarSenhaNova, formValues);
    }
  };

  // --- SUBMISSÃO DO FORMULÁRIO ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    const formValues = { senhaAtual, senhaNova, confirmarSenhaNova };
    const senhaAtualValidation = validarCampo('senhaAtual', senhaAtual, formValues);
    const senhaNovaValidation = validarCampo('senhaNova', senhaNova, formValues);
    const confirmarSenhaNovaValidation = validarCampo(
      'confirmarSenhaNova',
      confirmarSenhaNova,
      formValues
    );

    const hasErrors = senhaAtualValidation || senhaNovaValidation || confirmarSenhaNovaValidation;

    if (!hasErrors) {
      // SUCESSO: Troca a senha
      setIsLoading(true);
      try {
        await onConfirm({ senhaAntiga: senhaAtual, novaSenha: senhaNova });
      } catch (error) {
        // Deixar vazio
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <ModalWrapper onClose={onClose || onCancel} containerClassName={styles.containerSmall}>
      {({ requestClose }) => {
        const handleCancelClick = () => {
          if (onCancel) onCancel();
          requestClose();
        };

        return (
          <>
            <div className={shared.modalHeader} style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <h2 className={shared.modalTitle}>{title}</h2>

              {/* O botão X deve acionar o cancelamento antes de fechar */}
              <button className={shared.closeButton} onClick={handleCancelClick}>
                <LuX size={24} />
              </button>
            </div>

            <div className={shared.modalContent} style={{ textAlign: 'center', paddingTop: 10 }}>
              <div className={styles.description}>
                {description}
                <div style={{ marginTop: 20, textAlign: 'left' }}>
                  <Input
                    label="Senha Atual"
                    type="password"
                    name="senhaAtual"
                    value={senhaAtual}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={senhaAtualError}
                    maxLength={128}
                    autoFocus
                    autoComplete="current-password"
                  />
                </div>
                <div style={{ marginTop: 20, textAlign: 'left' }}>
                  <Input
                    label="Nova Senha"
                    type="password"
                    name="senhaNova"
                    value={senhaNova}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={senhaNovaError}
                    maxLength={128}
                    autoComplete="new-password"
                  />
                </div>
                <div style={{ marginTop: 20, textAlign: 'left' }}>
                  <Input
                    label="Confirmar a nova senha"
                    type="password"
                    name="confirmarSenhaNova"
                    value={confirmarSenhaNova}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={confirmarSenhaNovaError}
                    maxLength={128}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            <div className={shared.modalFooter} style={{ borderTop: 'none', paddingTop: 15 }}>
              <div className={styles.actions}>
                <Button variant="outline-red" onClick={handleCancelClick} className={styles.button}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  className={styles.button}
                  disabled={isLoading}
                >
                  {isLoading ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </div>
            </div>
          </>
        );
      }}
    </ModalWrapper>
  );
};

AtualizarSenhaModal.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

export default AtualizarSenhaModal;
