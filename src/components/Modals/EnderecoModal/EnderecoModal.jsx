/* eslint-disable no-nested-ternary */
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { LuMapPin, LuX, LuPencilLine, LuLoaderCircle } from 'react-icons/lu';
import Button from '../../Button';
import Input from '../../Input';
import Select from '../../Select';
import styles from './EnderecoModal.module.css';
import shared from '../ModalShared.module.css';
import { ESTADOS_BRASIL } from '../../../constants/estados';
import AlertModal from '../AlertModal/AlertModal';
import { normalizeText, getStateCode } from '../../../utils/enderecoUtils';
import ModalWrapper from '../ModalWrapper';
import { useAuth } from '../../../contexts/AuthContext';

const EnderecoModal = ({
  onClose,
  onSave,
  textoBotao = 'Continuar',
  initialData = null,
  startEditing = false,
}) => {
  const { user } = useAuth();
  // Estados de Lógica de Negócio
  const [isEditing, setIsEditing] = useState(!initialData || startEditing);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  // Estados Visuais (Flash)
  const [highlightAutoFill, setHighlightAutoFill] = useState(false);
  const [highlightCep, setHighlightCep] = useState(false);

  // Estado do Alerta Interno
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
    pontoReferencia: '',
  });

  const [errors, setErrors] = useState({});
  const [cepDataReference, setCepDataReference] = useState(null);

  // Inicialização dos dados
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
        pontoReferencia: initialData.referencia || initialData.pontoReferencia || '',
      });
    }
  }, [initialData]);

  // Helpers de UI
  const showAlert = (title, msg, type = 'error') =>
    setAlertInfo({ isOpen: true, title, msg, type });
  const closeAlert = () => setAlertInfo((prev) => ({ ...prev, isOpen: false }));
  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
    if (isUserPage) setFormData(user.endereco);
  };

  // --- LÓGICA 1: BUSCA POR CEP ---
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

  // --- LÓGICA 2: BUSCA CEP PELO ENDEREÇO ---
  const encontrarCepPeloEndereco = async () => {
    const { estado, cidade, logradouro } = formData;
    if (!estado || !cidade || logradouro.length < 3) {
      showAlert('Dados insuficientes', 'Preencha Estado, Cidade e Logradouro.', 'primary');
      return;
    }
    setIsSearchingCep(true);
    setHighlightCep(false);
    try {
      const url = `https://viacep.com.br/ws/${estado}/${encodeURIComponent(cidade)}/${encodeURIComponent(logradouro)}/json/`;
      const r = await fetch(url);
      const d = await r.json();
      if (d && d.length > 0) {
        setFormData((prev) => ({ ...prev, cep: d[0].cep }));
        setCepDataReference(d[0]);
        setErrors((prev) => {
          const n = { ...prev };
          delete n.cep;
          return n;
        });
        setHighlightCep(true);
        setTimeout(() => setHighlightCep(false), 2000);
      } else {
        showAlert('Não encontrado', 'Verifique os dados.', 'error');
      }
    } catch (error) {
      showAlert('Erro', 'Falha ao buscar CEP.', 'error');
    } finally {
      setIsSearchingCep(false);
    }
  };

  // --- LÓGICA 3: GEOLOCALIZAÇÃO ATUAL ---
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
              pontoReferencia: '',
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
      (_e) => {
        setIsLocating(false);
        showAlert('Erro de localização', 'Não foi possível obter sua posição.', 'error');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  // --- VALIDAÇÃO E SUBMISSÃO ---
  const checkConsistency = () => {
    if (!cepDataReference) return true;
    const curUF = normalizeText(formData.estado);
    const cepUF = normalizeText(cepDataReference.uf);
    const curCity = normalizeText(formData.cidade);
    const cepCity = normalizeText(cepDataReference.localidade);
    if (curUF && cepUF && curUF !== cepUF) {
      showAlert('Inconsistência', `O Estado (${formData.estado}) não bate com o CEP.`, 'error');
      return false;
    }
    if (curCity && cepCity && curCity !== cepCity && !curCity.includes(cepCity)) return false;
    return true;
  };

  const fetchCoordinates = async (d) => {
    const q = `${d.logradouro}, ${d.numero}, ${d.bairro}, ${d.cidade}, ${d.estado}, Brazil`;
    const u = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`;
    try {
      const r = await fetch(u, { headers: { 'User-Agent': 'SaborNaNuvemApp/1.0' } });
      const j = await r.json();
      if (j.length > 0) return { latitude: j[0].lat, longitude: j[0].lon };
    } catch (e) {
      // Deixar vazio
    }
    return null;
  };

  const validateForm = () => {
    const n = {};
    if (!formData.cep) n.cep = 'Obrigatório';
    if (!formData.logradouro) n.logradouro = 'Obrigatório';
    if (!formData.numero) n.numero = 'Obrigatório';
    if (!formData.bairro) n.bairro = 'Obrigatório';
    if (!formData.cidade) n.cidade = 'Obrigatório';
    if (!formData.estado) n.estado = 'Obrigatório';
    setErrors(n);
    return Object.keys(n).length === 0;
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
      <ModalWrapper onClose={onClose} containerClassName={styles.containerLarger}>
        {({ requestClose }) => {
          const handleSubmit = async (e) => {
            if (e) e.preventDefault();
            if (validateForm()) {
              if (!checkConsistency()) return;
              setIsGeocoding(true);
              try {
                const c = await fetchCoordinates(formData);
                onSave({
                  ...formData,
                  latitude: c ? c.latitude : null,
                  longitude: c ? c.longitude : null,
                });
                // Fecha com animação após salvar com sucesso
                requestClose();
              } catch (err) {
                onSave(formData);
                requestClose();
              } finally {
                setIsGeocoding(false);
              }
            }
          };

          return (
            <>
              <div className={shared.modalHeader}>
                <h2 className={shared.modalTitle}>Endereço de entrega</h2>
                <button
                  className={`${shared.closeButton} ${styles.closeBtnPosition}`}
                  onClick={requestClose}
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
                        <LuLoaderCircle className={styles.spinning} style={{ marginRight: 8 }} />{' '}
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
                  {/* Campo CEP */}
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

                  {/* Outros Campos */}
                  <div
                    className={`${styles.spanHalf} ${highlightAutoFill ? styles.autoFilled : ''}`}
                  >
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
                  <div
                    className={`${styles.spanFull} ${highlightAutoFill ? styles.autoFilled : ''}`}
                  >
                    <Input
                      label="Cidade"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleChange}
                      disabled={!isEditing}
                      error={errors.cidade}
                    />
                  </div>
                  <div
                    className={`${styles.spanFull} ${highlightAutoFill ? styles.autoFilled : ''}`}
                  >
                    <Input
                      label="Bairro"
                      name="bairro"
                      value={formData.bairro}
                      onChange={handleChange}
                      disabled={!isEditing}
                      error={errors.bairro}
                    />
                  </div>
                  <div
                    className={`${styles.spanFull} ${highlightAutoFill ? styles.autoFilled : ''}`}
                  >
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
                      value={formData.pontoReferencia}
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
                            <LuLoaderCircle
                              className={styles.spinning}
                              style={{ marginRight: 8 }}
                            />
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
            </>
          );
        }}
      </ModalWrapper>

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
  onSave: PropTypes.func.isRequired,
  textoBotao: PropTypes.string,
  initialData: PropTypes.object,
  startEditing: PropTypes.bool,
};

export default EnderecoModal;
