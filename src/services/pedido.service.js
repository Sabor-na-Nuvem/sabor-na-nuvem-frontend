import api from './api';

export const criarPedido = async (dadosPedido) => {
  const response = await api.post('/pedidos', dadosPedido);
  return response.data;
};

export const listarMeusPedidos = async (filtros = {}) => {
  // Converte filtros para query string
  const params = new URLSearchParams();
  if (filtros.status) params.append('status', filtros.status);
  if (filtros.dataDe) params.append('dataDe', filtros.dataDe);
  if (filtros.dataAte) params.append('dataAte', filtros.dataAte);
  // ... outros filtros

  const response = await api.get(`/pedidos/me?${params.toString()}`);
  return response;
};

export const buscarMeuPedidoPorId = async (pedidoId) => {
  const response = await api.get(`/pedidos/me/${pedidoId}`);
  return response.data;
};

export const cancelarMeuPedido = async (pedidoId) => {
  const response = await api.post(`/pedidos/me/${pedidoId}/cancelar`);
  return response;
};

export const adicionarItensDoPedidoAoCarrinho = async (pedidoId) => {
  const response = await api.post('/usuarios/me/carrinho/itens/from-pedido', {
    pedidoId,
  });
  return response;
};
