import React from 'react';
import PropTypes from 'prop-types';
import { LuX, LuCircleAlert, LuCircleCheck } from 'react-icons/lu';
import Button from '../../Button';
import styles from './AlertModal.module.css';
import shared from '../ModalShared.module.css';
import ModalWrapper from '../ModalWrapper';

const AlertModal = ({
  title,
  description,
  buttonText = 'OK',
  onClose,
  variant = 'primary',
  icon = null,
}) => {
  const renderIcon = () => {
    if (icon === 'success') return <LuCircleCheck size={48} className={styles.iconSuccess} />;
    if (icon === 'error') return <LuCircleAlert size={48} className={styles.iconError} />;
    return icon;
  };

  return (
    <ModalWrapper onClose={onClose} containerClassName={styles.containerSmall}>
      {({ requestClose }) => (
        <>
          <div className={shared.modalHeader} style={{ borderBottom: 'none', paddingBottom: 0 }}>
            {title && <h2 className={shared.modalTitle}>{title}</h2>}
            <button className={shared.closeButton} onClick={requestClose}>
              <LuX size={24} />
            </button>
          </div>

          <div className={shared.modalContent} style={{ textAlign: 'center', paddingTop: 10 }}>
            {icon && <div className={styles.iconWrapper}>{renderIcon()}</div>}
            <div className={styles.description}>{description}</div>
          </div>

          <div className={shared.modalFooter} style={{ borderTop: 'none', paddingTop: 0 }}>
            <div className={styles.actions}>
              <Button variant={variant} onClick={requestClose} className={styles.button}>
                {buttonText}
              </Button>
            </div>
          </div>
        </>
      )}
    </ModalWrapper>
  );
};

AlertModal.propTypes = {
  title: PropTypes.string,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  buttonText: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  variant: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onRequestClose: PropTypes.func,
};

export default AlertModal;
