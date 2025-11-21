import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { LuX } from 'react-icons/lu';
import Button from '../../Button';
import styles from './ConfirmModal.module.css';
import shared from '../ModalShared.module.css';

const ConfirmModal = ({
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  onClose = undefined,
  variant = 'primary',
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => setIsClosing(true);

  const handleAnimationEnd = (e) => {
    if (e.target !== e.currentTarget) return;

    if (isClosing) {
      if (onClose !== undefined) {
        onClose();
      } else {
        onCancel();
      }
      setIsClosing(false);
    }
  };

  const handleConfirmAction = () => {
    onConfirm();
  };

  return (
    <div
      className={`${shared.overlay} ${isClosing ? shared.overlayClosing : ''}`}
      onClick={handleClose}
      onAnimationEnd={handleAnimationEnd}
    >
      <div
        className={`${shared.modalContainer} ${styles.containerSmall} ${isClosing ? shared.modalContainerClosing : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={shared.modalHeader} style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <h2 className={shared.modalTitle}>{title}</h2>
          <button className={shared.closeButton} onClick={handleClose}>
            <LuX size={24} />
          </button>
        </div>

        <div className={shared.modalContent} style={{ textAlign: 'center', paddingTop: 10 }}>
          <p className={styles.description}>{description}</p>
        </div>

        <div className={shared.modalFooter} style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className={styles.actions}>
            {cancelText && (
              <Button variant="outline-red" onClick={onCancel} className={styles.button}>
                {cancelText}
              </Button>
            )}
            <Button variant={variant} onClick={handleConfirmAction} className={styles.button}>
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
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
