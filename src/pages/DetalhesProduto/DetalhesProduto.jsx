/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStoreSlash } from 'react-icons/fa';
import Section from '../../components/Section';
import Button from '../../components/Button';
import QuantitySelector from '../../components/QuantitySelector';
import GrupoPersonalizavel from '../../components/GrupoPersonalizavel';
import placeholderImage from '../../assets/placeholder-small.png';
import styles from './DetalhesProduto.module.css';
import { useCarrinho } from '../../contexts/CarrinhoContext';
import AlertModal from '../../components/Modals/AlertModal';
import { calcularPrecoTotal, formatCurrency } from '../../utils/produtoUtils';
import { buscarProdutoPorId, buscarProdutoNaLoja } from '../../services/produto.service';
import { LOJA_PADRAO_ID } from '../../constants/lojaId';

const DetalhesProduto = () => {
  const { produtoId } = useParams();
  const { adicionarItem, carrinhoInfo } = useCarrinho();

  // Estados de Dados
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);

  const [qtdProduto, setQtdProduto] = useState(1);
  const [modificadoresSelecionadosUI, setModificadoresSelecionadosUI] = useState({});
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);

  // Estado para controlar o AlertModal
  const [alertInfo, setAlertInfo] = useState({
    isOpen: false,
    title: '',
    msg: '',
    type: 'success',
  });

  // 1. BUSCA DE DADOS (Global vs Loja)
  useEffect(() => {
    const carregarProduto = async () => {
      setLoading(true);
      try {
        let dadosProduto = null;

        /*
        TODO: Modificar as seguintes linhas quando adicionar outras lojas:
          - if (true)
            -> if (carrinhoInfo?.lojaId)
          - const respostaLoja = await buscarProdutoNaLoja(LOJA_PADRAO_ID, produtoId);
              -> const respostaLoja = await buscarProdutoNaLoja(carrinhoInfo.lojaId, produtoId);
          - lojaId: LOJA_PADRAO_ID,
            -> lojaId: carrinhoInfo.lojaId,
        */
        if (LOJA_PADRAO_ID) {
          // --- MODO LOJA (Preço Real) ---
          const respostaLoja = await buscarProdutoNaLoja(LOJA_PADRAO_ID, produtoId);

          // Normaliza para um objeto único
          dadosProduto = {
            ...respostaLoja,
            preco: Number(respostaLoja.valorBase),
            disponivel: respostaLoja.disponivel,
            lojaId: LOJA_PADRAO_ID,
            temPreco: true,
          };
        } else {
          // --- MODO GLOBAL (Vitrine) ---
          const respostaGlobal = await buscarProdutoPorId(produtoId);

          dadosProduto = {
            ...respostaGlobal,
            preco: 0,
            disponivel: true,
            lojaId: null,
            temPreco: false,
          };
        }

        setProduto(dadosProduto);

        // Inicializa os modificadores (Padrão)
        if (dadosProduto.personalizacao && dadosProduto.personalizacao.length > 0) {
          const initialCustoms = {};
          dadosProduto.personalizacao.forEach((grupo) => {
            const isSelecaoUnica = grupo.selecaoMinima === 1 && grupo.selecaoMaxima === 1;
            const opcaoPadrao = grupo.modificadores?.find((m) => m.isOpcaoPadrao);

            if (isSelecaoUnica && opcaoPadrao) {
              initialCustoms[grupo.id] = opcaoPadrao.id;
            } else {
              initialCustoms[grupo.id] = isSelecaoUnica ? null : [];
            }
          });
          setModificadoresSelecionadosUI(initialCustoms);
        } else {
          setModificadoresSelecionadosUI({});
        }
      } catch (error) {
        setProduto(null);
      } finally {
        setLoading(false);
      }
    };

    if (produtoId) {
      carregarProduto();
    }
  }, [produtoId, carrinhoInfo]);

  // --- HANDLERS ---

  const handleQuantityChange = (newQuantity) => {
    setQtdProduto(newQuantity);
  };

  const handleCustomizationChange = useCallback((groupId, newSelection) => {
    setModificadoresSelecionadosUI((prev) => ({
      ...prev,
      [groupId]: newSelection,
    }));
  }, []);

  // Usa a função utilitária para cálculo
  const valorTotal = useMemo(
    () => calcularPrecoTotal(produto, qtdProduto, modificadoresSelecionadosUI),
    [produto, qtdProduto, modificadoresSelecionadosUI]
  );

  // Usa a função utilitária para formatação
  const valorTotalFormatado = formatCurrency(valorTotal);

  const closeAlert = () => {
    setAlertInfo((prev) => ({ ...prev, isOpen: false }));
  };

  // --- Lógica de carrinho ---
  const handleAdicionarAoCarrinho = async () => {
    if (!produto) return;

    // REGRA DE NEGÓCIO: Se não tem loja, bloqueia e avisa
    if (!produto.temPreco || !produto.lojaId) {
      setAlertInfo({
        isOpen: true,
        title: 'Selecione uma Loja',
        msg: 'Para adicionar itens ao carrinho e ver os preços reais, você precisa selecionar uma loja para comprar.',
        type: 'primary',
      });
      return;
    }

    setIsLoadingBtn(true);

    try {
      const modificadoresParaCarrinho = [];

      if (produto.personalizacao) {
        produto.personalizacao.forEach((grupo) => {
          const selecao = modificadoresSelecionadosUI[grupo.id];
          if (!selecao) return;

          const ids = Array.isArray(selecao) ? selecao : [selecao];

          ids.forEach((modId) => {
            const modData = grupo.modificadores.find((m) => m.id === modId);
            if (modData) {
              modificadoresParaCarrinho.push({
                modificadorId: modData.id,
                nomeModificador: modData.nome,
                valorAdicionalCobrado: Number(modData.valorAdicional || 0),
              });
            }
          });
        });
      }

      const itemParaCarrinho = {
        produtoId: produto.produtoId,
        lojaId: produto.lojaId,
        nomeProduto: produto.nome,
        descricaoProduto: produto.descricao,
        imagemUrl: produto.imagemUrl,
        valorUnitarioProduto: produto.preco,
        qtdProduto,
        modificadoresSelecionados: modificadoresParaCarrinho,
        loja: carrinhoInfo?.loja || { id: produto.lojaId, nome: 'Loja Atual' },
      };

      console.log(itemParaCarrinho);
      await adicionarItem(itemParaCarrinho);

      setAlertInfo({
        isOpen: true,
        title: 'Adicionado!',
        msg: `${qtdProduto}x ${produto.nome} adicionado ao carrinho.`,
        type: 'success',
      });
    } catch (error) {
      console.error('Erro ao adicionar:', error);
      let msg = 'Erro ao adicionar ao carrinho.';
      if (error.message && error.message.includes('outra loja')) {
        msg = 'Você já tem itens de outra loja no carrinho. Limpe o carrinho para mudar de loja.';
      }
      setAlertInfo({ isOpen: true, title: 'Atenção', msg, type: 'error' });
    } finally {
      setIsLoadingBtn(false);
    }
  };

  if (loading) {
    return (
      <Section id="detalhes-produto">
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner"></div>
          <p>Carregando produto...</p>
        </div>
      </Section>
    );
  }

  if (!produto) {
    return (
      <Section id="detalhes-produto">
        <div
          className="pageTitleContainer"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '5rem',
          }}
        >
          <h2 style={{ textAlign: 'center' }}>Produto não encontrado.</h2>
          <Link to="/cardapio">
            <Button>Voltar ao Cardápio</Button>
          </Link>
        </div>
      </Section>
    );
  }

  return (
    <Section id="detalhes-produto">
      <div className={styles.containerPrincipal}>
        {/* Feedback Visual do Modo */}
        {!produto.temPreco && (
          <div className={styles.containerAvisoVitrine}>
            <FaStoreSlash style={{ flexShrink: 0 }} />
            <span>
              <strong>Modo Vitrine:</strong> Selecione uma loja para ver preços, modificadores e
              comprar.
            </span>
          </div>
        )}
        <div className={styles.tituloProduto}>
          <h2>{produto.nome}</h2>
        </div>
        <div className={styles.produtoContent}>
          <div className={styles.leftBlock}>
            <div className={styles.imagemWrapper}>
              <img
                src={produto.imagemUrl || placeholderImage}
                className={styles.imagemPrincipal}
                alt={produto.nome}
                onError={(e) => {
                  e.target.src = placeholderImage;
                }}
              />
            </div>

            <div className={styles.controlsBottom}>
              <div>
                <QuantitySelector
                  onQuantityChange={handleQuantityChange}
                  initialQuantity={qtdProduto}
                  min={1}
                  disabled={isLoadingBtn}
                />
              </div>
              <span className={styles.precoBotaoInferior}>
                {produto.temPreco ? valorTotalFormatado : 'Sob Consulta'}
              </span>
            </div>

            <Button
              variant="primary"
              className={styles.addToCartButton}
              onClick={handleAdicionarAoCarrinho}
              disabled={isLoadingBtn || (!produto.disponivel && produto.temPreco)}
            >
              {isLoadingBtn
                ? 'Processando...'
                : produto.temPreco
                  ? 'Adicionar ao carrinho'
                  : 'Escolher Loja'}
            </Button>

            {!produto.disponivel && produto.temPreco && (
              <p style={{ color: 'var(--status-error)', textAlign: 'center', marginTop: '5px' }}>
                Produto indisponível nesta loja.
              </p>
            )}
          </div>

          <div className={styles.rightBlock}>
            <p className={styles.descricao}>{produto.descricao}</p>

            <h3 className={styles.personalizeSeuPedido}>Personalize seu pedido!</h3>

            {produto.personalizacao && produto.personalizacao.length > 0 ? (
              <div className={styles.customizationGroups}>
                {produto.personalizacao.map((grupo) => (
                  <GrupoPersonalizavel
                    key={grupo.id}
                    grupo={grupo}
                    onSelectionChange={handleCustomizationChange}
                    selectedValues={modificadoresSelecionadosUI[grupo.id]}
                  />
                ))}
              </div>
            ) : (
              <p>Nenhuma opção de personalização disponível para este produto.</p>
            )}
          </div>
        </div>
        <div className={styles.backLinkWrapper}>
          <Link to={`/cardapio`} className={styles.backLink}>
            &lt; Voltar ao cardápio
          </Link>
        </div>
      </div>

      {alertInfo.isOpen && (
        <AlertModal
          title={alertInfo.title}
          description={alertInfo.msg}
          variant={alertInfo.type === 'error' ? 'primary' : 'outline-success'}
          icon={alertInfo.type === 'error' ? 'error' : 'success'}
          onClose={closeAlert}
        />
      )}
    </Section>
  );
};

export default DetalhesProduto;
