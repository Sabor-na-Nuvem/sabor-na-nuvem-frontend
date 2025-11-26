/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { LuX, LuStore, LuBan, LuReceipt, LuMapPin } from 'react-icons/lu';
import Button from '../../Button';
import styles from './DetalhesPedidoModal.module.css';
import shared from '../ModalShared.module.css';
import ModalWrapper from '../ModalWrapper';

// Importações necessárias para formatar os dados
import { buscarMeuPedidoPorId } from '../../../services/pedido.service';
import { formatCurrency } from '../../../utils/produtoUtils';
import { formatAddress } from '../../../utils/enderecoUtils';

const DetalhesPedidoModal = ({ pedido: pedidoResumo, onClose, onRepeatOrder, onCancelOrder }) => {
  // Estado para guardar os dados COMPLETOS que vêm do backend
  const [detalhes, setDetalhes] = useState(null);
  const [loading, setLoading] = useState(true);

  // Busca os dados detalhados ao abrir
  useEffect(() => {
    const carregarDetalhes = async () => {
      if (!pedidoResumo?.id) return;
      setLoading(true);
      try {
        const dados = await buscarMeuPedidoPorId(pedidoResumo.id);
        setDetalhes(dados);
      } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
      } finally {
        setLoading(false);
      }
    };
    carregarDetalhes();
  }, [pedidoResumo]);

  const calcularPrecoTotalItem = (item) => {
    let total = Number(item.valorUnitarioProduto);

    if (item.modificadoresSelecionados) {
      item.modificadoresSelecionados.forEach((mod) => {
        total += Number(mod.valorAdicionalCobrado || 0);
      });
    }

    return total;
  };

  if (!pedidoResumo) return null;

  // Determina se pode cancelar com base no status (Backend: PENDENTE ou AGUARDANDO_PAGAMENTO)
  // Usamos 'detalhes' se disponível, senão o resumo
  const statusAtual = detalhes?.status || pedidoResumo.status;
  const isCancelable = ['PENDENTE', 'AGUARDANDO_PAGAMENTO'].includes(statusAtual);

  // Helpers de formatação de data
  const formatarDataHora = (isoString) => {
    if (!isoString) return '-';
    const data = new Date(isoString);
    return `${data.toLocaleDateString()} - ${data.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <ModalWrapper onClose={onClose} containerClassName={styles.modalContainer}>
      {({ requestClose }) => {
        const handleCloseAction = () => {
          requestClose();
        };

        const handleAction = (actionFn) => {
          if (actionFn) actionFn(detalhes || pedidoResumo); // Passa o objeto completo
          requestClose();
        };

        return (
          <>
            <div className={shared.modalHeader}>
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <span className={`${shared.modalSubTitle}`}>#{pedidoResumo.id}</span>
                <h2 className={`${shared.modalTitle} ${styles.underlinedTitle}`}>
                  Detalhes do Pedido
                </h2>
              </div>
              <button className={shared.closeButton} onClick={handleCloseAction}>
                <LuX size={24} />
              </button>
            </div>

            <div className={shared.modalContent}>
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>Carregando detalhes...</div>
              ) : !detalhes ? (
                <div style={{ padding: '20px', color: 'red' }}>Erro ao carregar pedido.</div>
              ) : (
                <>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Data e hora:</span>
                      <span className={styles.value}>{formatarDataHora(detalhes.dataHora)}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Observações:</span>
                      <span className={styles.value}>{detalhes.observacoes || '- -'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Status:</span>
                      <span
                        className={styles.value}
                        style={{ color: detalhes.status === 'CANCELADO' ? '#ef4444' : 'inherit' }}
                      >
                        {detalhes.status}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Cupom de desconto:</span>
                      {/* Backend retorna objeto cupom: { codCupom: "..." } */}
                      <span className={styles.value}>{detalhes.cupom?.codCupom || '- -'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Modo de entrega:</span>
                      {/* Backend retorna campo 'tipo' (ENTREGA/RETIRADA) */}
                      <span className={styles.value}>{detalhes.tipo}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Preço base:</span>
                      {/* Backend retorna 'valorBase' */}
                      <span className={styles.value}>
                        {formatCurrency(Number(detalhes.valorBase))}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Loja responsável:</span>
                      <span className={styles.value}>
                        <LuStore size={14} style={{ marginRight: 4, display: 'inline' }} />
                        {detalhes.loja?.nome}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Preço cobrado:</span>
                      <span className={styles.value} style={{ fontWeight: 800 }}>
                        {/* Backend retorna 'valorCobrado' */}
                        {formatCurrency(Number(detalhes.valorCobrado))}
                      </span>
                    </div>
                  </div>

                  {/* Seção de Endereço (Snapshot) */}
                  {detalhes.endereco && (
                    <div
                      className={styles.infoItem}
                      style={{ marginTop: '15px', gridColumn: '1 / -1' }}
                    >
                      <span
                        className={styles.label}
                        style={{ display: 'block', marginBottom: '5px' }}
                      >
                        <LuMapPin size={14} style={{ marginRight: 4, display: 'inline' }} />
                        Endereço de Entrega:
                      </span>
                      <span
                        className={styles.value}
                        style={{
                          background: '#f9fafb',
                          padding: '8px',
                          borderRadius: '6px',
                          display: 'block',
                        }}
                      >
                        {formatAddress(detalhes.endereco)}
                      </span>
                    </div>
                  )}

                  <div className={styles.divider}>
                    <span>Itens</span>
                  </div>

                  <div className={styles.productList}>
                    {/* Backend retorna 'itensNoPedido' */}
                    {detalhes.itensNoPedido?.map((item) => (
                      <div key={item.id} className={styles.productItem}>
                        <div className={styles.productInfo}>
                          {/* Dados do produto estão aninhados em 'item.produto' */}
                          <h4 className={styles.productName}>{item.produto?.nome}</h4>
                          <p className={styles.productDesc}>{item.produto?.categoria?.nome}</p>

                          {/* Modificadores estão em 'item.modificadoresSelecionados' */}
                          {item.modificadoresSelecionados &&
                            item.modificadoresSelecionados.length > 0 && (
                              <div className={styles.personalizacoes}>
                                <span className={styles.labelPersonalizacao}>Personalizações:</span>
                                <ul>
                                  {item.modificadoresSelecionados.map((modWrapper, idx) => (
                                    <li key={idx}>
                                      • {modWrapper.modificador?.nome}
                                      {Number(modWrapper.valorAdicionalCobrado) > 0 &&
                                        ` (+${formatCurrency(Number(modWrapper.valorAdicionalCobrado))})`}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </div>
                        <div className={styles.productActions}>
                          <div className={styles.qtdBadge}>Qtd: {item.qtdProduto}</div>
                          <div className={styles.produtoPriceContainer}>
                            <span className={styles.produtoPriceLabel}>Preço Unitário:</span>
                            <span className={styles.productPrice}>
                              {formatCurrency(calcularPrecoTotalItem(item))}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className={shared.modalFooter}>
              <div
                style={{ display: 'flex', width: '100%', gap: '10px', justifyContent: 'flex-end' }}
              >
                {isCancelable && (
                  <Button
                    variant="primary"
                    className={styles.repeatButton}
                    onClick={() => handleAction(onCancelOrder)}
                    style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', flex: 1 }}
                  >
                    <LuBan size={18} style={{ marginRight: 8, flexShrink: 0 }} />
                    Cancelar
                  </Button>
                )}

                <Button
                  variant="outline-red"
                  className={styles.repeatButton}
                  onClick={() => handleAction(onRepeatOrder)}
                  disabled={loading || !detalhes}
                  style={{ flex: 1 }}
                >
                  <LuReceipt size={18} style={{ marginRight: 8, flexShrink: 0 }} />
                  Repetir Pedido
                </Button>
              </div>
            </div>
          </>
        );
      }}
    </ModalWrapper>
  );
};

DetalhesPedidoModal.propTypes = {
  pedido: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onRepeatOrder: PropTypes.func.isRequired,
  onCancelOrder: PropTypes.func.isRequired,
};

export default DetalhesPedidoModal;
