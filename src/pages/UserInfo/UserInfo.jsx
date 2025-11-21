import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { LuPencilLine, LuCheck, LuX, LuLoaderCircle } from 'react-icons/lu';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import Section from '../../components/Section';
import styles from './UserInfo.module.css';
import Button from '../../components/Button';
import Input from '../../components/Input';
import InputCelular from '../../components/InputCelular';
import EnderecoModal from '../../components/Modals/EnderecoModal';
import { useAuth } from '../../contexts/AuthContext';

// --- COMPONENTE AUXILIAR ---
const EditableRow = ({
  label,
  name,
  value,
  onChange,
  onEditClick,
  onSaveClick,
  onCancelClick,
  isLocked,
  isSaving,
  error,
  type = 'text',
  isPhone = false,
}) => {
  const InputComponent = isPhone ? InputCelular : Input;

  return (
    <div className={`${styles.editableInputWrapper} ${!isLocked ? styles.activeWrapper : ''}`}>
      <div style={{ width: '100%' }}>
        <InputComponent
          label={label}
          name={name}
          value={value}
          onChange={onChange}
          type={type}
          error={error}
          disabled={isLocked || isSaving}
        />
      </div>

      <div className={styles.actionsContainer}>
        {isLocked ? (
          // MODO VISUALIZAÇÃO: Botão Editar
          <button
            className={styles.editIconBtn}
            onClick={() => onEditClick(name)}
            title="Editar campo"
            type="button"
          >
            <LuPencilLine size={18} />
          </button>
        ) : (
          // MODO EDIÇÃO: Botões Salvar e Cancelar
          <>
            <button
              className={`${styles.actionBtn} ${styles.cancelBtn}`}
              onClick={() => onCancelClick(name)}
              title="Cancelar"
              type="button"
              disabled={isSaving}
            >
              <LuX size={18} />
            </button>

            <button
              className={`${styles.actionBtn} ${styles.saveBtn}`}
              onClick={() => onSaveClick(name)}
              title="Salvar alterações"
              type="button"
              disabled={isSaving}
            >
              {isSaving ? (
                <LuLoaderCircle size={18} className={styles.spinning} />
              ) : (
                <LuCheck size={18} />
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

EditableRow.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
  onSaveClick: PropTypes.func.isRequired,
  onCancelClick: PropTypes.func.isRequired,
  isLocked: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool,
  error: PropTypes.string,
  type: PropTypes.string,
  isPhone: PropTypes.bool,
};

// --- COMPONENTE PRINCIPAL ---
const UserInfo = () => {
  const { user, loading, updateUser } = useAuth();

  // Estados dos campos
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [celularReserva, setCelularReserva] = useState('');

  const [savingFields, setSavingFields] = useState({});

  const [errors, setErrors] = useState({});
  const [disabledFields, setDisabledFields] = useState({
    nome: true,
    email: true,
    celular: true,
    celularReserva: true,
  });

  const [enderecoModalIsOpen, setEnderecoModalIsOpen] = useState(false);

  // Carrega dados iniciais
  useEffect(() => {
    if (user) {
      setNome(user.nome || '');
      setEmail(user.email || '');
      if (user.telefones && user.telefones.length > 0) {
        const tel1 = user.telefones[0];
        setCelular(tel1 ? `(${tel1.ddd}) ${tel1.numero}` : '');
        if (user.telefones.length > 1) {
          const tel2 = user.telefones[1];
          setCelularReserva(tel2 ? `(${tel2.ddd}) ${tel2.numero}` : '');
        }
      }
    }
  }, [user]);

  const validarCampo = (name, value) => {
    let error = null;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!value && (name === 'nome' || name === 'email')) {
      error = 'Campo obrigatório.';
    } else if (name === 'email' && !emailRegex.test(value)) {
      error = 'Email inválido.';
    } else if (
      (name === 'celular' || name === 'celularReserva') &&
      value.length < 14 &&
      value !== ''
    ) {
      error = 'Número incompleto.';
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  // Função Helper para reverter valor ao cancelar
  const getOriginalValue = (fieldName) => {
    if (!user) return '';
    if (fieldName === 'nome') return user.nome || '';
    if (fieldName === 'email') return user.email || '';
    if (fieldName === 'celular') {
      const t = user.telefones?.[0];
      return t ? `(${t.ddd}) ${t.numero}` : '';
    }
    if (fieldName === 'celularReserva') {
      const t = user.telefones?.[1];
      return t ? `(${t.ddd}) ${t.numero}` : '';
    }
    return '';
  };

  const handleEnableEdit = (fieldName) => {
    setDisabledFields((prev) => ({ ...prev, [fieldName]: false }));
    setTimeout(() => {
      const input = document.getElementsByName(fieldName)[0];
      if (input) input.focus();
    }, 50);
  };

  const handleCancel = (fieldName) => {
    const original = getOriginalValue(fieldName);
    if (fieldName === 'nome') setNome(original);
    if (fieldName === 'email') setEmail(original);
    if (fieldName === 'celular') setCelular(original);
    if (fieldName === 'celularReserva') setCelularReserva(original);

    setErrors((prev) => ({ ...prev, [fieldName]: null }));
    setDisabledFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleSave = async (fieldName) => {
    let valueToSave = '';
    if (fieldName === 'nome') valueToSave = nome;
    if (fieldName === 'email') valueToSave = email;
    if (fieldName === 'celular') valueToSave = celular;
    if (fieldName === 'celularReserva') valueToSave = celularReserva;

    const error = validarCampo(fieldName, valueToSave);
    if (error) return;

    setSavingFields((prev) => ({ ...prev, [fieldName]: true }));

    try {
      // Chama o Contexto para atualizar (Simula API)
      // Nota: Para telefones, a lógica seria mais complexa (separar DDD)
      await updateUser({ [fieldName]: valueToSave });

      setDisabledFields((prev) => ({ ...prev, [fieldName]: true }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [fieldName]: 'Erro ao salvar.' }));
    } finally {
      setSavingFields((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'nome') setNome(value);
    if (name === 'email') setEmail(value);
    if (name === 'celular') setCelular(value);
    if (name === 'celularReserva') setCelularReserva(value);
  };

  // --- Handlers do Modal ---
  const handleOpenEndereco = () => {
    setEnderecoModalIsOpen(true);
  };

  const handleCloseEndereco = () => {
    setEnderecoModalIsOpen(false);
  };

  const handleAtualizaEndereco = async (dadosEndereco) => {
    try {
      await updateUser({ endereco: dadosEndereco });

      setEnderecoModalIsOpen(false);

      // eslint-disable-next-line no-alert
      alert('Endereço atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
      // eslint-disable-next-line no-alert
      alert('Não foi possível atualizar o endereço. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <Section>
        <div style={{ textAlign: 'center', padding: '4rem' }}>Carregando...</div>
      </Section>
    );
  }

  return (
    <Section>
      <div className={styles.infoContainer}>
        <div className={styles.contentBlock}>
          <div className={styles.topContent}>
            <IoIosInformationCircleOutline size={30} />
            <h3 style={{ color: 'var(--text-body)' }}>Informações da Conta</h3>
            <p style={{ fontSize: '0.9rem' }}>Gerencie suas informações pessoais</p>
          </div>

          <div className={styles.cardBody}>
            <EditableRow
              label="Nome"
              name="nome"
              value={nome}
              onChange={handleChange}
              onEditClick={handleEnableEdit}
              onSaveClick={handleSave}
              onCancelClick={handleCancel}
              isLocked={disabledFields.nome}
              isSaving={savingFields.nome}
              error={errors.nome}
            />

            <EditableRow
              label="Email"
              name="email"
              value={email}
              onChange={handleChange}
              onEditClick={handleEnableEdit}
              onSaveClick={handleSave}
              onCancelClick={handleCancel}
              isLocked={disabledFields.email}
              isSaving={savingFields.email}
              error={errors.email}
            />

            <EditableRow
              label="Telefone"
              name="celular"
              value={celular}
              onChange={handleChange}
              onEditClick={handleEnableEdit}
              onSaveClick={handleSave}
              onCancelClick={handleCancel}
              isLocked={disabledFields.celular}
              isSaving={savingFields.celular}
              error={errors.celular}
              isPhone
            />

            <EditableRow
              label="Telefone (reserva)"
              name="celularReserva"
              value={celularReserva}
              onChange={handleChange}
              onEditClick={handleEnableEdit}
              onSaveClick={handleSave}
              onCancelClick={handleCancel}
              isLocked={disabledFields.celularReserva}
              isSaving={savingFields.celularReserva}
              error={errors.celularReserva}
              isPhone
            />

            <div className={styles.botaoEnderecoContainer}>
              <Button
                variant="outline-yellow"
                className={styles.botaoEndereco}
                onClick={handleOpenEndereco}
              >
                Ver endereço
              </Button>
            </div>
          </div>
        </div>

        <div className={styles.buttonBlock}>
          <Button variant="primary" className={styles.botaoExcluir}>
            Excluir conta
          </Button>
        </div>
      </div>

      {/* RENDERIZAÇÃO DO MODAL */}
      {enderecoModalIsOpen && (
        <EnderecoModal
          onClose={handleCloseEndereco}
          onSave={handleAtualizaEndereco}
          initialData={user?.endereco}
        />
      )}
    </Section>
  );
};

export default UserInfo;
