import MOCK_MODIFICADORES from '../data/modificadores';

export const getModificadorData = (id) => {
  return MOCK_MODIFICADORES.find((m) => m.id === id);
};

export const calcularPrecoTotal = (produto, qtdProduto, modificadoresSelecionadosUI) => {
  if (!produto) return 0;

  const precoProdutoBase = produto.preco;
  let precoTotalModificadores = 0;

  Object.values(modificadoresSelecionadosUI).forEach((selectedValue) => {
    // Caso 1: Seleção única (radio button) - selectedValue é um ID numérico
    if (typeof selectedValue === 'number' && selectedValue !== null) {
      const modifier = getModificadorData(selectedValue);
      if (modifier && modifier.precoAdicional > 0) {
        precoTotalModificadores += modifier.precoAdicional;
      }
    }
    // Caso 2: Múltipla seleção (checkboxes) - selectedValue é um array de IDs
    else if (Array.isArray(selectedValue)) {
      selectedValue.forEach((modifierId) => {
        const modifier = getModificadorData(modifierId);
        if (modifier && modifier.precoAdicional > 0) {
          precoTotalModificadores += modifier.precoAdicional;
        }
      });
    }
  });

  return (precoProdutoBase + precoTotalModificadores) * qtdProduto;
};

export const formatCurrency = (valor) => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};
