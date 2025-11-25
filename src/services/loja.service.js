import api from './api';

export const buscarLojaPorId = async (lojaId) => {
  const response = await api.get(`/lojas/${lojaId}`);
  return response;
};
