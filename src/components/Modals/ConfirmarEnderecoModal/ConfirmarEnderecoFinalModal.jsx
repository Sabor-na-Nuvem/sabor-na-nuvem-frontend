/* eslint-disable no-nested-ternary */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { LuChevronLeft, LuLoaderCircle, LuPencilLine, LuTriangleAlert } from 'react-icons/lu';
import Button from '../../Button';
import MapComponent from '../../MapComponent/MapComponent';
import { CENTRO_BRASILIA } from '../../../data/locaisBrasilia';
import { getStateCode } from '../../../utils/enderecoUtils';
import styles from './ConfirmarEnderecoModal.module.css';
import shared from '../ModalShared.module.css';
import AlertModal from '../AlertModal/AlertModal';
import ModalWrapper from '../ModalWrapper';
import { buscarEnderecoPorCoordenadas } from '../../../services/geocoding.service';

// --- COMPONENTE DE CONTEÚDO INTERNO ---
// Recebe 'onRequestClose' injetado automaticamente pelo ModalWrapper
const FinalContent = ({
  endereco,
  onBack,
  onConfirm,
  onEdit,
  setPendingAction,
  onRequestClose,
  readOnly = false,
  titulo = 'Confirme a localização',
}) => {
  const [isMapReady, setIsMapReady] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(endereco);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);

  // Estado do Alerta Interno
  const [alertInfo, setAlertInfo] = useState({
    isOpen: false,
    title: '',
    msg: '',
    type: 'primary',
  });
  const numberInputRef = useRef(null);

  // Delay para renderizar o mapa apenas após a animação do modal (Performance UX)
  useEffect(() => {
    const timer = setTimeout(() => setIsMapReady(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // Sincroniza endereço inicial e foca no número se estiver vazio
  useEffect(() => {
    setCurrentAddress(endereco);
    if (!endereco.numero && numberInputRef.current) {
      setTimeout(() => numberInputRef.current.focus(), 500);
    }
  }, [endereco]);

  const showAlert = (title, msg, type = 'error') =>
    setAlertInfo({ isOpen: true, title, msg, type });
  const closeAlert = () => setAlertInfo((prev) => ({ ...prev, isOpen: false }));

  // Registra a ação (voltar ou confirmar) para ser executada APÓS a animação de fechar
  const handleAction = (actionFn) => {
    setPendingAction(() => actionFn);
    if (onRequestClose) onRequestClose();
  };

  const handleConfirmClick = () => {
    if (readOnly) {
      handleAction(() => onConfirm(currentAddress));
      return;
    }
    if (!currentAddress.numero) {
      if (numberInputRef.current) numberInputRef.current.focus();
      showAlert(
        'Número obrigatório',
        'Por favor, informe o número da residência para continuar.',
        'outline-yellow'
      );
      return;
    }
    handleAction(() => onConfirm(currentAddress));
  };

  const handleEditClick = () => {
    if (onEdit) {
      handleAction(onEdit);
    }
  };

  const handleChangeNumero = (e) => {
    if (e.target.value.length <= 6) {
      setCurrentAddress((prev) => ({ ...prev, numero: e.target.value }));
    }
  };

  // --- LÓGICA CRÍTICA: ATUALIZAÇÃO PELO MAPA (Drag & Drop) ---
  const handleMarkerDrag = async (id, newCoords) => {
    if (readOnly) return;

    setIsUpdatingAddress(true);
    try {
      // Move o pino visualmente imediatamente
      setCurrentAddress((prev) => ({
        ...prev,
        latitude: newCoords.lat,
        longitude: newCoords.lng,
      }));

      // Chamada ao backend
      const { data } = await buscarEnderecoPorCoordenadas(newCoords.lat, newCoords.lng);

      if (data) {
        setCurrentAddress((prev) => ({
          ...prev,
          // Mantém dados antigos como fallback se a API retornar vazio
          logradouro: data.logradouro || prev.logradouro,
          numero: data.numero || prev.numero,
          bairro: data.bairro || prev.bairro,
          cidade: data.cidade || prev.cidade,
          estado: getStateCode(data.estado) || prev.estado,
          cep: data.cep || prev.cep,
        }));
      }
    } catch (error) {
      console.error('Erro ao atualizar endereço:', error);
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  const mapCenter = {
    lat: Number(currentAddress.latitude) || CENTRO_BRASILIA.lat,
    lng: Number(currentAddress.longitude) || CENTRO_BRASILIA.lng,
  };

  const mapMarkers = [
    {
      id: 'delivery-location',
      lat: mapCenter.lat,
      lng: mapCenter.lng,
      nome: 'Local de Entrega',
      endereco: `${currentAddress.logradouro}, ${currentAddress.numero || 'S/N'}`,
    },
  ];

  return (
    <>
      <div className={shared.modalHeader}>
        {/* Botão Voltar (chama handleAction para animar saída antes de voltar) */}
        <button className={styles.backButton} onClick={() => handleAction(onBack)}>
          <LuChevronLeft size={24} />
        </button>
        <h2 className={shared.modalTitle}>{titulo}</h2>
      </div>

      <div className={shared.modalContent}>
        <div className={styles.addressSummary}>
          <h3>{isUpdatingAddress ? 'Atualizando...' : currentAddress.bairro || 'Endereço'}</h3>

          <div className={styles.addressText}>
            <span>{currentAddress.logradouro},</span>

            {/* Input Inline para correção rápida do número */}
            <input
              ref={numberInputRef}
              type="text"
              className={styles.inlineInput}
              value={currentAddress.numero || ''}
              onChange={handleChangeNumero}
              placeholder="Nº"
              disabled={isUpdatingAddress || readOnly}
              style={
                readOnly
                  ? {
                      border: 'none',
                      background: 'transparent',
                      padding: 0,
                      width: '3rem',
                      color: 'var(--text-color)',
                    }
                  : {}
              }
            />

            <span>
              {' '}
              - {currentAddress.cidade}/{currentAddress.estado}
            </span>
          </div>
          <span className={styles.cepText}>{currentAddress.cep}</span>
        </div>

        {!readOnly && (
          <div className={styles.warningMessage}>
            <LuTriangleAlert size={18} style={{ flexShrink: 0 }} />
            <span>
              Verifique se o <strong>número</strong> e a posição no <strong>mapa</strong> estão
              corretos.
            </span>
          </div>
        )}

        <div className={styles.mapWrapper}>
          {isMapReady ? (
            <MapComponent
              height="250px"
              center={mapCenter}
              markers={mapMarkers}
              zoom={18}
              interactive={!readOnly}
              onMarkerDragEnd={!readOnly ? handleMarkerDrag : undefined}
            />
          ) : (
            <div className={styles.mapPlaceholderLoading}>
              <LuLoaderCircle className={styles.spinning} size={32} color="#ccc" />
              <span>Carregando mapa...</span>
            </div>
          )}
          {!readOnly && <div className={styles.mapOverlayHint}>Arraste o pino para ajustar</div>}
        </div>
      </div>

      <div className={shared.modalFooter}>
        <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
          {/* Se for ReadOnly e tiver função de editar, mostra o botão de editar */}
          {readOnly && onEdit && (
            <Button variant="outline-red" onClick={handleEditClick} className={styles.fullButton}>
              <LuPencilLine size={18} style={{ marginRight: 8 }} /> Editar Endereço
            </Button>
          )}

          <Button
            variant="primary"
            onClick={handleConfirmClick}
            className={styles.fullButton}
            disabled={isUpdatingAddress}
          >
            {/* Muda o texto dependendo do contexto */}
            {isUpdatingAddress ? 'Atualizando...' : readOnly ? 'Fechar' : 'Confirmar Endereço'}
          </Button>
        </div>
      </div>

      {alertInfo.isOpen && (
        <AlertModal
          title={alertInfo.title}
          description={alertInfo.msg}
          variant={alertInfo.type === 'error' ? 'primary' : 'outline-yellow'}
          icon={alertInfo.type === 'error' ? 'error' : 'success'}
          onClose={closeAlert}
        />
      )}
    </>
  );
};

// --- COMPONENTE WRAPPER PRINCIPAL ---
const ConfirmarEnderecoFinalModal = ({ onClose, ...props }) => {
  const [pendingAction, setPendingAction] = useState(null);

  const handleWrapperClose = () => {
    // Executa a ação pendente (onBack ou onConfirm) somente após a animação acabar
    if (pendingAction) pendingAction();
    onClose();
  };

  return (
    <ModalWrapper onClose={handleWrapperClose}>
      {({ requestClose }) => (
        <FinalContent
          setPendingAction={setPendingAction}
          onRequestClose={requestClose}
          {...props}
        />
      )}
    </ModalWrapper>
  );
};

ConfirmarEnderecoFinalModal.propTypes = {
  endereco: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onClose: PropTypes.func,
  readOnly: PropTypes.bool,
  titulo: PropTypes.string,
};

FinalContent.propTypes = {
  endereco: PropTypes.shape({
    latitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    longitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    logradouro: PropTypes.string,
    numero: PropTypes.string,
    bairro: PropTypes.string,
    cidade: PropTypes.string,
    estado: PropTypes.string,
    cep: PropTypes.string,
  }).isRequired,
  onBack: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  setPendingAction: PropTypes.func.isRequired,
  onRequestClose: PropTypes.func,
  readOnly: PropTypes.bool,
  titulo: PropTypes.string,
};

export default ConfirmarEnderecoFinalModal;
