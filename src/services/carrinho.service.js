import api from './api';

export const buscarCarrinho = async () => {
  const response = await api.get('/usuarios/me/carrinho');
  return response;
};

export const atualizarCarrinho = async (dados) => {
  const response = await api.patch('/usuarios/me/carrinho', dados);
  return response;
};

export const requestLimparCarrinho = async () => {
  const response = await api.delete('/usuarios/me/carrinho');
  return response;
};

// --- Itens ---

export const adicionarItemCarrinho = async (payload) => {
  const response = await api.post('/usuarios/me/carrinho/itens', payload);
  return response;
};

export const atualizarQuantidadeItem = async (itemId, quantidade) => {
  const response = await api.patch(`/usuarios/me/carrinho/itens/${itemId}`, {
    qtdProduto: quantidade,
  });
  return response;
};

export const removerItemCarrinho = async (itemId) => {
  const response = await api.delete(`/usuarios/me/carrinho/itens/${itemId}`);
  return response;
};
