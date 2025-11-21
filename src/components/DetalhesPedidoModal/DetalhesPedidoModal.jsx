import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { LuX, LuStore, LuShoppingBag } from 'react-icons/lu';
import Button from '../Button';
import styles from './DetalhesPedidoModal.module.css';

const DetalhesPedidoModal = ({ pedido, onClose, onRepeatOrder }) => {
  const [isClosing, setIsClosing] = useState(false);

  if (!pedido) return null;

  // Função intermediária para iniciar a animação de saída
  const handleClose = (e) => {
    if (e) e.stopPropagation();
    setIsClosing(true);
  };

  // Chamado quando a animação CSS termina
  const handleAnimationEnd = () => {
    if (isClosing) {
      onClose();
      setIsClosing(false);
    }
  };

  return (
    <div
      className={`${styles.overlay} ${isClosing ? styles.overlayClosing : ''}`}
      onClick={handleClose} // Clicar fora fecha com animação
      onAnimationEnd={handleAnimationEnd} // Escuta o fim da animação
    >
      <div
        className={`${styles.modalContainer} ${isClosing ? styles.modalContainerClosing : ''}`}
        onClick={(e) => e.stopPropagation()} // Impede que clique dentro feche
      >
        {/* Header do Modal */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Detalhes do Pedido</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            <LuX size={24} />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className={styles.modalContent}>
          {/* Seção de Informações Gerais (Grid) */}
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
              <span className={styles.value}>{pedido.status}</span>
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

          {/* Lista de Produtos */}
          <div className={styles.productList}>
            {pedido.itens && pedido.itens.length > 0 ? (
              pedido.itens.map((item, index) => (
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
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#999' }}>
                Itens não disponíveis para este pedido.
              </p>
            )}
          </div>
        </div>

        {/* Footer Fixo */}
        <div className={styles.modalFooter}>
          <Button
            variant="outline-red"
            className={styles.repeatButton}
            onClick={() => onRepeatOrder(pedido)}
          >
            <LuShoppingBag size={18} style={{ marginRight: 8 }} />
            Adicionar itens ao carrinho
          </Button>
        </div>
      </div>
    </div>
  );
};

DetalhesPedidoModal.propTypes = {
  pedido: PropTypes.shape({
    id: PropTypes.number.isRequired,
    data: PropTypes.string.isRequired,
    hora: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    modoEntrega: PropTypes.string.isRequired,
    observacoes: PropTypes.string,
    loja: PropTypes.string,
    cupom: PropTypes.string,
    subtotal: PropTypes.string,
    total: PropTypes.string.isRequired,
    itens: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        nome: PropTypes.string.isRequired,
        categoria: PropTypes.string,
        imagem: PropTypes.string,
        quantidade: PropTypes.number.isRequired,
        preco: PropTypes.string.isRequired,
        personalizacoes: PropTypes.arrayOf(PropTypes.string),
      })
    ),
  }),
  onClose: PropTypes.func.isRequired,
  onRepeatOrder: PropTypes.func.isRequired,
};

export default DetalhesPedidoModal;
