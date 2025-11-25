import MOCK_MODIFICADORES from '../data/modificadores';

export const getModificadorData = (id) => {
  return MOCK_MODIFICADORES.find((m) => m.id === id);
};

export const calcularPrecoTotal = (produto, qtdProduto, modificadoresSelecionadosUI) => {
  if (!produto) return 0;
  let total = produto.preco || 0;

  if (produto.personalizacao) {
    produto.personalizacao.forEach((grupo) => {
      const selecao = modificadoresSelecionadosUI[grupo.id];
      if (!selecao) return;

      const modsDoGrupo = grupo.modificadores;

      const somarMod = (modId) => {
        const mod = modsDoGrupo.find((m) => m.id === modId);
        if (mod) total += Number(mod.valorAdicional || 0);
      };

      if (Array.isArray(selecao)) {
        selecao.forEach((id) => somarMod(id));
      } else {
        somarMod(selecao);
      }
    });
  }

  return total * qtdProduto;
};

export const formatCurrency = (valor) => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};
