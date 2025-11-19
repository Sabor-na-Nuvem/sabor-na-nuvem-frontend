import MOCK_MODIFIERS from './modificadores';

const MOCK_CUSTOMIZABLES = [
  // --- Personalizável para o produto 1 (Mega Bacon Supreme) ---
  {
    id: 1,
    nome: 'Tipo de Queijo',
    produtoId: 1,
    selecaoMinima: 1,
    selecaoMaxima: 1, // Opção de escolha única
    createdAt: new Date(),
    updatedAt: new Date(),
    // Inclui apenas os modificadores 101 e 102
    modificadores: MOCK_MODIFIERS.filter((m) => m.personalizavelId === 1),
  },
  // --- Outro Personalizável para o produto 1 ---
  {
    id: 2,
    nome: 'Adicionais',
    produtoId: 1,
    selecaoMinima: 0,
    selecaoMaxima: 2, // Opção de escolha múltipla (até 2)
    createdAt: new Date(),
    updatedAt: new Date(),
    // Inclui apenas os modificadores 201 e 202
    modificadores: MOCK_MODIFIERS.filter((m) => m.personalizavelId === 2),
  },
  // --- Personalizável para o produto 2 (Pizza Margherita) ---
  {
    id: 3,
    nome: 'Tamanho',
    produtoId: 2,
    selecaoMinima: 1,
    selecaoMaxima: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    modificadores: [
      // Mock simples de tamanho
      {
        id: 301,
        nome: 'Pequena',
        isOpcaoPadrao: true,
        personalizavelId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 302,
        nome: 'Grande',
        isOpcaoPadrao: false,
        personalizavelId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
];

export default MOCK_CUSTOMIZABLES;
