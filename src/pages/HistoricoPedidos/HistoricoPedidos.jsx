import React, { useEffect, useState } from 'react';
import { LuScrollText, LuFilter, LuListFilter } from 'react-icons/lu';
import Section from '../../components/Section';
import Button from '../../components/Button';
import DetalhesPedidoModal from '../../components/DetalhesPedidoModal';
import MOCK_PEDIDOS from '../../data/pedidos';
import styles from './HistoricoPedidos.module.css';

const HistoricoPedidos = () => {
  const [todosOsPedidos, setTodosOsPedidos] = useState([]);
  const [pedidosMostrados, setPedidosMostrados] = useState([]);

  // Estados dos Filtros
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [produtoBusca, setProdutoBusca] = useState('');

  // Estado do Modal
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

  // --- Helpers de Data (Para os filtros) ---
  const formatDateToISO = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDateBR = (dateString) => {
    if (!dateString) return new Date(0);
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
  };

  const parseDateISO = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
  };

  // Inicialização
  useEffect(() => {
    setTodosOsPedidos(MOCK_PEDIDOS);
    setPedidosMostrados(MOCK_PEDIDOS);

    const hoje = new Date();
    const inicioAno = new Date(2025, 0, 1);

    setDataInicio(formatDateToISO(inicioAno));
    setDataFim(formatDateToISO(hoje));
  }, []);

  // Lógica de Filtragem
  useEffect(() => {
    if (!dataInicio || !dataFim) return;

    const startDate = parseDateISO(dataInicio);
    startDate.setHours(0, 0, 0, 0);

    const endDate = parseDateISO(dataFim);
    endDate.setHours(23, 59, 59, 999);

    const filtrados = todosOsPedidos.filter((pedido) => {
      const pedidoDate = parseDateBR(pedido.data);

      // Filtro de Data
      const dentroDoPrazo = pedidoDate >= startDate && pedidoDate <= endDate;

      // Filtro de Produto (Busca em itens ou observações)
      const termo = produtoBusca.toLowerCase();
      const temProduto = pedido.itens?.some((item) => item.nome.toLowerCase().includes(termo));
      const temObs = (pedido.observacoes || '').toLowerCase().includes(termo);
      const correspondeBusca = !termo || temProduto || temObs;

      return dentroDoPrazo && correspondeBusca;
    });

    setPedidosMostrados(filtrados);
  }, [todosOsPedidos, dataInicio, dataFim, produtoBusca]);

  // --- Handlers do Modal ---
  const handleOpenDetails = (pedido) => {
    setPedidoSelecionado(pedido);
  };

  const handleCloseDetails = () => {
    setPedidoSelecionado(null);
  };

  const handleRepeatOrder = (pedido) => {
    // TODO: Conectar com CarrinhoContext
    // adicionarItensAoCarrinho(pedido.itens);
    // eslint-disable-next-line no-alert
    alert(`Adicionando ${pedido.itens.length} itens ao carrinho!`);
    handleCloseDetails();
  };

  return (
    <Section>
      <div className={styles.pageContainer}>
        <div className={styles.card}>
          {/* HEADER */}
          <div className={styles.cardHeader}>
            <LuScrollText size={32} className={styles.headerIcon} strokeWidth={1.5} />
            <h1 className={styles.cardTitle}>Histórico de Pedidos</h1>
            <p className={styles.cardSubtitle}>
              Veja o status, filtre e repita seus pedidos facilmente!
            </p>
          </div>

          {/* BARRA DE FILTROS */}
          <div className={styles.filterSection}>
            <div className={styles.filterLabelContainer}>
              <LuFilter size={20} className={styles.filterIcon} />
              <span className={styles.filterLabelText}>Filtros:</span>
            </div>

            <div className={styles.filterInputsGroup}>
              {/* Filtro de Data */}
              <div className={styles.dateFilterBlock}>
                <span className={styles.inputLabel}>Intervalo de datas</span>
                <div className={styles.dateInputsWrapper}>
                  <div className={styles.inputWithIcon}>
                    <input
                      type="date"
                      className={styles.dateInput}
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                    />
                  </div>
                  <span className={styles.dateSeparator}>até</span>
                  <div className={styles.inputWithIcon}>
                    <input
                      type="date"
                      className={styles.dateInput}
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Filtro de Produto */}
              <div className={styles.productFilterBlock}>
                <span className={styles.inputLabel}>Produto</span>
                <div className={styles.inputWithIcon}>
                  <input
                    type="text"
                    placeholder="Buscar produto..."
                    className={styles.productInput}
                    value={produtoBusca}
                    onChange={(e) => setProdutoBusca(e.target.value)}
                  />
                  <LuListFilter size={18} className={styles.inputIconRight} />
                </div>
              </div>
            </div>
          </div>

          {/* LISTA DE PEDIDOS */}
          <div className={styles.ordersGrid}>
            {pedidosMostrados.length > 0 ? (
              pedidosMostrados.map((pedido) => (
                <div key={pedido.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <span className={styles.orderDate}>
                      {pedido.data} - {pedido.hora}
                    </span>
                  </div>

                  <div className={styles.orderBody}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Status:</span>
                      <ul className={styles.infoList}>
                        <li>{pedido.status}</li>
                      </ul>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Modo de entrega:</span>
                      <ul className={styles.infoList}>
                        <li>{pedido.modoEntrega}</li>
                      </ul>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Observações:</span>
                      <ul className={styles.infoList}>
                        <li>{pedido.observacoes}</li>
                      </ul>
                    </div>
                  </div>

                  <div className={styles.orderFooter}>
                    <span className={styles.orderTotal}>{pedido.total}</span>

                    {/* Botão que abre o Modal */}
                    <Button
                      variant="outline-yellow"
                      className={styles.detailsButton}
                      onClick={() => handleOpenDetails(pedido)}
                    >
                      Detalhes
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '40px',
                  color: '#666',
                }}
              >
                <p>Nenhum pedido encontrado neste período.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RENDERIZAÇÃO DO MODAL */}
      {pedidoSelecionado && (
        <DetalhesPedidoModal
          pedido={pedidoSelecionado}
          onClose={handleCloseDetails}
          onRepeatOrder={handleRepeatOrder}
        />
      )}
    </Section>
  );
};

export default HistoricoPedidos;
