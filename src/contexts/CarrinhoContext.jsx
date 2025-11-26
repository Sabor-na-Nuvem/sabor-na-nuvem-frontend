/* eslint-disable no-else-return */
import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-unresolved
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import {
  adicionarItemCarrinho,
  atualizarCarrinho,
  atualizarQuantidadeItem,
  buscarCarrinho,
  removerItemCarrinho,
  requestLimparCarrinho,
} from '../services/carrinho.service';

export const CarrinhoContext = createContext();

const LOCAL_STORAGE_KEY = 'carrinhoAnonimo';
const DEFAULT_CARRINHO_INFO = { lojaId: 1 };

export const CarrinhoProvider = ({ children }) => {
  const { user } = useAuth();
  // Apenas a LISTA de itens (Array)
  const [carrinho, setCarrinho] = useState([]);
  // Metadados do carrinho (Loja, Tipo, ID do Carrinho, Subtotal do Backend)
  const [carrinhoInfo, setCarrinhoInfo] = useState(DEFAULT_CARRINHO_INFO);

  const [loadingCarrinho, setLoadingCarrinho] = useState(false);

  // --- 1. CARREGAMENTO DO CARRINHO ---
  const refreshCarrinho = useCallback(async () => {
    if (user) {
      // --- MODO LOGADO (Backend) ---
      setLoadingCarrinho(true);
      try {
        const { data } = await buscarCarrinho();

        const { itensNoCarrinho, ...infoGeral } = data;

        setCarrinho(itensNoCarrinho || []);
        setCarrinhoInfo(data.id ? infoGeral : DEFAULT_CARRINHO_INFO);
      } catch (error) {
        console.error('Erro ao buscar carrinho do servidor:', error);
      } finally {
        setLoadingCarrinho(false);
      }
    } else {
      // --- MODO ANÔNIMO (LocalStorage) ---
      // Recarrega do storage para garantir sincronia se houve mudança externa
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);

          if (Array.isArray(parsedData)) {
            setCarrinho(parsedData);
            setCarrinhoInfo(DEFAULT_CARRINHO_INFO);
          } else {
            setCarrinho(parsedData.itens || []);
            setCarrinhoInfo(parsedData.info || DEFAULT_CARRINHO_INFO);
          }
        } catch (e) {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          setCarrinho([]);
          setCarrinhoInfo(DEFAULT_CARRINHO_INFO);
        }
      } else {
        setCarrinho([]);
        setCarrinhoInfo(DEFAULT_CARRINHO_INFO);
      }
    }
  }, [user]);

  // --- 2. PERSISTÊNCIA LOCAL (Apenas Anônimos) ---
  useEffect(() => {
    if (!user) {
      // Salva o pacote completo (Itens + Metadados)
      const dadosParaSalvar = {
        itens: carrinho,
        info: carrinhoInfo,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dadosParaSalvar));
    }
  }, [carrinho, carrinhoInfo, user]);

  // --- 3. FUNÇÕES DE MANIPULAÇÃO ---

  // eslint-disable-next-line consistent-return
  const adicionarItem = async (itemToAdd) => {
    // Validação de estrutura do item (Garante compatibilidade com backend)
    const itemPadronizado = {
      ...itemToAdd,
      valorUnitarioProduto: Number(itemToAdd.valorUnitarioProduto),
      modificadoresSelecionados:
        itemToAdd.modificadoresSelecionados?.map((m) => ({
          ...m,
          valorAdicionalCobrado: Number(m.valorAdicionalCobrado),
        })) || [],
    };

    if (user) {
      // --- FLUXO LOGADO ---
      try {
        const payload = {
          produtoId: itemPadronizado.produtoId,
          qtdProduto: itemPadronizado.qtdProduto,
          idLoja: itemPadronizado.lojaId,
          modificadores: itemPadronizado.modificadoresSelecionados.map((m) => ({
            modificadorId: m.modificadorId,
          })),
        };
        const { data } = await adicionarItemCarrinho(payload);

        const { itensNoCarrinho, ...infoGeral } = data;
        setCarrinho(itensNoCarrinho || []);
        setCarrinhoInfo(infoGeral || DEFAULT_CARRINHO_INFO);
        return true;
      } catch (error) {
        console.error('Erro ao adicionar item:', error);
        throw error;
      }
    } else {
      // --- FLUXO ANÔNIMO ---

      // 1. Validação de Loja
      if (
        carrinhoInfo &&
        carrinhoInfo.lojaId &&
        carrinho.length > 0 &&
        carrinhoInfo.lojaId !== itemPadronizado.lojaId
      ) {
        // TODO: Adicionar alerta para isso
        throw new Error(`Este item é de outra loja. Limpe o carrinho para trocar de loja.`);
      }

      // Atualiza Info se for o primeiro item
      if (!carrinhoInfo) {
        setCarrinhoInfo({
          ...DEFAULT_CARRINHO_INFO,
          lojaId: itemPadronizado.lojaId,
          tipo: 'ENTREGA', // Padrão inicial
          loja: itemPadronizado.loja,
        });
      }

      setCarrinho((prevCarrinho) => {
        // Lógica de agrupar itens iguais
        const itemIndex = prevCarrinho.findIndex(
          (item) =>
            item.produtoId === itemPadronizado.produtoId &&
            JSON.stringify(item.modificadoresSelecionados.map((m) => m.modificadorId).sort()) ===
              JSON.stringify(
                itemPadronizado.modificadoresSelecionados.map((m) => m.modificadorId).sort()
              )
        );

        if (itemIndex > -1) {
          const novo = [...prevCarrinho];
          novo[itemIndex].qtdProduto += itemPadronizado.qtdProduto;
          return novo;
        } else {
          return [...prevCarrinho, { ...itemPadronizado, id: uuidv4(), isLocal: true }];
        }
      });
    }
  };

  const removerItem = async (item) => {
    if (user) {
      try {
        const { data } = await removerItemCarrinho(item.id);

        if (data && data.itensNoCarrinho) {
          const { itensNoCarrinho, ...infoGeral } = data;
          setCarrinho(itensNoCarrinho);
          setCarrinhoInfo(infoGeral);
        } else {
          // Carrinho ficou vazio/foi deletado
          setCarrinho([]);
          setCarrinhoInfo(DEFAULT_CARRINHO_INFO);
        }
      } catch (error) {
        console.error('Erro ao remover item:', error);
      }
    } else {
      const idRemover = item.id || item.idItemCarrinhoLocal;
      const novoCarrinho = carrinho.filter((i) => (i.id || i.idItemCarrinhoLocal) !== idRemover);
      setCarrinho(novoCarrinho);

      if (novoCarrinho.length === 0) {
        setCarrinhoInfo(DEFAULT_CARRINHO_INFO);
      }
    }
  };

  const atualizarQuantidade = async (item, novaQtd) => {
    const quantidade = Math.max(1, novaQtd);

    if (user) {
      try {
        // Otimista
        setCarrinho((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, qtdProduto: quantidade } : i))
        );

        const { data } = await atualizarQuantidadeItem(item.id, quantidade);

        if (data && data.itensNoCarrinho) {
          const { itensNoCarrinho, ...infoGeral } = data;
          setCarrinho(itensNoCarrinho);
          setCarrinhoInfo(infoGeral);
        }
      } catch (error) {
        console.error('Erro ao atualizar:', error);
      }
    } else {
      const idAtualizar = item.id || item.idItemCarrinhoLocal;
      setCarrinho((prev) =>
        prev.map((i) =>
          (i.id || i.idItemCarrinhoLocal) === idAtualizar ? { ...i, qtdProduto: quantidade } : i
        )
      );
    }
  };

  const limparCarrinho = async () => {
    if (user) {
      try {
        await requestLimparCarrinho();
      } catch (error) {
        console.error(error);
      }
    }
    setCarrinho([]);
    setCarrinhoInfo(null);
    if (!user) localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  // --- Funções Auxiliares para Metadados (Tipo de Pedido, etc) ---

  const atualizarInfoCarrinho = async (dados) => {
    if (user) {
      const { data } = await atualizarCarrinho(dados);
      // Backend retorna { carrinho: {...}, avisos: [] }
      const { itensNoCarrinho, ...infoGeral } = data.carrinho;
      setCarrinho(itensNoCarrinho);
      setCarrinhoInfo(infoGeral);
      return data.avisos;
    } else {
      setCarrinhoInfo((prev) => ({ ...(prev || DEFAULT_CARRINHO_INFO), ...dados }));
      return [];
    }
  };

  // --- CÁLCULOS ---

  const calcularPrecoTotalItem = (item) => {
    let preco = Number(item.valorUnitarioProduto);
    item.modificadoresSelecionados?.forEach((m) => {
      preco += Number(m.valorAdicionalCobrado);
    });
    return preco * item.qtdProduto;
  };

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
        refreshCarrinho,
        carrinho,
        carrinhoInfo,
        loadingCarrinho,
        adicionarItem,
        removerItem,
        atualizarQuantidade,
        limparCarrinho,
        atualizarInfoCarrinho,
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
