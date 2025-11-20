import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

export const AuthContext = createContext();

const STORAGE_KEY = '@SaborNaNuvem:user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const recoveredUser = localStorage.getItem(STORAGE_KEY);

    if (recoveredUser) {
      setUser(JSON.parse(recoveredUser));
    }

    setLoading(false);
  }, []);

  // Função de Login (SIMULAÇÃO - TODO: Substituir por API Real depois)
  // eslint-disable-next-line no-unused-vars
  const login = async (email, password) => {
    /* TODO: 
      const response = await api.post('/login', { email, password });
      const { token, user } = response.data;
    */

    // --- INÍCIO DA SIMULAÇÃO ---
    // Simulando um delay de rede de 1 segundo
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let usuarioSimulado = null;

        // Lógica para definir papéis baseados no email digitado
        if (email.includes('admin')) {
          usuarioSimulado = {
            id: 1,
            nome: 'Admin Master',
            email,
            cargo: 'ADMIN', // Acesso total
          };
        } else if (email.includes('func')) {
          usuarioSimulado = {
            id: 2,
            nome: 'João Cozinheiro',
            email,
            cargo: 'FUNCIONARIO',
            lojaId: 10, // Apenas desta loja
          };
        } else if (email.includes('cliente')) {
          usuarioSimulado = {
            id: 3,
            nome: 'Cliente Faminto',
            email,
            cargo: 'CLIENTE',
          };
        } else {
          // Se não for nenhum desses, rejeita o login (senha errada, etc)
          reject(new Error('Usuário ou senha inválidos'));
          return;
        }

        setUser(usuarioSimulado);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarioSimulado));
        resolve(usuarioSimulado);
      }, 1000);
    });
    // --- FIM DA SIMULAÇÃO ---
  };

  // Função de Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Verifica se o usuário tem uma das cargos permitidas
  const temCargo = (cargosPermitidos) => {
    if (!user) return false;
    if (Array.isArray(cargosPermitidos)) {
      return cargosPermitidos.includes(user.cargo);
    }
    return user.cargo === cargosPermitidos;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user, // Booleano simples para saber se está logado
        user,
        loading,
        login,
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

// Hook personalizado para não precisar importar useContext e AuthContext toda vez
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
