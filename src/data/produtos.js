/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
import placeholderImage from '../assets/placeholder-small.png';
import MOCK_CUSTOMIZABLES from './personalizaveis';

const MOCK_CATEGORIES_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

let nextProductId = 1;

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Array de descrições e nomes genéricos
const productDescriptions = [
  'A combinação perfeita de sabor e frescor, feito na hora para você.',
  'Nosso campeão de vendas! Ingredientes selecionados e tempero especial.',
  'Opção leve e saudável, ideal para o almoço ou jantar.',
];
const productNames = [
  'Mega Bacon Supreme',
  'Pizza Margherita',
  'Salada Caesar',
  'Combo Kids',
  'X-Tudo Duplo',
  'Suco da Estação',
  'Acompanhamento Premium',
];

const MOCK_PRODUCTS = [];

// ====================================================================
// Geração dos Produtos Mockados (com Relações)
// ====================================================================

MOCK_CATEGORIES_IDS.forEach((categoryId) => {
  const numProducts = getRandomInt(1, 4);

  for (let i = 0; i < numProducts; i++) {
    const productName = productNames[getRandomInt(0, productNames.length - 1)];
    const description = productDescriptions[getRandomInt(0, productDescriptions.length - 1)];
    const basePrice = (getRandomInt(1500, 4990) / 100).toFixed(2);

    // 1. Definição do produto
    const product = {
      id: nextProductId++,
      imagemUrl: placeholderImage,
      nome: `${productName} ${categoryId}-${nextProductId - 1}`,
      descricao: description,
      categoriaId: categoryId,
      preco: parseFloat(basePrice),
      createdAt: new Date(),
      updatedAt: new Date(),

      // 2. INJEÇÃO DE RELAÇÕES MOCKADAS
      // Vazio por padrão, exceto para o primeiro produto (ID=1) que terá personalização
      personalizacao: [],

      vendidoNosPedidos: [], // Omissão de dados complexos
      estaNosCarrinhos: [],
      lojasQueVendem: [],
    };

    // Adiciona personalização APENAS ao primeiro produto para simplificar o mock
    if (product.id === 1) {
      product.nome = 'Cheese Bacon Custom';
      product.descricao = 'O hambúrguer mais personalizável da casa.';
      product.preco = 29.9;
      product.personalizacao = MOCK_CUSTOMIZABLES;
    }

    // Adiciona o produto ao array
    MOCK_PRODUCTS.push(product);
  }
});

export default MOCK_PRODUCTS;
