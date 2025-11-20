import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-unresolved
import { v4 as uuidv4 } from 'uuid';

export const CarrinhoContext = createContext();

const LOCAL_STORAGE_KEY = 'carrinhoAnonimo';

export const CarrinhoProvider = ({ children }) => {
  const [carrinho, setCarrinho] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedCart) {
      try {
        setCarrinho(JSON.parse(savedCart));
      } catch (e) {
        console.error('Erro ao parsear carrinho do LocalStorage:', e);
        localStorage.removeItem(LOCAL_STORAGE_KEY); // Limpa o carrinho corrompido
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(carrinho));
  }, [carrinho]);

  // Funções de manipulação do carrinho
  const adicionarItem = (itemToAdd) => {
    setCarrinho((prevCarrinho) => {
      const itemExistenteIndex = prevCarrinho.findIndex(
        (item) =>
          item.produtoId === itemToAdd.produtoId &&
          JSON.stringify(item.modificadoresSelecionados.map((m) => m.modificadorId).sort()) ===
            JSON.stringify(itemToAdd.modificadoresSelecionados.map((m) => m.modificadorId).sort())
      );

      if (itemExistenteIndex > -1) {
        const novoCarrinho = [...prevCarrinho];

        novoCarrinho[itemExistenteIndex] = {
          ...novoCarrinho[itemExistenteIndex],
          qtdProduto: novoCarrinho[itemExistenteIndex].qtdProduto + itemToAdd.qtdProduto,
        };

        return novoCarrinho;
        // eslint-disable-next-line no-else-return
      } else {
        return [...prevCarrinho, { ...itemToAdd, idItemCarrinhoLocal: uuidv4() }];
      }
    });
  };

  // Remover item por idItemCarrinhoLocal
  const removerItem = (idItemCarrinhoLocal) => {
    setCarrinho((prevCarrinho) =>
      prevCarrinho.filter((item) => item.idItemCarrinhoLocal !== idItemCarrinhoLocal)
    );
  };

  // Atualizar quantidade por idItemCarrinhoLocal
  const atualizarQuantidade = (idItemCarrinhoLocal, newQtd) => {
    setCarrinho((prevCarrinho) =>
      prevCarrinho.map((item) =>
        item.idItemCarrinhoLocal === idItemCarrinhoLocal
          ? { ...item, qtdProduto: Math.max(1, newQtd) } // Garante qte >= 1
          : item
      )
    );
  };

  // Remover todos os itens do carrinho
  const limparCarrinho = () => {
    setCarrinho([]);
  };

  // Calcular o total de um único item (produto + modificadores)
  const calcularPrecoTotalItem = (item) => {
    let precoUnitarioFinal = item.valorUnitarioProduto;
    item.modificadoresSelecionados.forEach((mod) => {
      precoUnitarioFinal += mod.valorAdicionalCobrado;
    });
    return precoUnitarioFinal * item.qtdProduto;
  };

  // Calcular o total do carrinho (memorizado para performance)
  const totalCarrinho = useMemo(() => {
    return carrinho.reduce((total, item) => total + calcularPrecoTotalItem(item), 0);
  }, [carrinho]);

  const valorTotalFormatado = totalCarrinho.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <CarrinhoContext.Provider
      value={{
        carrinho,
        adicionarItem,
        removerItem,
        atualizarQuantidade,
        limparCarrinho,
        totalCarrinho,
        valorTotalFormatado,
        calcularPrecoTotalItem,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
};

CarrinhoProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useCarrinho = () => useContext(CarrinhoContext);
