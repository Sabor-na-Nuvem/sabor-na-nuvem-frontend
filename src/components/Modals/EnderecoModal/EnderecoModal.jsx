import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { LuMapPin, LuX, LuPencilLine } from 'react-icons/lu';
import Button from '../../Button';
import Input from '../../Input';
import Select from '../../Select';
import styles from './EnderecoModal.module.css';
import shared from '../ModalShared.module.css';
import { ESTADOS_BRASIL } from '../../../constants/estados';

const EnderecoModal = ({
  onClose,
  onSave,
  textoBotao = 'Continuar',
  initialData = null,
  startEditing = false,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isEditing, setIsEditing] = useState(!initialData || startEditing);
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

  const [errors, setErrors] = useState({});

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

  const handleAnimationEnd = (e) => {
    if (e.target !== e.currentTarget) return;

    if (isClosing) {
      onClose();
      setIsClosing(false);
    }
  };

  const handleToggleEdit = () => setIsEditing(!isEditing);

  // Validação antes de enviar
  const validateForm = () => {
    const newErrors = {};
    const cleanCep = formData.cep.replace(/\D/g, '');

    if (!formData.cep) {
      newErrors.cep = 'Campo obrigatório.';
    } else if (cleanCep.length !== 8) {
      newErrors.cep = 'CEP incompleto.';
    }

    if (!formData.estado) newErrors.estado = 'Campo obrigatório.';
    if (!formData.cidade) newErrors.cidade = 'Campo obrigatório.';
    if (!formData.bairro) newErrors.bairro = 'Campo obrigatório.';
    if (!formData.logradouro) newErrors.logradouro = 'Campo obrigatório.';
    if (!formData.numero) newErrors.numero = 'Campo obrigatório.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    // Lógica específica para o CEP (Máscara)
    if (name === 'cep') {
      const cleanValue = value.replace(/\D/g, '');
      const truncatedValue = cleanValue.slice(0, 8);

      if (truncatedValue.length > 5) {
        finalValue = `${truncatedValue.slice(0, 5)}-${truncatedValue.slice(5)}`;
      } else {
        finalValue = truncatedValue;
      }
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setFormData({ ...formData, [name]: finalValue });
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
          <div className={`${styles.collapsibleLocation} ${isEditing ? styles.open : ''}`}>
            <Button variant="outline-yellow" className={styles.locationButton} type="button">
              <LuMapPin size={18} style={{ marginRight: 8 }} />
              Usar localização atual
            </Button>
          </div>

          <form
            id="address-form"
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
                maxLength={9} // 8 dígitos + 1 hífen
                error={errors.cep}
                inputMode="numeric"
              />
            </div>

            <div className={styles.spanHalf}>
              <Select
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                options={ESTADOS_BRASIL}
                disabled={!isEditing}
                error={errors.estado}
              />
            </div>

            <div className={styles.spanFull}>
              <Input
                label="Cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                disabled={!isEditing}
                error={errors.cidade}
              />
            </div>
            <div className={styles.spanFull}>
              <Input
                label="Bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                disabled={!isEditing}
                error={errors.bairro}
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
                error={errors.logradouro}
              />
            </div>
            <div className={styles.spanHalf}>
              <Input
                label="Número"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                disabled={!isEditing}
                error={errors.numero}
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
                  form="address-form"
                  onClick={handleSubmit}
                  variant="primary"
                  className={styles.submitButton}
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
  startEditing: PropTypes.bool,
};

export default EnderecoModal;
