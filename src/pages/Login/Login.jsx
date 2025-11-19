import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/sabor-na-nuvem-logo.png';
import googleLogo from '../../assets/google-logo.png';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ReturnLink from '../../components/ReturnLink';
import styles from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [senhaError, setSenhaError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
  const handleSubmit = (e) => {
    e.preventDefault();

    setIsSubmitted(true);

    const emailValidation = validarCampo('email', email);
    const senhaValidation = validarCampo('senha', senha);

    const hasErrors = emailValidation || senhaValidation;

    if (!hasErrors) {
      console.log('Login efetuado com sucesso!');
      // TODO: conectar com a API
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
          />

          {/* Link para Esqueci a Senha */}
          <div className={styles.forgotPassword}>
            <Link to="/recuperar-senha" className={styles.forgotPasswordText}>
              Esqueci a senha
            </Link>
          </div>

          {/* Botão Entrar */}
          <Button type="submit" variant="primary" className={styles.fullWidth}>
            Entrar
          </Button>

          <p className={styles.orDivider}>Ou...</p>

          {/* Botão Google (Usando variante outline-yellow) */}
          <Button
            type="button"
            variant="outline-yellow"
            className={`${styles.fullWidth} ${styles.googleButton}`}
          >
            <span>Continuar com</span>

            <img src={googleLogo} alt="Logo do Google" style={{ height: '1rem', width: 'auto' }} />
          </Button>
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
    </div>
  );
};

export default Login;
