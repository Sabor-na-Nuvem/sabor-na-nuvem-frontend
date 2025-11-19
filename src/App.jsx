import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Cardapio from './pages/Cardapio';
import Cadastro from './pages/Cadastro/Cadastro';
import ListaProdutos from './pages/ListaProdutos/ListaProdutos';
import DetalhesProduto from './pages/DetalhesProduto/DetalhesProduto';

import ScrollToTop from './components/ScrollToTop';
import DefaultLayout from './layouts/DefaultLayout';

/* --- O APP PRINCIPAL --- */
function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* GRUPO 1: Rotas com Header e Footer */}
        <Route element={<DefaultLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cardapio" element={<Cardapio />} />
          <Route path="/lista-produtos/:categoriaId" element={<ListaProdutos />} />
          <Route path="/detalhes-produto/:produtoId" element={<DetalhesProduto />} />
        </Route>

        {/* GRUPO 2: Rotas "Soltas" (Sem Header/Footer) */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
      </Routes>
    </>
  );
}

export default App;
