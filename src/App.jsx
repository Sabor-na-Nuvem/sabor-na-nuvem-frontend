import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import UserInfo from './pages/UserInfo';
import Cardapio from './pages/Cardapio';
import Carrinho from './pages/Carrinho';
import Cadastro from './pages/Cadastro';
import ListaProdutos from './pages/ListaProdutos';
import RecuperarSenha from './pages/RecuperarSenha';
import RedefinirSenha from './pages/RedefinirSenha';
import DetalhesProduto from './pages/DetalhesProduto';
import HistoricoPedidos from './pages/HistoricoPedidos';

import ScrollToTop from './components/ScrollToTop';
import DefaultLayout from './layouts/DefaultLayout';
import ProtectedRoute from './components/ProtectedRoute';
// import DashboardLayout from './layouts/DashboardLayout';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* GRUPO 1: Rotas com Header e Footer */}
        <Route element={<DefaultLayout />}>
          {/* --- ROTAS PÚBLICAS --- */}
          <Route path="/" element={<Home />} />
          <Route path="/cardapio" element={<Cardapio />} />
          <Route path="/carrinho" element={<Carrinho />} />
          <Route path="/lista-produtos/:categoriaId" element={<ListaProdutos />} />
          <Route path="/detalhes-produto/:produtoId" element={<DetalhesProduto />} />

          {/* --- ROTAS DE CLIENTE --- */}
          <Route element={<ProtectedRoute allowedRoles={['CLIENTE']} />}>
            <Route path="/minha-conta" element={<Perfil />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['CLIENTE']} />}>
            <Route path="/minha-conta/info" element={<UserInfo />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['CLIENTE']} />}>
            <Route path="/minha-conta/historico-pedidos" element={<HistoricoPedidos />} />
          </Route>
        </Route>

        {/* GRUPO 2: Rotas com SideBar */}
        {/* <Route element={<DashboardLayout />}>
          {/* --- ROTAS DE FUNCIONÁRIO --- }
          <Route element={<ProtectedRoute allowedRoles={['FUNCIONARIO', 'ADMIN']} />}>
            <Route path="/portal" element={<DashboardLoja />} />
          </Route>

          {/* -- ROTAS DE ADMIN --- }
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<DashboardAdmin />} />
          </Route>
        </Route> */}

        {/* GRUPO 3: Rotas "Soltas" (Sem Layout) */}
        {/* --- ROTAS PÚBLICAS --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/reset-password" element={<RedefinirSenha />} />
      </Routes>
    </>
  );
}

export default App;
