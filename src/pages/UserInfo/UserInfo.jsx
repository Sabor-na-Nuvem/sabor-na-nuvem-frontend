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
import AlertModal from '../../components/Modals/AlertModal';
import ConfirmModal from '../../components/Modals/ConfirmModal';
import { useAuth } from '../../contexts/AuthContext';
import AtualizarSenhaModal from '../../components/Modals/AtualizarSenhaModal';
import ConfirmarEnderecoFinalModal from '../../components/Modals/ConfirmarEnderecoModal/ConfirmarEnderecoFinalModal';
import api from '../../services/api';

// --- COMPONENTE AUXILIAR (EditableRow) ---
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
          <button
            className={styles.editIconBtn}
            onClick={() => onEditClick(name)}
            title="Editar campo"
            type="button"
          >
            <LuPencilLine size={18} />
          </button>
        ) : (
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
  const { user, loading, updateUser, refreshUser, logout } = useAuth();

  // Estados dos campos de usuário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [celularReserva, setCelularReserva] = useState('');
  const [endereco, setEndereco] = useState({});

  // Estado temporário para o novo email enquanto aguarda a senha
  const [pendingEmail, setPendingEmail] = useState('');

  const [savingFields, setSavingFields] = useState({});
  const [errors, setErrors] = useState({});
  const [disabledFields, setDisabledFields] = useState({
    nome: true,
    email: true,
    celular: true,
    celularReserva: true,
  });

  // Modais de Endereço
  const [enderecoModalIsOpen, setEnderecoModalIsOpen] = useState(false);
  const [confirmarEnderecoModalIsOpen, setConfirmarEnderecoModalIsOpen] = useState(false);
  const [startEnderecoEditing, setStartEnderecoEditing] = useState(false);

  // Modais de Confirmação
  const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
  const [confirmEmailModalIsOpen, setConfirmEmailModalIsOpen] = useState(false);

  // Modal de Senha
  const [senhaModalIsOpen, setSenhaModalIsOpen] = useState(false);

  // Estado para controlar o AlertModal
  const [alertInfo, setAlertInfo] = useState({
    isOpen: false,
    title: '',
    msg: '',
    type: 'primary', // 'primary', 'success', 'error'
  });

  // --- Handlers do ConfirmModal ---
  const showConfirm = () => {
    setConfirmModalIsOpen(true);
  };

  const closeConfirm = () => {
    setConfirmModalIsOpen(false);
  };

  // --- Handlers do AlertModal ---
  const showAlert = (title, msg, type = 'primary') => {
    setAlertInfo({ isOpen: true, title, msg, type });
  };

  const closeAlert = () => {
    setAlertInfo((prev) => ({ ...prev, isOpen: false }));
  };

  // --- Handlers do EnderecoModal ---
  const showEnderecoModal = () => {
    if (confirmarEnderecoModalIsOpen) {
      setStartEnderecoEditing(true);
      setConfirmarEnderecoModalIsOpen(false);
      setTimeout(() => {
        setEnderecoModalIsOpen(true);
      }, 400);
    } else {
      setEnderecoModalIsOpen(true);
    }
  };

  const closeEnderecoModal = () => {
    setEnderecoModalIsOpen(false);
    setStartEnderecoEditing(false);
  };

  // --- Handler do ConfirmarEnderecoModal ---
  const showConfirmarEndereco = (dadosNovos) => {
    setEndereco(dadosNovos);
    setTimeout(() => {
      setConfirmarEnderecoModalIsOpen(true);
    }, 400);
  };

  const closeConfirmarEnderecoModal = () => {
    setConfirmarEnderecoModalIsOpen(false);
  };

  // --- Handlers do AtualizarSenhaModal ---
  const showSenhaModal = () => {
    setSenhaModalIsOpen(true);
  };

  const closeSenhaModal = () => {
    setSenhaModalIsOpen(false);
  };

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
      if (user.endereco) {
        setEndereco(user.endereco);
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

  const capitalizeFirstLetter = (str) => {
    if (typeof str !== 'string' || str.length === 0) {
      return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const parseTelefone = (valorMascarado) => {
    const apenasNumeros = valorMascarado.replace(/\D/g, '');
    return {
      ddd: apenasNumeros.substring(0, 2),
      numero: apenasNumeros.substring(2),
    };
  };

  // --- LÓGICA DE SALVAR CAMPO INDIVIDUAL ---
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
      // CASO 1: Atualizar NOME
      if (fieldName === 'nome') {
        await updateUser({ nome: valueToSave });
      }

      // CASO 2: Atualizar EMAIL (Requer Senha)
      if (fieldName === 'email') {
        // Se o email não mudou, apenas cancela a edição
        if (valueToSave === user.email) {
          setDisabledFields((prev) => ({ ...prev, [fieldName]: true }));
          setSavingFields((prev) => ({ ...prev, [fieldName]: false }));
          return;
        }

        // Armazena o email novo e abre o modal de senha
        setPendingEmail(valueToSave);
        setConfirmEmailModalIsOpen(true);

        setSavingFields((prev) => ({ ...prev, [fieldName]: false }));
        return;
      }

      // CASO 3: Atualizar TELEFONES
      if (fieldName === 'celular' || fieldName === 'celularReserva') {
        const index = fieldName === 'celular' ? 0 : 1;
        const telefoneExistente = user.telefones && user.telefones[index];
        const { ddd, numero } = parseTelefone(valueToSave);

        if (telefoneExistente) {
          await api.put(`/usuarios/${user.id}/telefones/${telefoneExistente.id}`, { ddd, numero });
        } else {
          await api.post(`/usuarios/${user.id}/telefones`, { ddd, numero });
        }

        const novosTelefones = [...(user.telefones || [])];
        if (telefoneExistente) {
          novosTelefones[index] = { ...novosTelefones[index], ddd, numero };
        } else {
          novosTelefones[index] = { ddd, numero, id: 'temp' };
          await refreshUser();
        }
      }

      setDisabledFields((prev) => ({ ...prev, [fieldName]: true }));
      showAlert(
        'Sucesso',
        `${capitalizeFirstLetter(fieldName === 'celularReserva' ? 'Celular Reserva' : fieldName)} atualizado!`,
        'success'
      );
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({ ...prev, [fieldName]: 'Erro ao salvar.' }));
      showAlert('Erro', 'Não foi possível salvar as alterações.', 'error');
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

  // --- LÓGICA DE ATUALIZAR EMAIL (COM SENHA) ---
  const handleConfirmEmailUpdate = async (senhaAtual) => {
    try {
      if (!senhaAtual) {
        showAlert('Erro', 'Senha é obrigatória.', 'error');
        return;
      }

      await api.post('/auth/request-email-update', {
        novoEmail: pendingEmail,
        senhaAtual,
      });

      setConfirmEmailModalIsOpen(false);
      setDisabledFields((prev) => ({ ...prev, email: true }));

      showAlert(
        'Verifique seu e-mail',
        `Enviamos um link de confirmação para ${pendingEmail}. Clique nele para finalizar a alteração.`,
        'success'
      );

      // Restaura o valor do input para o email atual até que a confirmação ocorra
      setEmail(user.email);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Erro ao solicitar alteração.';
      showAlert('Erro', msg, 'error');
    }
  };

  // --- LÓGICA DE SALVAR ENDEREÇO ---
  const handleAtualizaEndereco = async (dadosEndereco) => {
    try {
      const enderecoSanitizado = {
        ...dadosEndereco,
        estado: dadosEndereco.estado ? dadosEndereco.estado.toUpperCase() : '',
      };

      // Verifica se já existe endereço para decidir entre PUT ou POST
      if (user.endereco && user.endereco.id) {
        await api.put(`/usuarios/${user.id}/endereco`, enderecoSanitizado);
      } else {
        await api.post(`/usuarios/${user.id}/endereco`, enderecoSanitizado);
      }

      // Atualiza contexto
      await refreshUser();

      setConfirmarEnderecoModalIsOpen(false);
      setStartEnderecoEditing(false);

      showAlert('Sucesso!', 'Endereço atualizado com sucesso!', 'success');
    } catch (error) {
      console.error(error);
      showAlert('Erro', 'Não foi possível atualizar o endereço. Tente novamente.', 'error');
    }
  };

  // --- LÓGICA DE EXCLUIR CONTA ---
  const handleDeletarUsuario = async (senhaConfirmacao) => {
    try {
      if (!senhaConfirmacao) {
        showAlert('Erro', 'Senha é obrigatória para excluir a conta.', 'error');
        return;
      }
      await api.delete('/usuarios/me', { data: { senha: senhaConfirmacao } });

      // Salva uma "Flash Message" no storage para a próxima tela ler
      localStorage.setItem('delete_feedback', 'true');

      await logout();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Não foi possível excluir a conta.';
      showAlert('Erro', msg, 'error');
    }
  };

  // --- LÓGICA DE ATUALIZAR SENHA ---
  const handleUpdatePassword = async ({ senhaAntiga, novaSenha }) => {
    try {
      await api.patch('/auth/update-password', { senhaAntiga, novaSenha });

      setSenhaModalIsOpen(false);

      showAlert(
        'Senha Atualizada',
        'Sua senha foi alterada com sucesso. Por segurança, suas outras sessões foram desconectadas.',
        'success'
      );
    } catch (error) {
      console.error(error);

      const errorMsg = error.response?.data?.message || 'Não foi possível atualizar a senha.';
      showAlert('Erro', errorMsg, 'error');

      throw error;
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
            <div className={styles.title}>
              <IoIosInformationCircleOutline size={30} />
              <h3 style={{ color: 'var(--text-body)' }}>Informações da Conta</h3>
            </div>
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
                onClick={showEnderecoModal}
              >
                Ver endereço
              </Button>

              <Button
                variant="outline-yellow"
                className={styles.botaoEndereco}
                onClick={showSenhaModal}
              >
                Atualizar senha
              </Button>
            </div>
          </div>
        </div>

        <div className={styles.buttonBlock}>
          <Button variant="primary" className={styles.botaoExcluir} onClick={showConfirm}>
            Excluir conta
          </Button>
        </div>
      </div>

      {/* RENDERIZAÇÃO DOS MODAIS */}

      {/* Modal de Endereco */}
      {enderecoModalIsOpen && (
        <EnderecoModal
          onClose={closeEnderecoModal}
          onSave={showConfirmarEndereco}
          initialData={endereco}
          startEditing={startEnderecoEditing}
        />
      )}

      {/* Modal de Confirmar Endereco */}
      {confirmarEnderecoModalIsOpen && (
        <ConfirmarEnderecoFinalModal
          endereco={endereco}
          onBack={showEnderecoModal}
          onConfirm={handleAtualizaEndereco}
          onClose={closeConfirmarEnderecoModal}
        />
      )}

      {/* Modal de Exclusão de Conta */}
      {confirmModalIsOpen && (
        <ConfirmModal
          title="CUIDADO!"
          description={
            <>
              <strong>Deseja mesmo excluir sua conta?</strong>
              <br />
              <br />
              <strong>Essa ação é irreversível.</strong>
            </>
          }
          confirmText="Excluir"
          cancelText="Cancelar"
          variant="primary"
          onConfirm={handleDeletarUsuario}
          onCancel={() => {}}
          onClose={closeConfirm}
          inputPassword
        />
      )}

      {/* Modal de Atualização de Email */}
      {confirmEmailModalIsOpen && (
        <ConfirmModal
          title="Confirmar Alteração de E-mail"
          description={
            <>
              Para sua segurança, digite sua <strong>senha atual</strong> para confirmar a alteração
              do e-mail para: <br />
              <br />
              <strong>{pendingEmail}</strong>
            </>
          }
          confirmText="Confirmar"
          cancelText="Cancelar"
          variant="primary"
          onConfirm={handleConfirmEmailUpdate}
          onClose={() => setConfirmEmailModalIsOpen(false)}
          inputPassword
        />
      )}

      {/* Modal de Atualizar Senha */}
      {senhaModalIsOpen && (
        <AtualizarSenhaModal
          title="Atualização de Senha"
          description="Complete os campos abaixo para atualizar sua senha."
          onConfirm={handleUpdatePassword}
          onCancel={() => {}}
          onClose={closeSenhaModal}
        />
      )}

      {/* Modal de Alerta */}
      {alertInfo.isOpen && (
        <AlertModal
          title={alertInfo.title}
          description={alertInfo.msg}
          variant={alertInfo.type === 'error' ? 'primary' : 'outline-success'}
          icon={alertInfo.type === 'error' ? 'error' : 'success'}
          onClose={closeAlert}
        />
      )}
    </Section>
  );
};

export default UserInfo;
