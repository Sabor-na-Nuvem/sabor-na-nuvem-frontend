import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import logoImg from '../../assets/sabor-na-nuvem-logo.png';
// import googleLogo from '../../assets/google-logo.png';
import Input from '../../components/Input';
import Button from '../../components/Button';
import AlertModal from '../../components/Modals/AlertModal';
import ReturnLink from '../../components/ReturnLink';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Login.module.css';

const Login = () => {
  const [searchParams] = useSearchParams();
  const messageInParams = searchParams.get('message');
  const errorInParams = searchParams.get('error');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [senhaError, setSenhaError] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [alertInfo, setAlertInfo] = useState({
    isOpen: false,
    title: '',
    msg: '',
    type: 'success',
  });

  useEffect(() => {
    const sessionExpired = localStorage.getItem('session_expired');
    const logoutFeedback = localStorage.getItem('logout_feedback');
    const deleteFeedback = localStorage.getItem('delete_feedback');

    // Prioridade 1: Sessão Expirada (Erro)
    if (sessionExpired) {
      setAlertInfo({
        isOpen: true,
        title: 'Sessão Expirada',
        msg: 'Sua sessão expirou por segurança. Por favor, faça login novamente.',
        type: 'error',
      });
      localStorage.removeItem('session_expired');

      // Prioridade 2: Logout Voluntário (Sucesso)
    } else if (logoutFeedback) {
      setAlertInfo({
        isOpen: true,
        title: 'Até logo!',
        msg: 'Você saiu da sua conta com sucesso.',
        type: 'success',
      });
      localStorage.removeItem('logout_feedback');

      // Prioridade 3: Conta Deletada (Info/Primary)
    } else if (deleteFeedback) {
      setAlertInfo({
        isOpen: true,
        title: 'Que pena ver você partir...',
        msg: 'Sua conta foi excluída com sucesso. Esperamos te ver por aqui novamente em breve!',
        type: 'primary',
      });
      localStorage.removeItem('delete_feedback');

      // Prioridade 4: Email verificado (Sucesso)
    } else if (messageInParams) {
      setAlertInfo({
        isOpen: true,
        title: 'E-mail verificado!',
        msg: 'Seu e-mail foi verificado com sucesso. Agora você pode realizar seu login!',
        type: 'success',
      });

      // Prioridade 4: Email verificado (Sucesso)
    } else if (errorInParams) {
      setAlertInfo({
        isOpen: true,
        title: 'Erro na verificação!',
        msg: 'Houve um erro na verificação do seu e-mail. Tente novamente.',
        type: 'error',
      });
    }
  }, [messageInParams, errorInParams]);

  // Fecha Alerta e Redireciona
  const closeAlert = () => {
    setAlertInfo((prev) => ({ ...prev, isOpen: false }));
  };

  const validarCampo = (name, value) => {
    let error = null;

    // --- VALIDAÇÃO DE EMAIL ---
    if (name === 'email') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (!value) {
        error = 'O email é obrigatório.';
      } else if (!emailRegex.test(value)) {
        error = 'Por favor, insira um email válido (ex: seu@email.com).';
      }
      setEmailError(error);
    }

    // --- VALIDAÇÃO DE SENHA ---
    else if (name === 'senha') {
      const MIN_LENGTH = 6;

      if (!value) {
        error = 'A senha é obrigatória.';
      } else if (value.length < MIN_LENGTH) {
        error = `A senha deve ter no mínimo ${MIN_LENGTH} caracteres.`;
      }

      setSenhaError(error);
    }

    return error;
  };

  // Handler para mudanças no Input
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'email') setEmail(value);
    if (name === 'senha') setSenha(value);

    if (isSubmitted) {
      validarCampo(name, value);
    }
  };

  // Handler para quando o campo perde o foco
  const handleBlur = (e) => {
    if (isSubmitted) {
      validarCampo(e.target.name, e.target.value);
    }
  };

  // Submissão do Formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitted(true);

    const emailValidation = validarCampo('email', email);
    const senhaValidation = validarCampo('senha', senha);

    const hasErrors = emailValidation || senhaValidation;

    if (!hasErrors) {
      setIsLoading(true);
      try {
        const userData = await login(email, senha);

        switch (userData.cargo) {
          case 'ADMIN':
            // TODO: Add rota /admin
            navigate('/', { replace: true });
            break;
          case 'FUNCIONARIO':
            // TODO: Add rota /portal
            navigate('/', { replace: true });
            break;
          case 'CLIENTE':
          default:
            navigate('/', { replace: true });
            break;
        }
      } catch (error) {
        const msgErro =
          error.response?.data?.message || 'Falha ao realizar login. Verifique suas credenciais.';

        setAlertInfo({
          isOpen: true,
          title: 'Acesso Negado',
          msg: msgErro,
          type: 'error',
        });
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={styles.loginPageWrapper}>
      <div className={styles.loginPanel}>
        <div className={styles.logoSection}>
          <img src={logoImg} alt="Sabor na Nuvem Logo" className={styles.logoImage} />
          <h1 className={styles.logoTitle}>Sabor na Nuvem</h1>
        </div>

        {/* Formulário de Login */}
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
            autoComplete="email"
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
            autoComplete="current-password"
          />

          {/* Link para Esqueci a Senha */}
          <div className={styles.forgotPassword}>
            <Link to="/recuperar-senha" className={styles.forgotPasswordText}>
              Esqueci a senha
            </Link>
          </div>

          {/* Botão Entrar */}
          <Button type="submit" variant="primary" className={styles.fullWidth} disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>

          <p className={styles.orDivider}>Ou...</p>

          {/* TODO: Add integração de login com o google */}
          {/* <Button
            type="button"
            variant="outline-yellow"
            className={`${styles.fullWidth} ${styles.googleButton}`}
            disabled={isLoading}
          >
            <span>Continuar com</span>

            <img src={googleLogo} alt="Logo do Google" style={{ height: '1rem', width: 'auto' }} />
          </Button> */}
        </form>

        {/* Link Voltar */}
        <ReturnLink to="/" text="Voltar para Home" className={styles.returnLink} />

        {/* Link para Cadastro */}
        <p className={styles.registerPrompt}>
          Ainda não tem uma conta?
          <Link to="/cadastro" className={styles.registerLink}>
            Registre-se aqui
          </Link>
        </p>
      </div>

      {/* Alerta de Sucesso */}
      {alertInfo.isOpen && (
        <AlertModal
          title={alertInfo.title}
          description={alertInfo.msg}
          variant={alertInfo.type === 'success' ? 'outline-success' : 'outline-yellow'}
          icon={alertInfo.type === 'error' ? 'error' : 'success'}
          onClose={closeAlert}
        />
      )}
    </div>
  );
};

export default Login;
