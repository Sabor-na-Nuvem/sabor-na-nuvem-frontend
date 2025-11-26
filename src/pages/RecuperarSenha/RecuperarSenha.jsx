import React, { useState } from 'react';
import logoImg from '../../assets/sabor-na-nuvem-logo.png';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ReturnLink from '../../components/ReturnLink';
import { requestPasswordReset } from '../../services/auth.service';
import styles from '../Login/Login.module.css';

const RecuperarSenha = () => {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await requestPasswordReset(email);
      setEnviado(true);
    } catch (error) {
      console.error('Erro ao solicitar', error);
    }
  };

  if (enviado) {
    return (
      <div className={styles.loginPageWrapper}>
        <div className={styles.loginPanel}>
          <div className={styles.logoSection}>
            <img src={logoImg} alt="Sabor na Nuvem Logo" className={styles.logoImage} />
            <h1 className={styles.logoTitle}>Recuperar Senha</h1>
          </div>

          <h2 style={{ marginTop: '3rem' }}>Verifique seu e-mail</h2>
          <p style={{ marginBottom: '3rem' }}>
            Se o e-mail existir em nossa base, enviamos um link para redefinição.
          </p>

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
          <h1 className={styles.logoTitle}>Recuperar Senha</h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            name="email"
            maxLength={255}
            autoComplete="email"
            required
          />

          <Button type="submit" variant="primary" className={styles.fullWidth}>
            Enviar Link
          </Button>
        </form>

        {/* Link Voltar */}
        <ReturnLink to="/login" text="Voltar para Login" className={styles.returnLink} />
      </div>
    </div>
  );
};

export default RecuperarSenha;
