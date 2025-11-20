import React from 'react';
import { Link } from 'react-router-dom';
import { FaRegTrashAlt } from 'react-icons/fa';
import Section from '../../components/Section';
import Button from '../../components/Button';
import QuantitySelector from '../../components/QuantitySelector';
import { useCarrinho } from '../../contexts/CarrinhoContext';
import useMediaQuery from '../../hooks/useMediaQuery';
import styles from './Carrinho.module.css';

const DESKTOP_BREAKPOINT = '(min-width: 1024px)';

const Carrinho = () => {
  const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT);

  const {
    carrinho,
    removerItem,
    atualizarQuantidade,
    limparCarrinho,
    valorTotalFormatado,
    calcularPrecoTotalItem,
  } = useCarrinho();

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

  return (
    <Section id="carrinho" className={styles.carrinhoContent}>
      <div className="pageTitleContainer">
        <h2 style={{ textAlign: 'center' }}>Carrinho</h2>
      </div>
      <div className={styles.carrinhoGrid}>
        {/* LADO ESQUERDO: ITENS DO CARRINHO */}
        <div className={styles.itensCarrinhoBox}>
          {carrinho.map((item) => {
            const subtotalItem = calcularPrecoTotalItem(item);

            return (
              <div key={item.idItemCarrinhoLocal} className={styles.itemCarrinho}>
                <div className={styles.itemCarrinhoHeader}>
                  <div>
                    <h3>{item.nomeProduto}</h3>
                    {/* Descrição e Personalizações */}
                    {isDesktop && (
                      <p className={styles.itemCarrinhoDescription}>{item.descricaoProduto}</p>
                    )}
                    {item.modificadoresSelecionados &&
                      item.modificadoresSelecionados.length > 0 && (
                        <div className={styles.personalizacoesWrapper}>
                          <p style={{ fontWeight: 600 }}>Personalizações:</p>
                          <ul className={styles.personalizacoesList}>
                            {item.modificadoresSelecionados.map((mod, modIndex) => (
                              <li key={modIndex}>
                                {mod.nomeModificador}
                                {mod.valorAdicionalCobrado > 0 &&
                                  ` (+R$${mod.valorAdicionalCobrado.toFixed(2)})`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                  <div>
                    <img
                      src={item.imagemUrl}
                      alt={item.nomeProduto}
                      className={styles.itemImagem}
                    />
                  </div>
                </div>
                {/* CONTROLE DE QUANTIDADE E VISUALIZACAO DO PRECO DO ITEM */}
                <div className={styles.itemCarrinhoControls}>
                  <div className={styles.quantityRemoveGroup}>
                    <QuantitySelector
                      initialQuantity={item.qtdProduto}
                      onQuantityChange={(newQtd) =>
                        atualizarQuantidade(item.idItemCarrinhoLocal, newQtd)
                      }
                      min={1}
                    />
                    <button
                      type="button"
                      onClick={() => removerItem(item.idItemCarrinhoLocal)}
                      className={styles.removerItemButton}
                    >
                      <FaRegTrashAlt size={20} />
                    </button>
                  </div>
                  <span className={styles.itemCarrinhoPreco}>R${subtotalItem.toFixed(2)}</span>
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
                <h3>Tipo: Retirada</h3>
                <span className={styles.resumoHeaderIcon}>&#9998;</span> {/* Ícone de lápis */}
              </div>
            </div>
            <div className={styles.resumoHeader}>
              <div className={styles.resumoHeaderItem}>
                <h3>Local: Shopping Central</h3>
                <span className={styles.resumoHeaderIcon}>&#9998;</span> {/* Ícone de lápis */}
              </div>
            </div>
            <div className={styles.resumoDetalhes}>
              <div className={styles.resumoDetalhesItem}>
                <span>Subtotal</span>
                <span>R${valorTotalFormatado.replace('R$', '')}</span>{' '}
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
