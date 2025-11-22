import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { LuChevronLeft, LuLoaderCircle, LuTriangleAlert } from 'react-icons/lu';
import Button from '../../Button';
import MapComponent from '../../MapComponent/MapComponent';
import { CENTRO_BRASILIA } from '../../../data/locaisBrasilia';
import styles from './ConfirmarEnderecoModal.module.css';
import shared from '../ModalShared.module.css';
import { getStateCode } from '../../../utils/enderecoUtils';
import AlertModal from '../AlertModal/AlertModal';

const ConfirmarEnderecoFinalModal = ({ endereco, onBack, onConfirm }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // Estado local para endereço (permite edição via mapa/input)
  const [currentAddress, setCurrentAddress] = useState(endereco);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);

  // 2. Estado para controlar o AlertModal (substituto do window.alert)
  const [alertInfo, setAlertInfo] = useState({
    isOpen: false,
    title: '',
    msg: '',
    type: 'primary',
  });

  const actionTypeRef = useRef(null);
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

  // Helpers para AlertModal
  const showAlert = (title, msg, type = 'error') =>
    setAlertInfo({ isOpen: true, title, msg, type });
  const closeAlert = () => setAlertInfo((prev) => ({ ...prev, isOpen: false }));

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

  // --- LÓGICA DE SAÍDA ---
  const handleExit = (type) => {
    if (isClosing) return;
    actionTypeRef.current = type;

    if (type === 'confirm') {
      // Validação: O número é obrigatório para entrega
      if (!currentAddress.numero) {
        if (numberInputRef.current) numberInputRef.current.focus();
        // 3. Uso do AlertModal personalizado
        showAlert(
          'Número obrigatório',
          'Por favor, informe o número da residência para continuar.',
          'error'
        );
        return;
      }
      onConfirm(currentAddress);
    } else {
      // Se for 'back', a ação real ocorre no onAnimationEnd
    }

    setIsClosing(true);
  };

  const handleAnimationEnd = (e) => {
    if (e.target !== e.currentTarget) return;

    if (isClosing) {
      if (actionTypeRef.current === 'back') {
        onBack();
      }
      setIsClosing(false);
    }
  };

  const handleChangeNumero = (e) => {
    if (e.target.value.length <= 6) {
      setCurrentAddress((prev) => ({ ...prev, numero: e.target.value }));
    }
  };

  // --- LÓGICA CRÍTICA: ATUALIZAÇÃO PELO MAPA (Drag & Drop) ---
  const handleMarkerDrag = async (id, newCoords) => {
    setIsUpdatingAddress(true);

    try {
      // 1. Atualização Otimista: Move o pino visualmente imediatamente
      setCurrentAddress((prev) => ({
        ...prev,
        latitude: newCoords.lat,
        longitude: newCoords.lng,
      }));

      // 2. Reverse Geocoding: Busca o endereço da nova coordenada
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newCoords.lat}&lon=${newCoords.lng}&addressdetails=1&zoom=18`;
      const res = await fetch(url, { headers: { 'User-Agent': 'SaborNaNuvemApp/1.0' } });
      const data = await res.json();

      if (data && data.address) {
        const addr = data.address;
        setCurrentAddress((prev) => ({
          ...prev,
          // Mantém rua antiga se a nova for undefined (fallback seguro)
          logradouro: addr.road || addr.pedestrian || addr.street || prev.logradouro,

          // Lógica Inteligente para Número:
          // Se a API achou um número exato (house_number), usa ele.
          // Se não, mantém o que o usuário digitou. Isso evita apagar o número
          // só porque o usuário arrastou o pino um pouco para o lado na rua.
          numero: addr.house_number || prev.numero,

          bairro: addr.suburb || addr.neighbourhood || prev.bairro,
          cidade: addr.city || addr.town || prev.cidade,
          estado: getStateCode(addr.state) || prev.estado,
          cep: `${(addr.postcode || prev.cep).replace(/\D/g, '').slice(0, 5)}-${(
            addr.postcode || prev.cep
          )
            .replace(/\D/g, '')
            .slice(5)}`,
        }));
      }
    } catch (error) {
      console.error('Erro ao atualizar endereço:', error);
      // Em caso de erro silencioso (rede), o usuário ainda pode editar manualmente
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  return (
    <>
      <div
        className={`${shared.overlay} ${isClosing ? shared.overlayClosing : ''}`}
        onAnimationEnd={handleAnimationEnd}
      >
        <div
          className={`${shared.modalContainer} ${isClosing ? shared.modalContainerClosing : ''}`}
        >
          <div className={shared.modalHeader}>
            <button className={styles.backButton} onClick={() => handleExit('back')}>
              <LuChevronLeft size={24} />
            </button>
            <h2 className={shared.modalTitle}>Confirme a localização</h2>
          </div>

          <div className={shared.modalContent}>
            {/* RESUMO DE ENDEREÇO COM INPUT INLINE */}
            <div className={styles.addressSummary}>
              <h3>{isUpdatingAddress ? 'Atualizando...' : currentAddress.bairro || 'Endereço'}</h3>

              <div className={styles.addressText}>
                <span>{currentAddress.logradouro},</span>

                {/* Input Inline Destacado para Número */}
                <input
                  ref={numberInputRef}
                  type="text"
                  className={styles.inlineInput}
                  value={currentAddress.numero}
                  onChange={handleChangeNumero}
                  placeholder="Nº"
                  disabled={isUpdatingAddress}
                />

                <span>
                  {' '}
                  - {currentAddress.cidade}/{currentAddress.estado}
                </span>
              </div>

              <span className={styles.cepText}>{currentAddress.cep}</span>
            </div>

            {/* AVISO VISUAL IMPORTANTE */}
            <div className={styles.warningMessage}>
              <LuTriangleAlert size={18} style={{ flexShrink: 0 }} />
              <span>
                Verifique se o <strong>número</strong> e a posição no <strong>mapa</strong> estão
                corretos.
              </span>
            </div>

            <div className={styles.mapWrapper}>
              {isMapReady ? (
                <MapComponent
                  height="250px"
                  center={mapCenter}
                  markers={mapMarkers}
                  zoom={18} // Zoom alto para ver detalhes de ruas
                  interactive={true} // Habilita arrastar o pino
                  onMarkerDragEnd={handleMarkerDrag}
                />
              ) : (
                <div className={styles.mapPlaceholderLoading}>
                  <LuLoaderCircle className="animate-spin" size={32} color="#ccc" />
                  <span>Carregando mapa...</span>
                </div>
              )}

              <div className={styles.mapOverlayHint}>Arraste o pino para ajustar</div>
            </div>
          </div>

          <div className={shared.modalFooter}>
            <Button
              variant="primary"
              onClick={() => handleExit('confirm')}
              className={styles.fullButton}
              disabled={isClosing || isUpdatingAddress}
            >
              {isUpdatingAddress ? 'Atualizando...' : 'Confirmar Endereço'}
            </Button>
          </div>
        </div>
      </div>

      {/* 4. Renderização do AlertModal */}
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

ConfirmarEnderecoFinalModal.propTypes = {
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
};

export default ConfirmarEnderecoFinalModal;
