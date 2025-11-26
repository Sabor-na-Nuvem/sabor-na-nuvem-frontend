// TODO: Add imagemUrl nas categorias no prisma
export const CATEGORY_IMAGES = {
  'Destaques do Dia':
    'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop', // Mesa cheia/Banquete
  Acompanhamentos:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/French_Fries.JPG/250px-French_Fries.JPG', // Batata Frita
  'Combos & Ofertas':
    'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=600&auto=format&fit=crop', // Combo com refri
  'Menu Kids':
    'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=1000&auto=format&fit=crop', // Nuggets e frituras
  'Lanches de Frango':
    'https://images.unsplash.com/photo-1615557960916-5f4791effe9d?q=80&w=600&auto=format&fit=crop', // Chicken Burger
  Hambúrgueres:
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop', // Burger Clássico
  'Vegetarianos & Leves':
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop', // Veggie Burger
  Bebidas:
    'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop', // Refrigerante
  'Sobremesas & Shakes':
    'https://images.unsplash.com/photo-1579954115563-e72bf1381629?q=80&w=600&auto=format&fit=crop', // Milkshake
};

// Imagem padrão caso venha uma categoria nova do banco sem foto definida
export const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1550317138-10000687a72b?q=80&w=600&auto=format&fit=crop';
