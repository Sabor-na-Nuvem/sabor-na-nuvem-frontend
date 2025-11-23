import React from 'react';
import PropTypes from 'prop-types';
import { LuX } from 'react-icons/lu';
import Button from '../../Button';
import styles from './ConfirmModal.module.css';
import shared from '../ModalShared.module.css';
import ModalWrapper from '../ModalWrapper';

const ConfirmModal = ({
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  onClose,
  variant = 'primary',
}) => {
  return (
    <ModalWrapper onClose={onClose || onCancel} containerClassName={styles.containerSmall}>
      {({ requestClose }) => {
        const handleAction = (actionFn) => {
          if (actionFn) actionFn();
          requestClose(); // Chama animação de saída
        };

        return (
          <>
            <div className={shared.modalHeader} style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <h2 className={shared.modalTitle}>{title}</h2>

              {/* O botão X deve acionar o cancelamento antes de fechar */}
              <button className={shared.closeButton} onClick={() => handleAction(onCancel)}>
                <LuX size={24} />
              </button>
            </div>

            <div className={shared.modalContent} style={{ textAlign: 'center', paddingTop: 10 }}>
              <div className={styles.description}>{description}</div>
            </div>

            <div className={shared.modalFooter} style={{ borderTop: 'none', paddingTop: 0 }}>
              <div className={styles.actions}>
                {cancelText && (
                  <Button
                    variant="outline-red"
                    onClick={() => handleAction(onCancel)}
                    className={styles.button}
                  >
                    {cancelText}
                  </Button>
                )}
                <Button
                  variant={variant}
                  onClick={() => handleAction(onConfirm)}
                  className={styles.button}
                >
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
};

export default ConfirmModal;
