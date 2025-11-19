import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import DefaultLayout from './layouts/DefaultLayout';
import Cadastro from './pages/Cadastro/Cadastro';

/* --- O APP PRINCIPAL --- */
function App() {
  return (
    <Routes>
      {/* GRUPO 1: Rotas com Header e Footer */}
      <Route element={<DefaultLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      {/* GRUPO 2: Rotas "Soltas" (Sem Header/Footer) */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
    </Routes>
  );
}

export default App;
