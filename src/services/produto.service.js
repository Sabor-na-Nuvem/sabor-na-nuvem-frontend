import api from './api';

// -- ROTAS PUBLICAS ---
export const listarCategorias = async () => {
  const response = await api.get('/categorias-produto');
  return response.data;
};

export const buscarCategoriaPorId = async (id) => {
  const response = await api.get(`/categorias-produto/${id}`);
  return response.data;
};

export const buscarCategoriaPorNome = async (nome) => {
  const response = await api.get(`/categorias-produto/buscar/por-nome`, {
    params: {
      nome,
    },
  });
  return response.data;
};

export const listarProdutosDaLoja = async (lojaId) => {
  const response = await api.get(`/lojas/${lojaId}/produtos-loja`);
  return response.data;
};

export const listarTodosProdutos = async () => {
  const response = await api.get('/produtos');
  return response.data;
};

export const listarProdutosPorCategoria = async (categoriaId) => {
  const response = await api.get('/produtos', {
    params: {
      categoriaId,
    },
  });
  return response.data;
};

export const buscarProdutoPorId = async (id) => {
  const response = await api.get(`/produtos/${id}`);
  return response.data;
};

export const buscarProdutoNaLoja = async (lojaId, produtoId) => {
  const response = await api.get(`/lojas/${lojaId}/produtos-loja/${produtoId}`);
  return response.data;
};
