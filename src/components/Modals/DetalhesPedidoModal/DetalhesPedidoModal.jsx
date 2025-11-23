import React from 'react';
import PropTypes from 'prop-types';
import { LuX, LuStore, LuShoppingBag, LuBan } from 'react-icons/lu';
import Button from '../../Button';
import styles from './DetalhesPedidoModal.module.css';
import shared from '../ModalShared.module.css';
import ModalWrapper from '../ModalWrapper';

const DetalhesPedidoModal = ({ pedido, onClose, onRepeatOrder, onCancelOrder }) => {
  if (!pedido) return null;

  const isCancelable = ['Pendente', 'Aguardando pagamento'].includes(pedido.status);

  return (
    // Uso do Wrapper com Render Prop
    <ModalWrapper onClose={onClose}>
      {({ requestClose }) => {
        // Função para fechar com animação (usada pelo botão X)
        const handleCloseAction = () => {
          requestClose();
        };

        // Função para ações que fecham o modal após executar (ex: cancelar/repetir)
        const handleAction = (actionFn) => {
          if (actionFn) actionFn(pedido);
          requestClose();
        };

        return (
          <>
            <div className={shared.modalHeader}>
              <h2 className={`${shared.modalTitle} ${styles.underlinedTitle}`}>
                Detalhes do Pedido
              </h2>

              <button className={shared.closeButton} onClick={handleCloseAction}>
                <LuX size={24} />
              </button>
            </div>

            <div className={shared.modalContent}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Data e hora:</span>
                  <span className={styles.value}>
                    {pedido.data} - {pedido.hora}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Observações:</span>
                  <span className={styles.value}>{pedido.observacoes || '- -'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Status:</span>
                  <span
                    className={styles.value}
                    style={{ color: pedido.status === 'Cancelado' ? '#ef4444' : 'inherit' }}
                  >
                    {pedido.status}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Cupom de desconto:</span>
                  <span className={styles.value}>{pedido.cupom || '- -'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Modo de entrega:</span>
                  <span className={styles.value}>{pedido.modoEntrega}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Preço base:</span>
                  <span className={styles.value}>{pedido.subtotal || pedido.total}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Loja responsável:</span>
                  <span className={styles.value}>
                    <LuStore size={14} style={{ marginRight: 4, display: 'inline' }} />
                    {pedido.loja || 'Restaurante Sabor na Nuvem - Taguatinga'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Preço cobrado:</span>
                  <span className={styles.value} style={{ fontWeight: 800 }}>
                    {pedido.total}
                  </span>
                </div>
              </div>

              <div className={styles.divider}>
                <span>Carrinho</span>
              </div>

              <div className={styles.productList}>
                {pedido.itens?.map((item, index) => (
                  <div key={index} className={styles.productItem}>
                    <div className={styles.productInfo}>
                      <h4 className={styles.productName}>{item.nome}</h4>
                      <p className={styles.productDesc}>{item.categoria}</p>

                      {item.personalizacoes && item.personalizacoes.length > 0 && (
                        <div className={styles.personalizacoes}>
                          <span className={styles.labelPersonalizacao}>Personalizações:</span>
                          <ul>
                            {item.personalizacoes.map((p, idx) => (
                              <li key={idx}>• {p}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className={styles.productActions}>
                      <div className={styles.qtdBadge}>Qtd: {item.quantidade}</div>
                      <span className={styles.productPrice}>{item.preco}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={shared.modalFooter}>
              {isCancelable ? (
                <Button
                  variant="primary"
                  className={styles.repeatButton}
                  onClick={() => handleAction(onCancelOrder)}
                  style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                >
                  <LuBan size={18} style={{ marginRight: 8 }} />
                  Cancelar Pedido
                </Button>
              ) : (
                <Button
                  variant="outline-red"
                  className={styles.repeatButton}
                  onClick={() => handleAction(onRepeatOrder)}
                >
                  <LuShoppingBag size={18} style={{ marginRight: 8 }} />
                  Adicionar itens ao carrinho
                </Button>
              )}
            </div>
          </>
        );
      }}
    </ModalWrapper>
  );
};

DetalhesPedidoModal.propTypes = {
  pedido: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onRepeatOrder: PropTypes.func.isRequired,
  onCancelOrder: PropTypes.func.isRequired,
};

export default DetalhesPedidoModal;
