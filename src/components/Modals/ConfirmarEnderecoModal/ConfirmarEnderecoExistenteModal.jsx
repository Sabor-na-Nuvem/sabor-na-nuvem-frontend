import React from 'react';
import { LuX, LuChevronLeft } from 'react-icons/lu';
import PropTypes from 'prop-types';
import Button from '../../Button';
import styles from './ConfirmarEnderecoModal.module.css';
import shared from '../ModalShared.module.css';
import ModalWrapper from '../ModalWrapper';

const ConfirmarEnderecoExistenteModal = ({ endereco, onClose, onConfirm, onUseNew, onBack }) => {
  return (
    <ModalWrapper onClose={onClose} containerClassName={styles.containerWide}>
      {({ requestClose }) => {
        const handleAction = (actionFn) => {
          if (actionFn) actionFn();
          requestClose();
        };

        return (
          <>
            <div className={shared.modalHeader}>
              {onBack && (
                <button className={styles.backButton} onClick={() => handleAction(onBack)}>
                  <LuChevronLeft size={24} />
                </button>
              )}

              <h2 className={shared.modalTitle}>Confirmar endereço</h2>

              <button className={shared.closeButton} onClick={requestClose}>
                <LuX size={24} />
              </button>
            </div>

            <div className={shared.modalContent}>
              <div className={styles.messageBox}>
                <strong>Percebemos que já havia inserido um endereço anteriormente.</strong>
                <p>Deseja utilizá-lo como seu endereço?</p>
                <span className={styles.subText}>Aqui estão as informações que encontramos...</span>
              </div>

              <div className={styles.readOnlyGrid}>
                <div className={styles.field}>
                  <label>CEP</label> <p>{endereco.cep}</p>
                </div>
                <div className={styles.field}>
                  <label>Logradouro</label> <p>{endereco.logradouro}</p>
                </div>
                <div className={styles.field}>
                  <label>Estado</label> <p>{endereco.estado}</p>
                </div>
                <div className={styles.field}>
                  <label>Número</label> <p>{endereco.numero}</p>
                </div>
                <div className={styles.field}>
                  <label>Cidade</label> <p>{endereco.cidade}</p>
                </div>
                <div className={styles.field}>
                  <label>Complemento</label> <p>{endereco.complemento || '-'}</p>
                </div>
                <div className={styles.field}>
                  <label>Bairro</label> <p>{endereco.bairro}</p>
                </div>
                <div className={styles.field}>
                  <label>Ponto de referência</label> <p>{endereco.referencia || '-'}</p>
                </div>
              </div>
            </div>

            <div className={shared.modalFooter}>
              <div className={styles.footerActions}>
                <Button
                  variant="outline-red"
                  onClick={() => handleAction(onUseNew)}
                  className={styles.actionBtn}
                >
                  Cadastrar outro
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleAction(() => onConfirm(endereco))}
                  className={styles.actionBtn}
                >
                  Sim
                </Button>
              </div>
            </div>
          </>
        );
      }}
    </ModalWrapper>
  );
};

ConfirmarEnderecoExistenteModal.propTypes = {
  endereco: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onUseNew: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default ConfirmarEnderecoExistenteModal;
