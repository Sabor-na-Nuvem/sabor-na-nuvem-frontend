/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
import placeholderImage from '../assets/placeholder-small.png';

// Array de nomes genéricos
const productNames = [
  'Clássico Cheddar',
  'Mega Bacon Supreme',
  'Salada Fresca',
  'Wrap de Frango Crocante',
  'Pizza Margherita Deluxe',
  'Açaí Power Bowl',
  'Suco Natural de Laranja',
  'Batata Rústica Gourmet',
  'Combo Família Especial',
  'Sanduíche Vegano Light',
  'Milkshake de Chocolate',
  'Água Mineral com Gás',
];

// Mapeamento das categorias para garantir a relação
const MOCK_CATEGORIES_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

let nextProductId = 1;

const MOCK_PRODUCTS = [];

// Função para gerar um número aleatório entre min e max (inclusivo)
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// ====================================================================
// Geração dos Produtos Mockados
// ====================================================================
MOCK_CATEGORIES_IDS.forEach((categoryId) => {
  // Gera um número aleatório de produtos (1 a 4) para a categoria atual
  const numProducts = getRandomInt(1, 4);

  for (let i = 0; i < numProducts; i++) {
    const randomNameIndex = getRandomInt(0, productNames.length - 1);
    const productName = productNames[randomNameIndex];

    MOCK_PRODUCTS.push({
      id: nextProductId++,
      imageUrl: placeholderImage,
      nome: `${productName} #${nextProductId - 1}`,
      categoriaId: categoryId,
    });
  }
});

export default MOCK_PRODUCTS;
