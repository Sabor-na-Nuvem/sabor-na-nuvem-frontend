import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { LuChevronLeft, LuLoaderCircle } from 'react-icons/lu';
import Button from '../../Button';
import MapComponent from '../../MapComponent/MapComponent';
import { CENTRO_BRASILIA } from '../../../data/locaisBrasilia';
import { getStateCode } from '../../../utils/enderecoUtils';
import styles from './ConfirmarEnderecoModal.module.css';
import shared from '../ModalShared.module.css';

const ConfirmarEnderecoFinalModal = ({ endereco, onBack, onConfirm }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // Estado local para o endereço (pode mudar ao arrastar o mapa)
  const [currentAddress, setCurrentAddress] = useState(endereco);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);

  // Ref para guardar qual ação disparou o fechamento ('back' ou 'confirm')
  // Usamos ref para evitar problemas de closure no handleAnimationEnd
  const actionTypeRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsMapReady(true), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setCurrentAddress(endereco);
  }, [endereco]);

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

  const handleExit = (type) => {
    if (isClosing) return;

    // Guarda a ação na ref para usar no fim da animação
    actionTypeRef.current = type;

    if (type === 'confirm') {
      // Se for confirmar, já passamos o endereço atualizado para o pai
      onConfirm(currentAddress);
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

  // --- LÓGICA DE ATUALIZAÇÃO PELO MAPA ---
  const handleMarkerDrag = async (id, newCoords) => {
    setIsUpdatingAddress(true);

    try {
      setCurrentAddress((prev) => ({
        ...prev,
        latitude: newCoords.lat,
        longitude: newCoords.lng,
      }));

      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newCoords.lat}&lon=${newCoords.lng}&addressdetails=1&zoom=18`;
      const res = await fetch(url, { headers: { 'User-Agent': 'SaborNaNuvemApp/1.0' } });
      const data = await res.json();

      if (data && data.address) {
        const addr = data.address;
        setCurrentAddress((prev) => ({
          ...prev,
          logradouro: addr.road || addr.pedestrian || addr.street || prev.logradouro,
          numero: addr.house_number || '',
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
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  return (
    <div
      className={`${shared.overlay} ${isClosing ? shared.overlayClosing : ''}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className={`${shared.modalContainer} ${isClosing ? shared.modalContainerClosing : ''}`}>
        <div className={shared.modalHeader}>
          <button className={styles.backButton} onClick={() => handleExit('back')}>
            <LuChevronLeft size={24} />
          </button>
          <h2 className={shared.modalTitle}>Confirme o endereço</h2>
        </div>

        <div className={shared.modalContent}>
          <div className={styles.addressSummary}>
            <h3>{isUpdatingAddress ? 'Atualizando...' : currentAddress.bairro || 'Endereço'}</h3>
            <p style={{ opacity: isUpdatingAddress ? 0.5 : 1 }}>
              {`${currentAddress.logradouro}, ${currentAddress.numero || 'S/N'}, ${currentAddress.cidade} - ${currentAddress.estado}`}
            </p>
            <p style={{ fontSize: '0.8rem', marginTop: 5, color: '#888' }}>{currentAddress.cep}</p>
          </div>

          <div className={styles.mapWrapper}>
            {isMapReady ? (
              <MapComponent
                height="250px"
                center={mapCenter}
                markers={mapMarkers}
                zoom={16}
                interactive={true}
                onMarkerDragEnd={handleMarkerDrag}
              />
            ) : (
              <div className={styles.mapPlaceholderLoading}>
                <LuLoaderCircle className="animate-spin" size={32} color="#ccc" />
                <span>Carregando mapa...</span>
              </div>
            )}

            <div
              style={{
                position: 'absolute',
                bottom: 10,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(255,255,255,0.9)',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: '0.75rem',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                pointerEvents: 'none',
                zIndex: 400,
              }}
            >
              Arraste o pino para ajustar
            </div>
          </div>
        </div>

        <div className={shared.modalFooter}>
          <Button
            variant="primary"
            onClick={() => handleExit('confirm')}
            className={styles.fullButton}
            disabled={isClosing || isUpdatingAddress}
          >
            {isUpdatingAddress ? 'Atualizando local...' : 'Confirmar Localização'}
          </Button>
        </div>
      </div>
    </div>
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
