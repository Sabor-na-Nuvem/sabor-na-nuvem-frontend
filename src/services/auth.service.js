import api from './api';

export const login = async (email, senha) => {
  const response = await api.post('/auth/login', { email, senha });
  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
  }
  return response.data;
};

export const register = async (dados) => {
  const response = await api.post('/auth/register', dados);
  return response.data;
};

export const logout = async () => {
  await api.post('/auth/logout');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
