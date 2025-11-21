import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { LuCircleAlert, LuCircleCheck } from 'react-icons/lu';
import Button from '../../Button';
import styles from './AlertModal.module.css';
import shared from '../ModalShared.module.css';

const AlertModal = ({
  title,
  description,
  buttonText = 'OK',
  onClose,
  variant = 'primary',
  icon = null,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => setIsClosing(true);

  const handleAnimationEnd = (e) => {
    if (e.target !== e.currentTarget) return;

    if (isClosing) {
      onClose();
      setIsClosing(false);
    }
  };

  // Renderização opcional de ícone de destaque
  const renderIcon = () => {
    if (icon === 'success') return <LuCircleCheck size={48} className={styles.iconSuccess} />;
    if (icon === 'error') return <LuCircleAlert size={48} className={styles.iconError} />;
    return icon;
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
          {title && (
            <h2 className={shared.modalTitle} style={{ marginLeft: '0' }}>
              {title}
            </h2>
          )}
        </div>

        <div className={shared.modalContent} style={{ textAlign: 'center', paddingTop: 10 }}>
          {icon && <div className={styles.iconWrapper}>{renderIcon()}</div>}
          <div className={styles.description}>{description}</div>
        </div>

        <div
          className={shared.modalFooter}
          style={{ borderTop: 'none', paddingTop: 10, paddingBottom: 10 }}
        >
          <div className={styles.actions}>
            <Button variant={variant} onClick={handleClose} className={styles.button}>
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

AlertModal.propTypes = {
  title: PropTypes.string,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  buttonText: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  variant: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
};

export default AlertModal;
