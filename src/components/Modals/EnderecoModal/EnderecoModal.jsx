import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { LuMapPin, LuX, LuPencilLine } from 'react-icons/lu';
import Button from '../../Button';
import Input from '../../Input';
import styles from './EnderecoModal.module.css';
import shared from '../ModalShared.module.css';

const EnderecoModal = ({ onClose, onSave, textoBotao = 'Continuar', initialData = null }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isEditing, setIsEditing] = useState(!initialData);

  const location = useLocation();
  const isUserPage = location.pathname.includes('/minha-conta');

  const [formData, setFormData] = useState({
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    referencia: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        cep: initialData.cep || '',
        logradouro: initialData.logradouro || '',
        numero: initialData.numero || '',
        complemento: initialData.complemento || '',
        bairro: initialData.bairro || '',
        cidade: initialData.cidade || '',
        estado: initialData.estado || '',
        referencia: initialData.pontoReferencia || '',
      });
    }
  }, [initialData]);

  const handleClose = () => setIsClosing(true);

  const handleAnimationEnd = () => {
    if (isClosing) {
      onClose();
      setIsClosing(false);
    }
  };

  const handleToggleEdit = () => {
    setFormData({
      cep: initialData.cep || '',
      logradouro: initialData.logradouro || '',
      numero: initialData.numero || '',
      complemento: initialData.complemento || '',
      bairro: initialData.bairro || '',
      cidade: initialData.cidade || '',
      estado: initialData.estado || '',
      referencia: initialData.pontoReferencia || '',
    });
    setIsEditing(!isEditing);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div
      className={`${shared.overlay} ${isClosing ? shared.overlayClosing : ''}`}
      onClick={handleClose}
      onAnimationEnd={handleAnimationEnd}
    >
      <div
        className={`${shared.modalContainer} ${styles.containerLarger} ${isClosing ? shared.modalContainerClosing : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={shared.modalHeader}>
          <h2 className={shared.modalTitle}>Endereço de entrega</h2>
          <button
            className={`${shared.closeButton} ${styles.closeBtnPosition}`}
            onClick={handleClose}
          >
            <LuX size={24} />
          </button>
        </div>

        <div className={shared.modalContent}>
          {/* ANIMAÇÃO: Wrapper colapsável para o botão de localização */}
          <div className={`${styles.collapsibleLocation} ${isEditing ? styles.open : ''}`}>
            <Button variant="outline-yellow" className={styles.locationButton} type="button">
              <LuMapPin size={18} style={{ marginRight: 8 }} />
              Usar localização atual
            </Button>
          </div>

          <form
            id="address-form"
            onSubmit={handleSubmit}
            className={`${styles.formGrid} ${isEditing ? styles.modeEditing : styles.modeReading}`}
          >
            <div className={styles.spanHalf}>
              <Input
                label="CEP"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                placeholder="00000-000"
                disabled={!isEditing}
              />
            </div>
            <div className={styles.spanHalf}>
              <Input
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className={styles.spanFull}>
              <Input
                label="Cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className={styles.spanFull}>
              <Input
                label="Bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className={styles.spanFull}>
              <Input
                label="Logradouro"
                name="logradouro"
                value={formData.logradouro}
                onChange={handleChange}
                placeholder="Av., Rua, Travessa..."
                disabled={!isEditing}
              />
            </div>
            <div className={styles.spanHalf}>
              <Input
                label="Número"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className={styles.spanHalf}>
              <Input
                label="Complemento"
                name="complemento"
                value={formData.complemento}
                onChange={handleChange}
                placeholder="Apto, Bloco..."
                disabled={!isEditing}
              />
            </div>
            <div className={styles.spanFull}>
              <Input
                label="Ponto de referência"
                name="referencia"
                value={formData.referencia}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </form>
        </div>

        <div className={shared.modalFooter}>
          <div className={styles.modalFooterContent}>
            {isUserPage && !isEditing ? (
              // MODO LEITURA
              <Button
                type="button"
                variant="outline-red"
                className={styles.editButton}
                onClick={handleToggleEdit}
              >
                <LuPencilLine size={18} style={{ marginRight: 8 }} />
                Editar Endereço
              </Button>
            ) : (
              // MODO EDIÇÃO
              <div className={styles.footerActions}>
                {isUserPage && (
                  <Button
                    type="button"
                    variant="ghost"
                    className={styles.cancelButton}
                    onClick={handleToggleEdit}
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  type="submit"
                  form="address-form"
                  variant="primary"
                  className={styles.submitButton}
                  onClick={() => {
                    onSave(formData);
                  }}
                >
                  {isUserPage ? 'Salvar Alterações' : textoBotao}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

EnderecoModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
  textoBotao: PropTypes.string,
  initialData: PropTypes.object,
};

export default EnderecoModal;
