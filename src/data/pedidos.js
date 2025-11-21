// --- SIMULAÇÃO DA RESPOSTA REAL DO BACKEND (PRISMA) ---

const DB_RESPONSE_MOCK = [
  {
    id: 1,
    dataHora: '2025-09-17T14:30:00',
    status: 'PENDENTE',
    tipo: 'DELIVERY',
    valorBase: 44.8,
    valorCobrado: 44.8,
    observacoes: 'Sem cebola no X-Bacon',
    // include: cupom: { select: { codCupom: true } }
    cupom: null,
    // include: loja: { select: { nome: true } }
    loja: { nome: 'Sabor na Nuvem - Taguatinga' },
    // include: cliente: { select: { nome: true } }
    cliente: { nome: 'João Matheus' },

    itensNoPedido: [
      {
        id: 101,
        qtdProduto: 1,
        valorUnitarioProduto: 29.9,
        produto: {
          nome: 'X-Bacon',
          imagemUrl: 'https://placehold.co/100x100/png?text=XB', // URL fictícia
          categoria: { nome: 'Hambúrgueres' },
          personalizacao: { id: 1, nome: 'Montagem Padrão' },
        },
        modificadoresSelecionados: [
          {
            valorAdicionalCobrado: 0.0,
            modificador: {
              personalizavelId: 1,
              nome: 'Sem mostarda',
              ordemVisualizacao: 1,
            },
          },
        ],
      },
      {
        id: 102,
        qtdProduto: 1,
        valorUnitarioProduto: 14.9,
        produto: {
          nome: 'Batata frita',
          imagemUrl: 'https://placehold.co/100x100/png?text=Fritas',
          categoria: { nome: 'Acompanhamentos' },
          personalizacao: { id: 2, nome: 'Tamanho e Adicionais' },
        },
        modificadoresSelecionados: [
          {
            valorAdicionalCobrado: 5.0,
            modificador: {
              personalizavelId: 5,
              nome: 'Adicionar bacon e cheddar',
              ordemVisualizacao: 2,
            },
          },
        ],
      },
    ],
  },
  {
    id: 2,
    dataHora: '2025-09-14T20:10:00',
    status: 'REALIZADO',
    tipo: 'RETIRADA',
    valorBase: 29.9,
    valorCobrado: 29.9,
    observacoes: null,
    cupom: null,
    loja: { nome: 'Sabor na Nuvem - Taguatinga' },
    cliente: { nome: 'João Matheus' },
    itensNoPedido: [
      {
        id: 201,
        qtdProduto: 1,
        valorUnitarioProduto: 29.9,
        produto: {
          nome: 'X-Bacon',
          imagemUrl: 'https://placehold.co/100x100/png?text=XB',
          categoria: { nome: 'Hambúrgueres' },
          personalizacao: { id: 1, nome: 'Montagem Padrão' },
        },
        modificadoresSelecionados: [],
      },
    ],
  },
  {
    id: 3,
    dataHora: '2025-09-11T16:00:00',
    status: 'REALIZADO',
    tipo: 'DELIVERY',
    valorBase: 160.99,
    valorCobrado: 160.99,
    observacoes: 'Campainha estragada, ligar quando chegar.',
    cupom: null,
    loja: { nome: 'Sabor na Nuvem - Asa Norte' },
    cliente: { nome: 'João Matheus' },
    itensNoPedido: [
      {
        id: 301,
        qtdProduto: 4,
        valorUnitarioProduto: 35.0,
        produto: {
          nome: 'Combo Família',
          imagemUrl: 'https://placehold.co/100x100/png?text=Combo',
          categoria: { nome: 'Combos' },
          personalizacao: null,
        },
        modificadoresSelecionados: [],
      },
    ],
  },
  {
    id: 5,
    dataHora: '2025-09-03T12:00:00',
    status: 'REALIZADO',
    tipo: 'RETIRADA',
    valorBase: 89.9,
    valorCobrado: 79.9,
    observacoes: null,
    cupom: { codCupom: 'BEMVINDO10' }, // Mock do cupom populado
    loja: { nome: 'Sabor na Nuvem - Taguatinga' },
    cliente: { nome: 'João Matheus' },
    itensNoPedido: [
      {
        id: 501,
        qtdProduto: 2,
        valorUnitarioProduto: 39.95,
        produto: {
          nome: 'Hambúrguer Artesanal',
          imagemUrl: 'https://placehold.co/100x100/png?text=Artesanal',
          categoria: { nome: 'Hambúrgueres' },
          personalizacao: null,
        },
        modificadoresSelecionados: [],
      },
    ],
  },
];

// --- ADAPTER / MAPPER ---
// Adapta a estrutura complexa do Prisma para o formato simples que o UI consome.

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '');

const MOCK_PEDIDOS = DB_RESPONSE_MOCK.map((pedidoDB) => {
  const dataObj = new Date(pedidoDB.dataHora);

  return {
    id: pedidoDB.id,

    // Formatação de Data/Hora
    data: dataObj.toLocaleDateString('pt-BR'),
    hora: dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),

    // Campos Simples
    status: capitalize(pedidoDB.status),
    modoEntrega: pedidoDB.tipo === 'DELIVERY' ? 'Delivery' : 'Retirar na loja',
    observacoes: pedidoDB.observacoes || 'Nenhuma',

    // Acessando propriedades aninhadas do include
    loja: pedidoDB.loja?.nome || 'Loja desconhecida',
    cupom: pedidoDB.cupom?.codCupom || null, // Agora acessa o objeto cupom, se existir

    // Valores Monetários
    subtotal: formatCurrency(pedidoDB.valorBase),
    total: formatCurrency(pedidoDB.valorCobrado),

    // Mapeamento dos Itens
    itens: pedidoDB.itensNoPedido.map((item) => {
      // Mapeia modificadores para strings de exibição
      const listaPersonalizacoes = item.modificadoresSelecionados.map((mod) => {
        const valorExtra =
          Number(mod.valorAdicionalCobrado) > 0
            ? ` (+ ${formatCurrency(mod.valorAdicionalCobrado)})`
            : '';
        return `${mod.modificador.nome}${valorExtra}`;
      });

      return {
        id: item.id,
        nome: item.produto.nome,
        categoria: item.produto.categoria?.nome || '',
        imagem: item.produto.imagemUrl,
        quantidade: item.qtdProduto,
        preco: formatCurrency(item.valorUnitarioProduto),
        personalizacoes: listaPersonalizacoes,
      };
    }),
  };
});

export default MOCK_PEDIDOS;
