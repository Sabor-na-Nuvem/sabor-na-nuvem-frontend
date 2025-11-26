import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LuMenu, LuShoppingCart, LuUser, LuLogOut, LuX } from 'react-icons/lu';
import Button from '../Button';
import styles from './Header.module.css';
import logoImg from '../../assets/sabor-na-nuvem-logo.png';
import AlertModal from '../Modals/AlertModal';
import ConfirmModal from '../Modals/ConfirmModal';
import { useCarrinho } from '../../contexts/CarrinhoContext';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { valorTotalFormatado } = useCarrinho();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState({
    isOpen: false,
    title: '',
    msg: '',
    type: 'success',
  });

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // --- LÓGICA DE LOGOUT ---

  // Pede confirmação
  const handleLogoutClick = () => {
    setConfirmLogoutOpen(true);
    setIsMenuOpen(false);
  };

  // Executa Logout e Mostra Sucesso
  const confirmLogout = () => {
    setConfirmLogoutOpen(false);
    // Salva uma "Flash Message" no storage para a próxima tela ler
    localStorage.setItem('logout_feedback', 'true');
    // Fazer o logout
    logout();

    // Caso não ocorra o redirecionamento durante o logout:
    // 1. Mostrar feedback visual
    setAlertInfo({
      isOpen: true,
      title: 'Até logo!',
      msg: 'Você saiu da sua conta com sucesso.',
      type: 'success',
    });
    // 2. Deletar a "Flash Message"
    setTimeout(() => {
      localStorage.removeItem('logout_feedback');
    }, 500);
  };

  // Fecha Alerta e Redireciona
  const closeAlert = () => {
    setAlertInfo((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          {/* LOGO */}
          <Link to="/" className={styles.logo}>
            <img src={logoImg} alt="Sabor na Nuvem Logo" className={styles.logoImage} />
            <span className={styles.brandNameText}>Sabor na Nuvem</span>
          </Link>

          {/* NAVEGAÇÃO DESKTOP */}
          <div className={styles.desktopNav}>
            {/* Botão de Carrinho (Se não estiver logado ou for CLIENTE) */}
            {(!user || user.cargo === 'CLIENTE') && (
              <>
                <Link to="/carrinho">
                  <Button
                    variant="no-outline"
                    icon={<LuShoppingCart size={20} />}
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
                    <Button variant="primary" icon={<LuUser />} className={styles.navButton}>
                      Meu Perfil
                    </Button>
                  </Link>
                )}

                <Button
                  variant="no-outline"
                  onClick={handleLogoutClick}
                  icon={<LuLogOut size={14} className={styles.navButton} />}
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

          {/* MENU HAMBURGER (Mobile) */}
          <button className={styles.menuToggle} onClick={toggleMenu}>
            {isMenuOpen ? <LuX size={24} /> : <LuMenu size={24} />}
          </button>
        </div>

        {/* NAV MOBILE (Dropdown) */}
        <nav className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
          <Link to="/" onClick={toggleMenu}>
            Início
          </Link>
          {(!user || user.cargo === 'CLIENTE') && (
            <>
              <Link to="/cardapio" onClick={toggleMenu}>
                Cardápio
              </Link>
              <Link
                to="/carrinho"
                onClick={toggleMenu}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <LuShoppingCart size={18} />
                Carrinho ({valorTotalFormatado})
              </Link>
            </>
          )}

          {user ? (
            <>
              {/* TODO: Add rotas de admin e funcionario */}
              {user.cargo === 'ADMIN' && (
                <Link to="/" onClick={toggleMenu}>
                  Painel Admin
                </Link>
              )}
              {user.cargo === 'FUNCIONARIO' && (
                <Link to="/" onClick={toggleMenu}>
                  Área da Loja
                </Link>
              )}
              {user.cargo === 'CLIENTE' && (
                <>
                  <Link to="/minha-conta/historico-pedidos" onClick={toggleMenu}>
                    Meus Pedidos
                  </Link>
                  <Link to="/minha-conta" onClick={toggleMenu}>
                    Minha Conta
                  </Link>
                </>
              )}
              <button onClick={handleLogoutClick} className={styles.mobileLogout}>
                <LuLogOut size={18} style={{ marginRight: 8 }} /> Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={toggleMenu}>
                Entrar
              </Link>
              <Link to="/cadastro" onClick={toggleMenu}>
                Cadastrar
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* --- MODAIS --- */}

      {/* Confirmação de Logout */}
      {confirmLogoutOpen && (
        <ConfirmModal
          title="Sair da conta"
          description="Tem certeza que deseja sair? Você precisará fazer login novamente para aproveitar todas as funcionalidades."
          confirmText="Sair"
          cancelText="Cancelar"
          variant="primary" // Botão vermelho para ação de saída
          onConfirm={confirmLogout}
          onCancel={() => {}}
          onClose={() => setConfirmLogoutOpen(false)}
        />
      )}

      {/* Alerta de Sucesso */}
      {alertInfo.isOpen && (
        <AlertModal
          title={alertInfo.title}
          description={alertInfo.msg}
          variant="outline-success"
          icon="success"
          onClose={closeAlert}
        />
      )}
    </>
  );
};

export default Header;
