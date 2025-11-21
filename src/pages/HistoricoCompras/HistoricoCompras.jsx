import React, { useEffect, useState } from 'react';
import { LuScrollText, LuFilter, LuListFilter } from 'react-icons/lu';
import Section from '../../components/Section';
import Button from '../../components/Button';
import MOCK_PEDIDOS from '../../data/pedidos';
import styles from './HistoricoCompras.module.css';
import useMediaQuery from '../../hooks/useMediaQuery';

const FILTER_BREAKPOINT = '(min-width: 768px)';

const HistoricoCompras = () => {
  const isDesktop = useMediaQuery(FILTER_BREAKPOINT);

  const [todosOsPedidos, setTodosOsPedidos] = useState([]);
  const [pedidosMostrados, setPedidosMostrados] = useState([]);

  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [produtoBusca, setProdutoBusca] = useState('');

  // Helper: Converte Objeto Date para string 'YYYY-MM-DD' (Data Local)
  const formatDateToISO = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper: Converte string 'dd/mm/aaaa' (Mock) para Objeto Date
  const parseDateBR = (dateString) => {
    if (!dateString) return new Date(0);
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
  };

  // Helper: Converte string 'yyyy-mm-dd' (Input) para Objeto Date (Local)
  const parseDateISO = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
  };

  useEffect(() => {
    setTodosOsPedidos(MOCK_PEDIDOS);
    setPedidosMostrados(MOCK_PEDIDOS);

    const inicio = new Date(2025, 0, 1);
    const hoje = new Date();

    setDataInicio(formatDateToISO(inicio));
    setDataFim(formatDateToISO(hoje));
  }, []);

  useEffect(() => {
    if (!dataInicio || !dataFim) return;
    const startDate = parseDateISO(dataInicio);
    startDate.setHours(0, 0, 0, 0);

    const endDate = parseDateISO(dataFim);
    endDate.setHours(23, 59, 59, 999);

    const filtrados = todosOsPedidos.filter((pedido) => {
      const pedidoDate = parseDateBR(pedido.data);
      const dentroDoPrazo = pedidoDate >= startDate && pedidoDate <= endDate;

      return dentroDoPrazo;
    });

    setPedidosMostrados(filtrados);
  }, [todosOsPedidos, dataInicio, dataFim]);

  return (
    <Section>
      <div className={styles.infoContainer}>
        <div className={styles.contentBlock}>
          <div className={styles.topContent}>
            <div className={styles.title}>
              <LuScrollText size={30} className={styles.headerIcon} strokeWidth={1.5} />
              <h3>Histórico de compras</h3>
            </div>
            <p style={{ fontSize: '0.9rem' }}>
              Veja o status, filtre e repita seus pedidos facilmente!
            </p>
          </div>

          {/* BARRA DE FILTROS */}
          <div style={{ padding: '20px', paddingBottom: '0px' }}>
            <div className={styles.filterSection}>
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

                <div
                  className={styles.filterLabelContainer}
                  style={isDesktop ? {} : { order: '-1' }}
                >
                  <LuFilter size={20} />
                  <span className={styles.filterLabelText}>Filtros</span>
                </div>

                {/* Filtro de Produto */}
                <div className={styles.productFilterBlock}>
                  <span className={styles.inputLabel}>Produto</span>
                  <div className={styles.inputWithIcon}>
                    <input
                      type="text"
                      placeholder="Escolher produto..."
                      className={styles.productInput}
                      value={produtoBusca}
                      onChange={(e) => setProdutoBusca(e.target.value)}
                    />
                    <LuListFilter size={18} className={styles.inputIconRight} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* GRID DE PEDIDOS */}
          <div className={styles.ordersGrid}>
            {pedidosMostrados.map((pedido) => (
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
                  <Button variant="outline-yellow" className={styles.detailsButton}>
                    Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default HistoricoCompras;
