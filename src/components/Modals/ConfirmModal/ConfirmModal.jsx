import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { LuX } from 'react-icons/lu';
import Button from '../../Button';
import styles from './ConfirmModal.module.css';
import shared from '../ModalShared.module.css';
import ModalWrapper from '../ModalWrapper';
import Input from '../../Input';

const ConfirmModal = ({
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  onClose,
  variant = 'primary',
  inputPassword = false,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  return (
    <ModalWrapper onClose={onClose || onCancel} containerClassName={styles.containerSmall}>
      {({ requestClose }) => {
        const handleConfirmClick = () => {
          if (inputPassword) {
            if (!password) {
              setError('Por favor, digite sua senha.');
              return; // Impede o fechamento se estiver vazio
            }
            if (onConfirm) onConfirm(password);
          } else {
            // eslint-disable-next-line no-lonely-if
            if (onConfirm) onConfirm();
          }
          requestClose();
        };

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
                {/* Renderização Condicional do Input de Senha */}
                {inputPassword && (
                  <div style={{ marginTop: 20, textAlign: 'left' }}>
                    <Input
                      label="Senha"
                      type="password"
                      name="confirm_password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(null);
                      }}
                      error={error}
                      placeholder="Digite sua senha"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>

            <div className={shared.modalFooter} style={{ borderTop: 'none', paddingTop: 0 }}>
              <div className={styles.actions}>
                {cancelText && (
                  <Button
                    variant="outline-red"
                    onClick={handleCancelClick}
                    className={styles.button}
                  >
                    {cancelText}
                  </Button>
                )}
                <Button variant={variant} onClick={handleConfirmClick} className={styles.button}>
                  {confirmText}
                </Button>
              </div>
            </div>
          </>
        );
      }}
    </ModalWrapper>
  );
};

ConfirmModal.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  variant: PropTypes.string,
  inputPassword: PropTypes.bool,
};

export default ConfirmModal;
