import api from './api';

export const requestLogin = async (email, senha) => {
  const response = await api.post('/auth/login', { email, senha });
  return response;
};

export const register = async (dados) => {
  const response = await api.post('/auth/register', dados);
  return response;
};

export const requestLogout = async () => {
  await api.post('/auth/logout');
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response;
};

export const updatePassword = async (senhaAntiga, novaSenha) => {
  const response = await api.patch('/auth/update-password', { senhaAntiga, novaSenha });
  return response;
};

export const requestEmailUpdate = async (novoEmail, senhaAtual) => {
  const response = await api.post('/auth/request-email-update', {
    novoEmail,
    senhaAtual,
  });
  return response;
};

export const requestPasswordReset = async (email) => {
  const response = await api.post('/auth/request-password-reset', { email });
  return response;
};

export const resetPassword = async (token, novaSenha) => {
  const response = await api.post('/auth/reset-password', { token, novaSenha });
  return response;
};
