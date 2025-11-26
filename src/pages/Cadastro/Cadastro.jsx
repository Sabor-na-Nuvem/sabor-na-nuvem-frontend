import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../../assets/sabor-na-nuvem-logo.png';
// import googleLogo from '../../assets/google-logo.png';
import Input from '../../components/Input';
import Button from '../../components/Button';
import styles from '../Login/Login.module.css';
import ReturnLink from '../../components/ReturnLink';

// --- IMPORTS DOS MODAIS ---
import AlertModal from '../../components/Modals/AlertModal';
import EnderecoModal from '../../components/Modals/EnderecoModal';
import ConfirmModal from '../../components/Modals/ConfirmModal';
import ContatoModal from '../../components/Modals/ContatoModal';
import ConfirmarEnderecoFinalModal from '../../components/Modals/ConfirmarEnderecoModal/ConfirmarEnderecoFinalModal';
import ConfirmarEnderecoExistenteModal from '../../components/Modals/ConfirmarEnderecoModal/ConfirmarEnderecoExistenteModal';
import { register } from '../../services/auth.service';

const Cadastro = () => {
  const navigate = useNavigate();

  // --- LÓGICA DO FORMULÁRIO ---
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [emailError, setEmailError] = useState(null);
  const [nomeError, setNomeError] = useState(null);
  const [senhaError, setSenhaError] = useState(null);
  const [confirmarSenhaError, setConfirmarSenhaError] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // --- ESTADOS DO FLUXO DE MODAIS ---
  const [modalStep, setModalStep] = useState('none');
  const [tempData, setTempData] = useState({ telefones: null, endereco: null });

  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    msg: '',
    type: 'primary',
    redirectOnClose: false,
  });

  const mostrarAlerta = (titulo, mensagem, tipo = 'primary', redirect = false) => {
    setAlertModal({
      isOpen: true,
      title: titulo,
      msg: mensagem,
      type: tipo,
      redirectOnClose: redirect,
    });
  };

  const fecharAlerta = () => {
    setAlertModal((prev) => ({ ...prev, isOpen: false }));
    if (alertModal.redirectOnClose) {
      navigate('/login');
    }
  };

  const validarCampo = (name, value, allFormValues = {}) => {
    let error = null;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const MIN_LENGTH = 6;

    if (!value) {
      if (name === 'email') error = 'O email é obrigatório.';
      else if (name === 'nome') error = 'O nome é obrigatório.';
      else if (name === 'senha') error = 'A senha é obrigatória.';
      else if (name === 'confirmarSenha') error = 'A confirmação de senha é obrigatória.';
    }

    if (name === 'email' && !error) {
      if (!emailRegex.test(value)) error = 'Por favor, insira um email válido (ex: seu@email.com).';
    } else if (name === 'nome' && !error) {
      if (value.length < 3) error = 'O nome deve ter pelo menos 3 caracteres.';
    } else if (name === 'senha' && !error) {
      if (value.length < MIN_LENGTH) error = `A senha deve ter no mínimo ${MIN_LENGTH} caracteres.`;
    } else if (name === 'confirmarSenha' && !error) {
      const mainPasswordValue = allFormValues.senha;
      if (value !== mainPasswordValue) error = 'As senhas não coincidem.';
    }

    if (name === 'email') setEmailError(error);
    else if (name === 'nome') setNomeError(error);
    else if (name === 'senha') setSenhaError(error);
    else if (name === 'confirmarSenha') setConfirmarSenhaError(error);

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
    if (name === 'nome') setNome(value);
    if (name === 'senha') setSenha(value);
    if (name === 'confirmarSenha') setConfirmarSenha(value);

    if (isSubmitted) {
      const currentValues = {
        email,
        nome,
        senha: name === 'senha' ? value : senha,
        confirmarSenha: name === 'confirmarSenha' ? value : confirmarSenha,
      };
      validarCampo(name, value, currentValues);
      if (name === 'senha') validarCampo('confirmarSenha', confirmarSenha, currentValues);
      if (name === 'confirmarSenha') validarCampo('senha', senha, currentValues);
    }
  };

  const handleBlur = (e) => {
    if (isSubmitted) {
      const formValues = { email, nome, senha, confirmarSenha };
      validarCampo(e.target.name, e.target.value, formValues);
      if (e.target.name === 'senha') validarCampo('confirmarSenha', confirmarSenha, formValues);
    }
  };

  // --- SUBMISSÃO DO FORMULÁRIO ---
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    const formValues = { email, nome, senha, confirmarSenha };
    const emailValidation = validarCampo('email', email, formValues);
    const nomeValidation = validarCampo('nome', nome, formValues);
    const senhaValidation = validarCampo('senha', senha, formValues);
    const confirmarSenhaValidation = validarCampo('confirmarSenha', confirmarSenha, formValues);

    const hasErrors =
      emailValidation || nomeValidation || senhaValidation || confirmarSenhaValidation;

    if (!hasErrors) {
      // SUCESSO: Inicia o fluxo de modais
      setModalStep('initial_confirm');
    }
  };

  // --- FINALIZAÇÃO E ENVIO PRA API ---
  const finalizarCadastro = async (comExtras, enderecoOverride = null) => {
    setModalStep('none');
    setIsLoading(true);

    const enderecoFinal = enderecoOverride || tempData.endereco;
    const enderecoSanitizado = enderecoFinal
      ? {
          ...enderecoFinal,
          estado: enderecoFinal.estado ? enderecoFinal.estado.toUpperCase() : enderecoFinal.estado,
        }
      : null;

    // Monta o payload
    const payload = {
      nome,
      email,
      senha,
      // Dados extras que serão passados para o hook 'onUserRegistered' no backend
      ...(comExtras && {
        telefones: tempData.telefones,
        endereco: enderecoSanitizado,
      }),
    };

    try {
      await register(payload);

      if (comExtras) localStorage.removeItem('enderecoUsuarioTemp');
      // Sucesso: Configura alerta com redirecionamento para login
      mostrarAlerta(
        'Cadastro realizado!',
        'Verifique seu email para ativar sua conta antes de fazer login.',
        'success',
        true
      );
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || 'Ocorreu um erro ao criar sua conta. Tente novamente.';

      mostrarAlerta('Erro no Cadastro', errorMsg, 'error', false);
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLERS DO FLUXO DE MODAIS ---

  const closeModals = () => setModalStep('none');

  // 1. Falta Pouco -> Decide se continua ou finaliza
  const handleSkipExtras = () => finalizarCadastro(false);
  const handleStartExtras = () => setModalStep('contact');

  // 2. Contato -> Salva e decide próximo passo (Storage ou Novo Endereço)
  const handleContactSave = (dadosContato) => {
    setTempData((prev) => ({ ...prev, telefones: dadosContato }));

    const enderecoSalvo = localStorage.getItem('enderecoUsuarioTemp');
    if (enderecoSalvo) {
      try {
        const enderecoObj = JSON.parse(enderecoSalvo);
        setTempData((prev) => ({ ...prev, endereco: enderecoObj }));
        setModalStep('check_storage');
      } catch (e) {
        setModalStep('new_address');
      }
    } else {
      setModalStep('new_address');
    }
  };

  // 3. Endereço Existente
  const handleUseExistingAddress = () => setModalStep('final_confirm');
  const handleNewAddress = () => setModalStep('new_address');
  const handleBackToContact = () => setModalStep('contact');

  // 4. Novo Endereço
  const handleSaveNewAddress = (novoEndereco) => {
    setTempData((prev) => ({ ...prev, endereco: novoEndereco }));
    setModalStep('final_confirm');
  };

  // 5. Mapa Final
  const handleFinalConfirm = (enderecoFinal) => {
    const enderecoParaSalvar = enderecoFinal || tempData.endereco;
    setTempData((prev) => ({ ...prev, endereco: enderecoParaSalvar }));
    finalizarCadastro(true, enderecoParaSalvar);
  };

  const handleBackToAddress = () => {
    const enderecoSalvo = localStorage.getItem('enderecoUsuarioTemp');
    if (enderecoSalvo && JSON.stringify(tempData.endereco) === enderecoSalvo)
      setModalStep('check_storage');
    else setModalStep('new_address');
  };

  return (
    <div className={styles.loginPageWrapper}>
      <div className={styles.loginPanel}>
        <div className={styles.logoSection}>
          <img src={logoImg} alt="Sabor na Nuvem Logo" className={styles.logoImage} />
          <h1 className={styles.logoTitle}>Sabor na Nuvem</h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={handleChange}
            onBlur={handleBlur}
            name="email"
            error={emailError}
            maxLength={255}
            disabled={isLoading}
          />
          <Input
            label="Nome"
            type="text"
            value={nome}
            onChange={handleChange}
            onBlur={handleBlur}
            name="nome"
            error={nomeError}
            maxLength={50}
            autoComplete="username"
            disabled={isLoading}
          />
          <Input
            label="Senha"
            type="password"
            value={senha}
            onChange={handleChange}
            onBlur={handleBlur}
            name="senha"
            error={senhaError}
            maxLength={128}
            autoComplete="new-password"
            disabled={isLoading}
          />
          <Input
            label="Confirmar senha"
            type="password"
            value={confirmarSenha}
            onChange={handleChange}
            onBlur={handleBlur}
            name="confirmarSenha"
            error={confirmarSenhaError}
            maxLength={128}
            autoComplete="new-password"
            disabled={isLoading}
          />

          <Button type="submit" variant="primary" className={styles.fullWidth} disabled={isLoading}>
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>

          {/* TODO: Add integração de login com o google */}
          {/* <p className={styles.orDivider}>Ou...</p>
          <Button
            type="button"
            variant="outline-yellow"
            className={`${styles.fullWidth} ${styles.googleButton}`}
            disabled={isLoading}
          >
            <span>Continuar com</span>
            <img src={googleLogo} alt="Logo do Google" style={{ height: '1rem', width: 'auto' }} />
          </Button> */}
        </form>

        <ReturnLink to="/" text="Voltar para Home" className={styles.returnLink} />
        <p className={styles.registerPrompt}>
          Já tem uma conta?
          <Link to="/login" className={styles.registerLink}>
            Fazer login
          </Link>
        </p>
      </div>

      {/* --- RENDERIZAÇÃO DOS MODAIS --- */}

      {modalStep === 'initial_confirm' && (
        <ConfirmModal
          title="Falta pouco..."
          description={
            <>
              <strong>Deseja cadastrar seu endereço e/ou informações de contato agora?</strong>
              <br />
              <br />
              Você também pode alterar suas informações outra hora, só lembre-se que elas são
              necessárias para a realização de deliveries!
            </>
          }
          confirmText="Cadastrar"
          cancelText="Deixar para depois"
          variant="primary"
          onConfirm={handleStartExtras}
          onCancel={handleSkipExtras}
          onClose={closeModals}
        />
      )}

      {modalStep === 'contact' && (
        <ContatoModal onClose={closeModals} onContinue={handleContactSave} />
      )}

      {modalStep === 'check_storage' && tempData.endereco && (
        <ConfirmarEnderecoExistenteModal
          endereco={tempData.endereco}
          onClose={closeModals}
          onConfirm={handleUseExistingAddress}
          onUseNew={handleNewAddress}
          onBack={handleBackToContact}
        />
      )}

      {modalStep === 'new_address' && (
        <EnderecoModal
          onClose={closeModals}
          onSave={handleSaveNewAddress}
          textoBotao="Continuar"
          initialData={tempData.endereco}
          startEditing={true}
        />
      )}

      {modalStep === 'final_confirm' && tempData.endereco && (
        <ConfirmarEnderecoFinalModal
          endereco={tempData.endereco}
          onBack={handleBackToAddress}
          onConfirm={handleFinalConfirm}
        />
      )}

      {alertModal.isOpen && (
        <AlertModal
          title={alertModal.title}
          description={alertModal.msg}
          variant={alertModal.type === 'error' ? 'primary' : 'outline-success'}
          icon={alertModal.type === 'error' ? 'error' : 'success'}
          onClose={fecharAlerta}
        />
      )}
    </div>
  );
};

export default Cadastro;
