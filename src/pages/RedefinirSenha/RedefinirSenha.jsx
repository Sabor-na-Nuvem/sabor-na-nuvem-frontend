import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import logoImg from '../../assets/sabor-na-nuvem-logo.png';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ReturnLink from '../../components/ReturnLink';
import AlertModal from '../../components/Modals/AlertModal';
import { resetPassword } from '../../services/auth.service';
import styles from '../Login/Login.module.css';

const RedefinirSenha = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Pega o token da URL
  const navigate = useNavigate();

  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [senhaError, setSenhaError] = useState(null);
  const [confirmarSenhaError, setConfirmarSenhaError] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
    const MIN_LENGTH = 6;

    if (!value) {
      if (name === 'senha') error = 'A senha é obrigatória.';
      else if (name === 'confirmarSenha') error = 'A confirmação de senha é obrigatória.';
    }

    if (name === 'senha' && !error) {
      if (value.length < MIN_LENGTH) error = `A senha deve ter no mínimo ${MIN_LENGTH} caracteres.`;
    } else if (name === 'confirmarSenha' && !error) {
      const mainPasswordValue = allFormValues.senha;
      if (value !== mainPasswordValue) error = 'As senhas não coincidem.';
    }

    if (name === 'senha') setSenhaError(error);
    else if (name === 'confirmarSenha') setConfirmarSenhaError(error);

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'senha') setSenha(value);
    if (name === 'confirmarSenha') setConfirmarSenha(value);

    if (isSubmitted) {
      const currentValues = {
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
      const formValues = { senha, confirmarSenha };
      validarCampo(e.target.name, e.target.value, formValues);
      if (e.target.name === 'senha') validarCampo('confirmarSenha', confirmarSenha, formValues);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token)
      mostrarAlerta(
        'Token inválido.',
        'O token recebido é inválido, tente novamente.',
        'error',
        true
      );

    setIsSubmitted(true);
    setIsLoading(true);

    const formValues = { senha, confirmarSenha };
    const senhaValidation = validarCampo('senha', senha, formValues);
    const confirmarSenhaValidation = validarCampo('confirmarSenha', confirmarSenha, formValues);

    const hasErrors = senhaValidation || confirmarSenhaValidation;

    if (!hasErrors) {
      try {
        await resetPassword(token, senha);
        mostrarAlerta(
          'Senha alterada!',
          'Parabéns! Sua senha foi alterada com sucesso.',
          'success',
          true
        );
      } catch (error) {
        mostrarAlerta(
          'Erro ao redefinir.',
          'O link pode ter expirado. Tente novamente.',
          'error',
          true
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!token) {
    return (
      <div className={styles.loginPageWrapper}>
        <div className={styles.loginPanel}>
          <div className={styles.logoSection}>
            <img src={logoImg} alt="Sabor na Nuvem Logo" className={styles.logoImage} />
            <h1 className={styles.logoTitle}>Redefinir Senha</h1>
          </div>

          <h2 style={{ marginTop: '3rem' }}>Tente novamente</h2>
          <p style={{ marginBottom: '3rem' }}>Token inválido ou ausente.</p>

          <ReturnLink to="/login" text="Voltar para Login" className={styles.returnLink} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginPageWrapper}>
      <div className={styles.loginPanel}>
        <div className={styles.logoSection}>
          <img src={logoImg} alt="Sabor na Nuvem Logo" className={styles.logoImage} />
          <h1 className={styles.logoTitle}>Redefinir Senha</h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
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
            Salvar
          </Button>
        </form>

        {/* Link Voltar */}
        <ReturnLink to="/login" text="Voltar para Login" className={styles.returnLink} />
      </div>

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

export default RedefinirSenha;
