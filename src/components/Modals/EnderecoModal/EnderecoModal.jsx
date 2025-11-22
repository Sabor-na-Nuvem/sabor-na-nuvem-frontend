/* eslint-disable no-nested-ternary */
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { LuMapPin, LuX, LuPencilLine, LuLoaderCircle } from 'react-icons/lu';
import { ESTADOS_BRASIL } from '../../../constants/estados';
import { getStateCode, normalizeText } from '../../../utils/enderecoUtils';
import Button from '../../Button';
import Input from '../../Input';
import Select from '../../Select';
import styles from './EnderecoModal.module.css';
import shared from '../ModalShared.module.css';
import AlertModal from '../AlertModal/AlertModal';

const EnderecoModal = ({
  onClose,
  onSave,
  textoBotao = 'Continuar',
  initialData = null,
  startEditing = false,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isEditing, setIsEditing] = useState(!initialData || startEditing);

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  // Controlam os flashes visuais
  const [highlightAutoFill, setHighlightAutoFill] = useState(false); // Para campos gerais
  const [highlightCep, setHighlightCep] = useState(false); // Específico para o CEP

  const [alertInfo, setAlertInfo] = useState({
    isOpen: false,
    title: '',
    msg: '',
    type: 'primary',
  });

  const numeroInputRef = useRef(null);
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
  const [cepDataReference, setCepDataReference] = useState(null);

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
        referencia: initialData.referencia || initialData.pontoReferencia || '',
      });
    }
  }, [initialData]);

  const showAlert = (title, msg, type = 'error') =>
    setAlertInfo({ isOpen: true, title, msg, type });
  const closeAlert = () => setAlertInfo((prev) => ({ ...prev, isOpen: false }));
  const handleClose = () => setIsClosing(true);
  const handleToggleEdit = () => setIsEditing(!isEditing);

  const handleAnimationEnd = (e) => {
    if (e.target !== e.currentTarget) return;
    if (isClosing) {
      onClose();
      setIsClosing(false);
    }
  };

  // --- 1. BUSCA POR CEP (ViaCEP) ---
  const buscarDadosPorCep = async (cep) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setIsFetchingCep(true);
    setHighlightAutoFill(false);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setErrors((prev) => ({ ...prev, cep: 'CEP não encontrado.' }));
        return;
      }

      setCepDataReference(data);

      setFormData((prev) => ({
        ...prev,
        logradouro: data.logradouro || prev.logradouro,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        estado: data.uf || prev.estado,
      }));

      setErrors((prev) => {
        const newErrors = { ...prev };
        ['cep', 'logradouro', 'bairro', 'cidade', 'estado'].forEach((k) => delete newErrors[k]);
        return newErrors;
      });

      // Ativa animação nos campos de endereço
      setHighlightAutoFill(true);
      setTimeout(() => setHighlightAutoFill(false), 2000);

      setTimeout(() => {
        if (numeroInputRef.current) numeroInputRef.current.focus();
      }, 100);
    } catch (error) {
      setErrors((prev) => ({ ...prev, cep: 'Erro de conexão.' }));
    } finally {
      setIsFetchingCep(false);
    }
  };

  // --- 2. BUSCA CEP PELO ENDEREÇO ---
  const encontrarCepPeloEndereco = async () => {
    const { estado, cidade, logradouro } = formData;

    if (!estado || !cidade || logradouro.length < 3) {
      showAlert(
        'Dados insuficientes',
        'Preencha Estado, Cidade e pelo menos 3 letras do Logradouro para buscar o CEP.',
        'primary'
      );
      return;
    }

    setIsSearchingCep(true);
    setHighlightCep(false);

    try {
      const url = `https://viacep.com.br/ws/${estado}/${encodeURIComponent(cidade)}/${encodeURIComponent(logradouro)}/json/`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.length > 0) {
        const bestMatch = data[0];
        setFormData((prev) => ({ ...prev, cep: bestMatch.cep }));
        setCepDataReference(bestMatch);

        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.cep;
          return newErrors;
        });

        // Ativa animação no CEP
        setHighlightCep(true);
        setTimeout(() => setHighlightCep(false), 2000);
      } else {
        showAlert(
          'Não encontrado',
          'Não encontramos um CEP para este endereço. Verifique a grafia.',
          'error'
        );
      }
    } catch (error) {
      showAlert('Erro', 'Falha ao buscar CEP.', 'error');
    } finally {
      setIsSearchingCep(false);
    }
  };

  // --- 3. GEOLOCALIZAÇÃO ATUAL (GPS + REVERSE GEOCODING) ---
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      showAlert('Erro', 'Não suportado.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        try {
          const { latitude, longitude } = p.coords;
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`;
          const res = await fetch(url, { headers: { 'User-Agent': 'SaborNaNuvemApp/1.0' } });
          const d = await res.json();
          if (d && d.address) {
            const a = d.address;
            const novo = {
              cep: `${(a.postcode || '').replace(/\D/g, '').slice(0, 5)}-${(a.postcode || '')
                .replace(/\D/g, '')
                .slice(5)}`,
              logradouro: a.road || a.pedestrian || a.street || '',
              numero: a.house_number || '',
              bairro: a.suburb || a.neighbourhood || a.residential || '',
              cidade: a.city || a.town || a.municipality || '',
              estado: getStateCode(a.state) || '',
              complemento: '',
              referencia: '',
            };
            setFormData((prev) => ({ ...prev, ...novo }));
            setErrors({});
            if (novo.cep.length >= 8) buscarDadosPorCep(novo.cep);
          } else {
            showAlert('Erro', 'Endereço não encontrado.', 'error');
          }
        } catch (e) {
          showAlert('Erro', 'Erro de conexão.', 'error');
        } finally {
          setIsLocating(false);
        }
      },
      // eslint-disable-next-line no-unused-vars
      (e) => {
        setIsLocating(false);
        showAlert('Erro de localização', 'Não foi possível obter sua posição.', 'error');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  // --- 4. VALIDAÇÃO DE CONSISTÊNCIA ---
  const checkConsistency = () => {
    if (!cepDataReference) return true;
    const currentUF = normalizeText(formData.estado);
    const cepUF = normalizeText(cepDataReference.uf);
    const currentCity = normalizeText(formData.cidade);
    const cepCity = normalizeText(cepDataReference.localidade);

    if (currentUF && cepUF && currentUF !== cepUF) {
      showAlert(
        'Inconsistência',
        `O Estado (${formData.estado}) não bate com o CEP (${cepDataReference.uf}).`,
        'error'
      );
      return false;
    }
    if (
      currentCity &&
      cepCity &&
      currentCity !== cepCity &&
      !currentCity.includes(cepCity) &&
      !cepCity.includes(currentCity)
    ) {
      return false;
    }
    return true;
  };

  // --- 5. GEOCODING DIRETO (Endereço -> Lat/Lng para salvar) ---
  const fetchCoordinates = async (d) => {
    const q = `${d.logradouro}, ${d.numero}, ${d.bairro}, ${d.cidade}, ${d.estado}, Brazil`;
    const u = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`;
    try {
      const r = await fetch(u, { headers: { 'User-Agent': 'SaborNaNuvemApp/1.0' } });
      const j = await r.json();
      if (j.length > 0) return { latitude: j[0].lat, longitude: j[0].lon };
    } catch (e) {
      // Manter vazio
    }
    return null;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.cep) newErrors.cep = 'Obrigatório';
    if (!formData.logradouro) newErrors.logradouro = 'Obrigatório';
    if (!formData.numero) newErrors.numero = 'Obrigatório';
    if (!formData.bairro) newErrors.bairro = 'Obrigatório';
    if (!formData.cidade) newErrors.cidade = 'Obrigatório';
    if (!formData.estado) newErrors.estado = 'Obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (validateForm()) {
      if (!checkConsistency()) return;
      setIsGeocoding(true);
      try {
        const c = await fetchCoordinates(formData);
        onSave({ ...formData, latitude: c ? c.latitude : null, longitude: c ? c.longitude : null });
      } catch (err) {
        onSave(formData);
      } finally {
        setIsGeocoding(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let final = value;
    if (name === 'cep') {
      const clean = value.replace(/\D/g, '');
      final = clean.length > 5 ? `${clean.slice(0, 5)}-${clean.slice(5, 8)}` : clean.slice(0, 8);
      if (clean.length === 8) buscarDadosPorCep(clean);
      if (clean.length < 8) setCepDataReference(null);
    }
    if (errors[name])
      setErrors((p) => {
        const n = { ...p };
        delete n[name];
        return n;
      });
    setFormData((p) => ({ ...p, [name]: final }));
  };

  return (
    <>
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
              <Button
                variant="outline-yellow"
                className={styles.locationButton}
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
              >
                {isLocating ? (
                  <>
                    <LuLoaderCircle className={styles.spinning} style={{ marginRight: 8 }} />
                    Localizando...
                  </>
                ) : (
                  <>
                    <LuMapPin size={18} style={{ marginRight: 8 }} /> Usar localização atual
                  </>
                )}
              </Button>
            </div>

            <form
              id="address-form"
              onSubmit={handleSubmit}
              className={`${styles.formGrid} ${isEditing ? styles.modeEditing : styles.modeReading}`}
            >
              {/* CEP com destaque condicional */}
              <div
                className={`${styles.spanHalf} ${highlightCep ? styles.autoFilled : ''}`}
                style={{ position: 'relative' }}
              >
                <Input
                  label="CEP"
                  name="cep"
                  value={formData.cep}
                  onChange={handleChange}
                  placeholder="00000-000"
                  disabled={!isEditing}
                  maxLength={9}
                  error={errors.cep}
                  inputMode="numeric"
                />
                {isFetchingCep && (
                  <div style={{ position: 'absolute', right: 10, top: 38, color: '#c25153' }}>
                    <LuLoaderCircle className={styles.spinning} />
                  </div>
                )}

                {isEditing && !isFetchingCep && formData.cep.length < 8 && (
                  <button
                    type="button"
                    onClick={encontrarCepPeloEndereco}
                    className={styles.findCepLink}
                    disabled={isSearchingCep}
                  >
                    {isSearchingCep ? 'Buscando...' : 'Não sei meu CEP'}
                  </button>
                )}
              </div>

              {/* Demais campos com destaque condicional */}
              <div className={`${styles.spanHalf} ${highlightAutoFill ? styles.autoFilled : ''}`}>
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
              <div className={`${styles.spanFull} ${highlightAutoFill ? styles.autoFilled : ''}`}>
                <Input
                  label="Cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  disabled={!isEditing}
                  error={errors.cidade}
                />
              </div>
              <div className={`${styles.spanFull} ${highlightAutoFill ? styles.autoFilled : ''}`}>
                <Input
                  label="Bairro"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  disabled={!isEditing}
                  error={errors.bairro}
                />
              </div>
              <div className={`${styles.spanFull} ${highlightAutoFill ? styles.autoFilled : ''}`}>
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
                  ref={numeroInputRef}
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
                  <LuPencilLine size={18} style={{ marginRight: 8 }} /> Editar Endereço
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
                    type="button"
                    onClick={handleSubmit}
                    variant="primary"
                    className={styles.submitButton}
                    disabled={isGeocoding || isFetchingCep || isLocating}
                  >
                    {isGeocoding ? (
                      <>
                        <LuLoaderCircle className={styles.spinning} style={{ marginRight: 8 }} />
                        Buscando...
                      </>
                    ) : isUserPage ? (
                      'Salvar Alterações'
                    ) : (
                      textoBotao
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
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

EnderecoModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
  textoBotao: PropTypes.string,
  initialData: PropTypes.object,
  startEditing: PropTypes.bool,
};

export default EnderecoModal;
