import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import styles from './Footer.module.css';
import logoImg from '../../assets/sabor-na-nuvem-logo.png';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* Container Principal (Limita a largura e aplica padding) */}
      <div className={styles.container}>
        {/* SEÇÃO LOGO E SLOGAN */}
        <div className={styles.about}>
          <Link to="/" className={styles.logo}>
            <img src={logoImg} alt="Sabor na Nuvem Logo" className={styles.logoImage} />
            Sabor na Nuvem
          </Link>
          <p className={styles.slogan}>Provendo sabores inesquecíveis</p>
          <p className={styles.copyrightMobile}>Copyright &copy; 2025</p>
        </div>

        {/* GRUPO DE LINKS */}
        <div className={styles.links}>
          {/* Coluna 1: Quem Somos */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Quem somos</h4>
            {/* TODO: Add páginas para isso */}
            <Link to="/" className={styles.link}>
              Restaurantes
            </Link>
            <Link to="/" className={styles.link}>
              Institucional
            </Link>
            <Link to="/" className={styles.link}>
              Privacidade
            </Link>
          </div>

          {/* Coluna 2: Descubra e Redes Sociais */}
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Descubra</h4>
            <Link to="/contato" className={styles.link}>
              Nosso contato
            </Link>

            <div className={styles.socials}>
              {/* Ícones de Mídia Social */}
              <a
                href="https://github.com/Sabor-na-Nuvem"
                className={styles.socialIcon}
                aria-label="Repositório Github da Sabor na Nuvem"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaGithub size={24} />
              </a>

              {/* LINKEDIN */}
              <a
                href="https://www.linkedin.com/in/joao-m-o-schmitz/"
                className={styles.socialIcon}
                aria-label="LinkedIn da Empresa"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLinkedin size={24} />
              </a>

              {/* E-MAIL */}
              <a
                href="mailto:jmatheus12349@gmail.com"
                className={styles.socialIcon}
                aria-label="E-mail de Contato"
              >
                <FaEnvelope size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* DIREITOS AUTORAIS (Visível apenas em Desktop) */}
      <div className={styles.copyrightDesktop}>
        <p>Copyright &copy; 2025 João Matheus de Oliveira Schmitz</p>
      </div>
    </footer>
  );
};

export default Footer;
