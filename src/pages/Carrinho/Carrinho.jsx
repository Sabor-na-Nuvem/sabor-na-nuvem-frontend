/* eslint-disable no-nested-ternary */
import React from 'react';
import { Link } from 'react-router-dom';
import { FaRegTrashAlt, FaStore, FaTruck } from 'react-icons/fa';
import { LuPencilLine } from 'react-icons/lu';
import Section from '../../components/Section';
import Button from '../../components/Button';
import QuantitySelector from '../../components/QuantitySelector';
import { useCarrinho } from '../../contexts/CarrinhoContext';
import useMediaQuery from '../../hooks/useMediaQuery';
import placeholderImage from '../../assets/placeholder-small.png';
import styles from './Carrinho.module.css';
import { formatCurrency } from '../../utils/produtoUtils';
import { formatAddress } from '../../utils/enderecoUtils';
import { useAuth } from '../../contexts/AuthContext';

const DESKTOP_BREAKPOINT = '(min-width: 1024px)';

const Carrinho = () => {
  const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT);
  const { user } = useAuth();

  const {
    carrinho,
    carrinhoInfo,
    loadingCarrinho,
    removerItem,
    atualizarQuantidade,
    limparCarrinho,
    valorTotalFormatado,
    calcularPrecoTotalItem,
  } = useCarrinho();

  // 1. Feedback de Carregamento
  if (loadingCarrinho) {
    return (
      <Section id="carrinho" className={styles.carrinhoContent}>
        <div className="pageTitleContainer">
          <h2 style={{ textAlign: 'center' }}>Carregando carrinho...</h2>
        </div>
      </Section>
    );
  }

  // 2. Carrinho Vazio
  if (carrinho.length === 0) {
    return (
      <Section id="carrinho" className={styles.carrinhoVazio}>
        <div className="pageTitleContainer">
          <h2 style={{ textAlign: 'center' }}>Seu carrinho está vazio!</h2>
        </div>
        <p style={{ textAlign: 'center' }}>Que tal explorar nossos produtos?</p>
        <Link to="/cardapio">
          <Button variant="primary">Ir para o Cardápio</Button>
        </Link>
      </Section>
    );
  }

  // 3. Retorno normal
  return (
    <Section id="carrinho" className={styles.carrinhoContent}>
      <div className="pageTitleContainer">
        <h2 style={{ textAlign: 'center' }}>Carrinho</h2>
      </div>
      <div className={styles.carrinhoGrid}>
        {/* LADO ESQUERDO: ITENS DO CARRINHO */}
        <div className={styles.itensCarrinhoBox}>
          {carrinho.map((item) => {
            const precoTotalItem = calcularPrecoTotalItem(item);
            const key = item.id || item.idItemCarrinhoLocal;

            return (
              <div key={key} className={styles.itemCarrinho}>
                <div className={styles.itemCarrinhoHeader}>
                  <div>
                    <h3>{item.produto?.nome || item.nomeProduto}</h3>
                    {/* Descrição e Personalizações */}
                    {isDesktop && (
                      <p className={styles.itemCarrinhoDescription}>
                        {item.produto?.descricao || item.descricaoProduto}
                      </p>
                    )}
                    {item.modificadoresSelecionados &&
                      item.modificadoresSelecionados.length > 0 && (
                        <div className={styles.personalizacoesWrapper}>
                          <p style={{ fontWeight: 600 }}>Personalizações:</p>
                          <ul className={styles.personalizacoesList}>
                            {item.modificadoresSelecionados.map((mod, modIndex) => {
                              const nomeMod = mod.modificador?.nome || mod.nomeModificador;
                              const valorExtra = Number(mod.valorAdicionalCobrado);

                              return (
                                <li key={modIndex}>
                                  {nomeMod}
                                  {valorExtra > 0 && ` (+R$${formatCurrency(valorExtra)})`}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                  </div>
                  <div>
                    <img
                      src={item.produto?.imagemUrl || item.imagemUrl || placeholderImage}
                      alt={item.produto?.nome || item.nomeProduto}
                      className={styles.itemImagem}
                    />
                  </div>
                </div>
                {/* CONTROLE DE QUANTIDADE E VISUALIZACAO DO PRECO DO ITEM */}
                <div className={styles.itemCarrinhoControls}>
                  <div className={styles.quantityRemoveGroup}>
                    <QuantitySelector
                      initialQuantity={item.qtdProduto}
                      onQuantityChange={(newQtd) => atualizarQuantidade(item, newQtd)}
                      min={1}
                    />
                    <button
                      type="button"
                      onClick={() => removerItem(item)}
                      className={styles.removerItemButton}
                    >
                      <FaRegTrashAlt size={20} />
                    </button>
                  </div>
                  <span className={styles.itemCarrinhoPreco}>{formatCurrency(precoTotalItem)}</span>
                </div>
              </div>
            );
          })}

          {!isDesktop && (
            <>
              <div className={styles.limparCarrinhoContainer}>
                <Button variant="outline-red" onClick={limparCarrinho}>
                  <FaRegTrashAlt /> Limpar Carrinho
                </Button>
              </div>
              <Link to="/cardapio" className={styles.voltarLink} style={{ marginTop: '2rem' }}>
                &lt; Voltar ao cardápio
              </Link>
            </>
          )}
        </div>

        {/* LADO DIREITO: RESUMO DO PEDIDO */}
        <div className={styles.colunaDireita}>
          {isDesktop && (
            <div className={styles.limparCarrinhoContainer}>
              <Button variant="outline-red" onClick={limparCarrinho}>
                <FaRegTrashAlt /> Limpar Carrinho
              </Button>
            </div>
          )}
          <div className={styles.resumoPedidoBox}>
            <div className={styles.resumoHeader}>
              <div className={styles.resumoHeaderItem}>
                <h3>Descontos e promoções</h3>
                <span className={styles.resumoHeaderIcon}>&gt;</span>
              </div>
            </div>

            <div className={styles.resumoHeader}>
              <div className={styles.resumoHeaderItem}>
                <div className={styles.resumoInfoContainer}>
                  <FaTruck />
                  <h3>Tipo: {carrinhoInfo?.tipo || 'A definir'}</h3>
                </div>
                <LuPencilLine size={18} className={styles.resumoHeaderIcon} />
              </div>
            </div>

            <div className={styles.resumoHeader}>
              <div className={styles.resumoHeaderItem}>
                <div className={styles.resumoInfoContainer}>
                  <FaStore style={{ flexShrink: 0 }} />
                  <h3>
                    {'Local: '}
                    {carrinhoInfo?.tipo === 'RETIRADA'
                      ? carrinhoInfo?.loja?.nome || 'Sabor na Nuvem - Centro'
                      : user?.endereco
                        ? formatAddress(user.endereco)
                        : 'A definir'}
                  </h3>
                </div>
                <LuPencilLine size={18} className={styles.resumoHeaderIcon} />
              </div>
            </div>

            <div className={styles.resumoDetalhes}>
              <div className={styles.resumoDetalhesItem}>
                <span>Subtotal</span>
                <span>{valorTotalFormatado}</span>
              </div>
              <div className={styles.resumoDetalhesItem}>
                <span>Total</span>
                <span className={styles.resumoTotal}>{valorTotalFormatado}</span>
              </div>
            </div>

            {isDesktop && (
              <div className={styles.resumoFooter}>
                <Button variant="primary" className={styles.proximoButton}>
                  Ir para o Pagamento
                </Button>
              </div>
            )}
          </div>
          {isDesktop && (
            <Link to="/cardapio" className={styles.voltarLink} style={{ marginTop: '2rem' }}>
              &lt; Voltar ao cardápio
            </Link>
          )}
        </div>
      </div>

      {/* BARRA FIXA NO MOBILE */}
      {!isDesktop && (
        <div className={styles.mobileStickyBar}>
          <div>
            <div className={styles.mobileTotalLabel}>Total</div>
            <div className={styles.mobileTotalValue}>{valorTotalFormatado}</div>
          </div>
          <Button variant="primary" style={{ minWidth: '140px' }}>
            Ir para o Pagamento
          </Button>
        </div>
      )}
    </Section>
  );
};

export default Carrinho;
