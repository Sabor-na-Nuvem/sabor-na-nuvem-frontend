import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

export const AuthContext = createContext();

const TOKEN_KEY = 'accessToken';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Busca os dados completos do usuário (Perfil, Telefones, Endereço) ---
  const fetchUserData = async () => {
    try {
      // 1. Busca os dados do usuário
      const userRes = await api.get('/usuarios/me');
      const userData = userRes.data;
      const userId = userData.id;

      // 2. Busca os dados complementares
      const [telefonesRes, enderecoRes] = await Promise.allSettled([
        api.get(`/usuarios/${userId}/telefones`),
        api.get(`/usuarios/${userId}/endereco`),
      ]);

      // 3. Telefones (Opcional)
      const telefones = telefonesRes.status === 'fulfilled' ? telefonesRes.value.data : [];
      // 4. Endereço (Opcional)
      const endereco = enderecoRes.status === 'fulfilled' ? enderecoRes.value.data : null;

      // Monta o objeto completo de usuário
      const fullUser = {
        ...userData,
        telefones,
        endereco,
      };

      return fullUser;
    } catch (error) {
      console.error('Erro ao montar dados do usuário:', error);
      throw error;
    }
  };

  // --- Realiza o login do usuário ---
  const login = async (email, senha) => {
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, senha });
      const { accessToken } = response.data;

      localStorage.setItem(TOKEN_KEY, accessToken);
      const fullUser = await fetchUserData();
      setUser(fullUser);

      return fullUser;
    } catch (error) {
      console.error('Erro no login:', error);
      // Repassa o erro para que o componente de Login possa exibir feedback visual
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // --- Atualiza os dados base do usuário ---
  const updateUser = async (updates) => {
    try {
      await api.patch('/usuarios/me', updates);

      setUser((prevUser) => {
        const newUser = { ...prevUser, ...updates };
        return newUser;
      });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  };

  // --- Realiza o logout do usuário ---
  const logout = async () => {
    try {
      // Tenta avisar o backend para invalidar o refresh token (cookie)
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout no backend (prosseguindo com limpeza local):', error);
    } finally {
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('session_expired');
    }
  };

  const temCargo = (cargosPermitidas) => {
    if (!user) return false;
    if (Array.isArray(cargosPermitidas)) {
      return cargosPermitidas.includes(user.cargo);
    }
    return user.cargo === cargosPermitidas;
  };

  // --- Recuperação de sessão ao carregar a página ---
  useEffect(() => {
    const recoverUser = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (storedToken) {
        try {
          const freshUser = await fetchUserData();
          setUser(freshUser);
        } catch (error) {
          console.warn('Token inválido ou expirado ao iniciar:', error);
          // Se falhar (ex: 401), limpa o token
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
        }
      }

      setLoading(false);
    };

    recoverUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        login,
        updateUser,
        logout,
        temCargo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
