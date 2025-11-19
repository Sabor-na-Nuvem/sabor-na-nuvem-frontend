import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/sabor-na-nuvem-logo.png';
import googleLogo from '../../assets/google-logo.png';
import Input from '../../components/Input';
import Button from '../../components/Button';
import styles from '../Login/Login.module.css';
import ReturnLink from '../../components/ReturnLink';

const Cadastro = () => {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [nomeError, setNomeError] = useState(null);
  const [senhaError, setSenhaError] = useState(null);
  const [confirmarSenhaError, setConfirmarSenhaError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validarCampo = (name, value, allFormValues = {}) => {
    let error = null;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const MIN_LENGTH = 6;

    // --- VALIDAÇÃO DE OBRIGATORIEDADE ---
    if (!value) {
      if (name === 'email') {
        error = 'O email é obrigatório.';
      } else if (name === 'nome') {
        error = 'O nome é obrigatório.';
      } else if (name === 'senha') {
        error = 'A senha é obrigatória.';
      } else if (name === 'confirmarSenha') {
        error = 'A confirmação de senha é obrigatória.';
      }
    }

    // --- VALIDAÇÕES DE FORMATO, TAMANHO E CORRESPONDÊNCIA ---

    if (name === 'email' && !error) {
      if (!emailRegex.test(value)) {
        error = 'Por favor, insira um email válido (ex: seu@email.com).';
      }
    } else if (name === 'nome' && !error) {
      if (value.length < 3) {
        error = 'O nome deve ter pelo menos 3 caracteres.';
      }
    } else if (name === 'senha' && !error) {
      if (value.length < MIN_LENGTH) {
        error = `A senha deve ter no mínimo ${MIN_LENGTH} caracteres.`;
      }
    } else if (name === 'confirmarSenha' && !error) {
      const mainPasswordValue = allFormValues.senha;

      if (value !== mainPasswordValue) {
        error = 'As senhas não coincidem.';
      }
    }

    // --- APLICAÇÃO DE ERROS ---
    if (name === 'email') {
      setEmailError(error);
    } else if (name === 'nome') {
      setNomeError(error);
    } else if (name === 'senha') {
      setSenhaError(error);
    } else if (name === 'confirmarSenha') {
      setConfirmarSenhaError(error);
    }

    return error;
  };

  // Handler para mudanças no Input
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
      // Se o campo alterado foi a 'senha' principal, revalide a 'confirmarSenha'
      if (name === 'senha') {
        validarCampo('confirmarSenha', confirmarSenha, currentValues);
      }
      // Se o campo alterado foi a 'confirmarSenha', revalide a 'senha' principal
      if (name === 'confirmarSenha') {
        validarCampo('senha', senha, currentValues);
      }
    }
  };

  // Handler para quando o campo perde o foco
  const handleBlur = (e) => {
    if (isSubmitted) {
      const formValues = {
        email,
        nome,
        senha,
        confirmarSenha,
      };

      validarCampo(e.target.name, e.target.value, formValues);
      if (e.target.name === 'senha') {
        validarCampo('confirmarSenha', confirmarSenha, formValues);
      }
    }
  };

  // Submissão do Formulário
  const handleSubmit = (e) => {
    e.preventDefault();

    setIsSubmitted(true);

    const formValues = {
      email,
      nome,
      senha,
      confirmarSenha,
    };

    const emailValidation = validarCampo('email', email, formValues);
    const nomeValidation = validarCampo('nome', nome, formValues);
    const senhaValidation = validarCampo('senha', senha, formValues);
    const confirmarSenhaValidation = validarCampo('confirmarSenha', confirmarSenha, formValues);

    const hasErrors =
      emailValidation || nomeValidation || senhaValidation || confirmarSenhaValidation;

    if (!hasErrors) {
      console.log('Cadastro efetuado com sucesso!');
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

        {/* Formulário de Cadastro */}
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
            label="Nome"
            type="text"
            value={nome}
            onChange={handleChange}
            onBlur={handleBlur}
            name="nome"
            error={nomeError}
            maxLength={50}
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

          <Input
            label="Confirmar senha"
            type="password"
            value={confirmarSenha}
            onChange={handleChange}
            onBlur={handleBlur}
            name="confirmarSenha"
            error={confirmarSenhaError}
            maxLength={128}
          />

          {/* Botão Cadastrar */}
          <Button type="submit" variant="primary" className={styles.fullWidth}>
            Cadastrar
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

        {/* Link para Login */}
        <p className={styles.registerPrompt}>
          Já tem uma conta?
          <Link to="/login" className={styles.registerLink}>
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Cadastro;
