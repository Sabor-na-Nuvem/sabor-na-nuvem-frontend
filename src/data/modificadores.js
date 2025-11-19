const MOCK_MODIFIERS = [
  // --- Modificadores para Queijo (Personalizavel ID: 1) ---
  {
    id: 101,
    nome: 'Cheddar',
    descricao: 'Queijo Cheddar Derretido',
    ordemVisualizacao: 1,
    isOpcaoPadrao: true,
    personalizavelId: 1, // Relacionado à opção "Tipo de Queijo"
    precoAdicional: 0.0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 102,
    nome: 'Provolone',
    descricao: 'Queijo Provolone Defumado',
    ordemVisualizacao: 2,
    isOpcaoPadrao: false,
    personalizavelId: 1,
    precoAdicional: 2.5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // --- Modificadores para Adicionais de Carne (Personalizavel ID: 2) ---
  {
    id: 201,
    nome: 'Adicionar Bacon',
    descricao: '3 Fatias de Bacon Crocante',
    ordemVisualizacao: 1,
    isOpcaoPadrao: false,
    personalizavelId: 2, // Relacionado à opção "Adicionais"
    precoAdicional: 3.0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 202,
    nome: 'Duplo Hambúrguer',
    descricao: 'Adicione mais uma carne de 80g',
    ordemVisualizacao: 2,
    isOpcaoPadrao: false,
    personalizavelId: 2,
    precoAdicional: 5.0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default MOCK_MODIFIERS;
