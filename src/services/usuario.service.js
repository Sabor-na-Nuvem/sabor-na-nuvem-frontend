import api from './api';

// --- Perfil ---

export const buscarUsuarioAtual = async () => {
  const response = await api.get('/usuarios/me');
  return response;
};

export const atualizarUsuario = async (updates) => {
  const response = await api.patch('/usuarios/me', updates);
  return response;
};

export const deletarConta = async (senhaConfirmacao) => {
  const response = await api.delete('/usuarios/me', {
    data: { senha: senhaConfirmacao },
  });
  return response;
};

// --- Endereços ---

export const buscarEndereco = async (userId) => {
  const response = await api.get(`/usuarios/${userId}/endereco`);
  return response;
};

export const criarEndereco = async (userId, enderecoSanitizado) => {
  const response = await api.post(`/usuarios/${userId}/endereco`, enderecoSanitizado);
  return response;
};

export const atualizarEndereco = async (userId, enderecoSanitizado) => {
  const response = await api.put(`/usuarios/${userId}/endereco`, enderecoSanitizado);
  return response;
};

// --- Telefones ---

export const listarTelefones = async (userId) => {
  const response = await api.get(`/usuarios/${userId}/telefones`);
  return response;
};

export const adicionarTelefone = async (userId, { ddd, numero }) => {
  const response = await api.post(`/usuarios/${userId}/telefones`, { ddd, numero });
  return response;
};

export const atualizarTelefone = async (userId, telefoneId, { ddd, numero }) => {
  const response = await api.put(`/usuarios/${userId}/telefones/${telefoneId}`, { ddd, numero });
  return response;
};
