import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

export const AuthContext = createContext();

const STORAGE_KEY = '@SaborNaNuvem:user';
const TOKEN_KEY = '@SaborNaNuvem:token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Recuperação de sessão ao carregar a página
  useEffect(() => {
    const recoverUser = async () => {
      const storedUser = localStorage.getItem(STORAGE_KEY);
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        // Aqui futuramente você pode validar se o token ainda é válido
        // api.defaults.headers.Authorization = `Bearer ${storedToken}`;
      }
      setLoading(false);
    };

    recoverUser();
  }, []);

  // eslint-disable-next-line no-unused-vars
  const login = async (email, password) => {
    setLoading(true);

    try {
      // --- PASSO 1: AUTENTICAÇÃO (POST /login) ---
      // const response = await api.post('/login', { email, password });
      // const { token, userId } = response.data;

      // SIMULAÇÃO DA RESPOSTA DO LOGIN
      const mockLoginResponse = await new Promise((resolve) => {
        setTimeout(() => {
          let cargo = 'CLIENTE';
          if (email.includes('admin')) cargo = 'ADMIN';
          if (email.includes('func')) cargo = 'FUNCIONARIO';

          resolve({
            token: 'token-falso-jwt-123456',
            userId: 'uuid-usuario-123',
            cargo,
          });
        }, 500); // Pequeno delay do login
      });

      const { token, cargo } = mockLoginResponse;

      localStorage.setItem(TOKEN_KEY, token);
      // api.defaults.headers.Authorization = `Bearer ${token}`;

      // --- PASSO 2, 3 e 4: BUSCAR DADOS COMPLEMENTARES EM PARALELO ---
      // Atualmente simulando as 3 chamadas distintas ao backend

      /* No futuro será:
        const [userData, phonesData, addressData] = await Promise.all([
           api.get(`/usuarios/me`),
           api.get(`/usuarios/me/telefones`),
           api.get(`/usuarios/me/endereco`)
        ]);
      */

      const [userData, telefonesData, enderecoData] = await Promise.all([
        // Chamada 1: Dados do Usuário (Tabela Usuario)
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                id: 'uuid-usuario-123',
                nome: 'João Matheus',
                email,
                cargo,
                // Outros campos do model Usuario...
              }),
            300
          );
        }),

        // Chamada 2: Telefones (Tabela Telefone)
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve([
                { id: 1, ddd: '61', numero: '998765432', principal: true },
                { id: 2, ddd: '61', numero: '33330000', principal: false }, // Exemplo de reserva
              ]),
            300
          );
        }),

        // Chamada 3: Endereço (Tabela Endereco)
        new Promise((resolve) => {
          // Simulando que admin não tem endereço cadastrado, por exemplo
          if (cargo === 'ADMIN') {
            resolve(null);
            return;
          }

          setTimeout(
            () =>
              resolve({
                id: 10,
                logradouro: 'Avenida das Araucárias',
                numero: '1000',
                complemento: 'Apto 101',
                bairro: 'Águas Claras',
                cidade: 'Brasília',
                estado: 'DF',
                cep: '71900-000',
                pontoReferencia: 'Próximo ao Metrô',
              }),
            300
          );
        }),
      ]);

      // --- PASSO 5: UNIFICAÇÃO DOS DADOS ---
      // Monta um objeto único para facilitar o uso
      const fullUser = {
        ...userData,
        telefones: telefonesData || [],
        endereco: enderecoData || null,
      };

      setUser(fullUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fullUser));

      return fullUser;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates) => {
    try {
      // Simula chamada API (PUT /usuarios/me)
      await new Promise((resolve) => {
        setTimeout(resolve, 600);
      });

      setUser((prevUser) => {
        const newUser = { ...prevUser, ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        return newUser;
      });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    // api.defaults.headers.Authorization = undefined;
  };

  const temCargo = (cargosPermitidas) => {
    if (!user) return false;
    if (Array.isArray(cargosPermitidas)) {
      return cargosPermitidas.includes(user.cargo);
    }
    return user.cargo === cargosPermitidas;
  };

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
