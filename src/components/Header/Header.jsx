import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TiShoppingCart } from 'react-icons/ti';
import { FaRegUserCircle } from 'react-icons/fa';
import { MdLogout } from 'react-icons/md';
import Button from '../Button';
import styles from './Header.module.css';
import logoImg from '../../assets/sabor-na-nuvem-logo.png';
import { useCarrinho } from '../../contexts/CarrinhoContext';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { valorTotalFormatado } = useCarrinho();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* LOGO */}
        <Link to="/" className={styles.logo}>
          <img src={logoImg} alt="Sabor na Nuvem Logo" className={styles.logoImage} />
          <span className={styles.brandNameText}>Sabor na Nuvem</span>
        </Link>

        {/* NAVEGAÇÃO DESKTOP (Mostrada apenas em telas grandes) */}
        <div className={styles.desktopNav}>
          {/* Botão de Carrinho (Se não estiver logado ou for CLIENTE) */}
          {(!user || user.cargo === 'CLIENTE') && (
            <>
              <Link to="/carrinho">
                <Button
                  variant="no-outline"
                  icon={<TiShoppingCart size={20} />}
                  className={styles.navButton}
                >
                  {valorTotalFormatado}
                </Button>
              </Link>
              <Link to="/cardapio">
                <Button variant="outline-red" className={styles.navButton}>
                  Cardápio
                </Button>
              </Link>
            </>
          )}

          {user ? (
            <>
              {/* Se for ADMIN */}
              {user.cargo === 'ADMIN' && (
                <Link to="/admin">
                  <Button variant="outline-red" className={styles.navButton}>
                    Painel Admin
                  </Button>
                </Link>
              )}

              {/* Se for FUNCIONARIO */}
              {user.cargo === 'FUNCIONARIO' && (
                <Link to="/portal">
                  <Button variant="outline-red" className={styles.navButton}>
                    Área da Loja
                  </Button>
                </Link>
              )}

              {/* Se for CLIENTE */}
              {user.cargo === 'CLIENTE' && (
                <Link to="/minha-conta">
                  <Button variant="primary" icon={<FaRegUserCircle />} className={styles.navButton}>
                    Meu Perfil
                  </Button>
                </Link>
              )}

              <Button
                variant="no-outline"
                onClick={logout}
                icon={<MdLogout size={14} className={styles.navButton} />}
                className={`${styles.navButton} ${styles.logout}`}
              />
            </>
          ) : (
            <Link to="/login">
              <Button variant="primary" className={styles.navButton}>
                Entrar
              </Button>
            </Link>
          )}
        </div>

        {/* TOGGLE MOBILE (Ícone Hambúrguer) */}
        <button
          className={styles.menuToggle}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* MENU LATERAL MOBILE (Aparece ao abrir) */}
      <nav className={`${styles.mobileNav} ${isMenuOpen ? styles.open : ''}`}>
        <Link to="/" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
          Home
        </Link>
        <Link to="/cardapio" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
          Cardápio
        </Link>
        <Link to="/quem-somos" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
          Quem Somos
        </Link>

        {/* Botão de Entrar no final do menu mobile */}
        <Link to="/login" onClick={() => setIsMenuOpen(false)}>
          <Button variant="primary" style={{ width: '100%', marginTop: '1rem' }}>
            Entrar
          </Button>
        </Link>
      </nav>

      {/* Overlay para fechar ao clicar fora do menu */}
      {isMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 98,
          }}
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default Header;
