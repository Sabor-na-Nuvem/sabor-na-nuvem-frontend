import React, { useEffect, useState } from 'react';
import { LuScrollText, LuFilter, LuListFilter } from 'react-icons/lu';
import Section from '../../components/Section';
import Button from '../../components/Button';
import DetalhesPedidoModal from '../../components/Modals/DetalhesPedidoModal';
import AlertModal from '../../components/Modals/AlertModal';
import ConfirmModal from '../../components/Modals/ConfirmModal';
import styles from './HistoricoPedidos.module.css';
import { useCarrinho } from '../../contexts/CarrinhoContext';

// Serviços
import {
  listarMeusPedidos,
  cancelarMeuPedido,
  adicionarItensDoPedidoAoCarrinho,
} from '../../services/pedido.service';
import { formatCurrency } from '../../utils/produtoUtils';

const HistoricoPedidos = () => {
  const { limparCarrinho, refreshCarrinho } = useCarrinho();

  const [todosOsPedidos, setTodosOsPedidos] = useState([]);
  const [pedidosMostrados, setPedidosMostrados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados dos Filtros
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [produtoBusca, setProdutoBusca] = useState('');

  // Estado do Modal de Detalhes
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

  // Estado do AlertModal
  const [alertInfo, setAlertInfo] = useState({
    isOpen: false,
    title: '',
    msg: '',
    type: 'primary',
  });

  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [pedidoParaCancelar, setPedidoParaCancelar] = useState(null);

  // Helper para mostrar alertas
  const showAlert = (title, msg, type = 'primary') => {
    setAlertInfo({ isOpen: true, title, msg, type });
  };

  const closeAlert = () => {
    setAlertInfo((prev) => ({ ...prev, isOpen: false }));
  };

  // --- Helpers de Data ---
  const formatDateToISO = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDataHoraBR = (dataISO) => {
    if (!dataISO) return '-';
    return new Date(dataISO).toLocaleString('pt-BR');
  };

  const parseDateISO = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
  };

  // --- 1. CARREGAR PEDIDOS DO BACKEND ---
  useEffect(() => {
    const fetchPedidos = async () => {
      setIsLoading(true);
      try {
        const response = await listarMeusPedidos();
        const dados = response.data;
        // O backend retorna array direto ou objeto? Ajuste se necessário.
        // Assumindo que retorna array de pedidos
        const lista = Array.isArray(dados) ? dados : dados.pedidos || [];

        setTodosOsPedidos(lista);
        setPedidosMostrados(lista);
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        showAlert('Erro', 'Não foi possível carregar seu histórico.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPedidos();

    // Define datas iniciais para o filtro visual
    const hoje = new Date();
    const inicioAno = new Date(2025, 0, 1); // Ou uma data arbitrária no passado
    setDataInicio(formatDateToISO(inicioAno));
    setDataFim(formatDateToISO(hoje));
  }, []);

  // --- 2. FILTRAGEM LOCAL ---
  useEffect(() => {
    if (!dataInicio || !dataFim) return;

    const startDate = parseDateISO(dataInicio);
    startDate.setHours(0, 0, 0, 0);

    const endDate = parseDateISO(dataFim);
    endDate.setHours(23, 59, 59, 999);

    const filtrados = todosOsPedidos.filter((pedido) => {
      const pedidoDate = new Date(pedido.createdAt); // Usa o campo do Prisma
      const dentroDoPrazo = pedidoDate >= startDate && pedidoDate <= endDate;

      const termo = produtoBusca.toLowerCase();
      // Ajuste: O Prisma retorna itensNoPedido -> produto -> nome
      const temProduto = pedido.itensNoPedido?.some((item) =>
        item.produto.nome.toLowerCase().includes(termo)
      );
      const temObs = (pedido.observacoes || '').toLowerCase().includes(termo);

      const correspondeBusca = !termo || temProduto || temObs;
      return dentroDoPrazo && correspondeBusca;
    });

    setPedidosMostrados(filtrados);
  }, [todosOsPedidos, dataInicio, dataFim, produtoBusca]);

  // --- Handlers ---

  const handleOpenDetails = (pedido) => {
    setPedidoSelecionado(pedido);
  };

  const handleCloseDetails = () => {
    setPedidoSelecionado(null);
  };

  // --- LÓGICA DE REPETIR PEDIDO ---
  const handleRepeatOrder = async (pedido) => {
    handleCloseDetails();

    try {
      // 1. Limpa o carrinho atual para evitar mistura de lojas
      await limparCarrinho();

      // 2. Chama o backend para copiar os itens
      const response = await adicionarItensDoPedidoAoCarrinho(pedido.id);
      const resultado = response.data;

      // 3. Atualiza o contexto do carrinho com o resultado (novos itens)
      if (resultado.carrinho) {
        showAlert(
          'Sucesso!',
          `Os itens do pedido #${pedido.id} foram adicionados ao carrinho.`,
          'success'
        );
        await refreshCarrinho();
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Erro ao repetir pedido.';
      showAlert('Erro', msg, 'error');
    }
  };

  // Solicita o cancelamento (Abre o modal)
  const handleCancelOrder = (pedido) => {
    setPedidoParaCancelar(pedido);
    setConfirmCancelOpen(true);
  };

  // Confirma e executa o cancelamento
  const finalizarCancelamento = async () => {
    if (!pedidoParaCancelar) return;

    try {
      // Chama API
      await cancelarMeuPedido(pedidoParaCancelar.id);

      // Atualiza listas locais para refletir a mudança imediatamente
      const atualizarLista = (lista) =>
        lista.map((p) => (p.id === pedidoParaCancelar.id ? { ...p, status: 'CANCELADO' } : p));

      setTodosOsPedidos((prev) => atualizarLista(prev));

      // Se o modal de detalhes estiver aberto, atualiza ele também
      if (pedidoSelecionado && pedidoSelecionado.id === pedidoParaCancelar.id) {
        setPedidoSelecionado((prev) => ({ ...prev, status: 'CANCELADO' }));
      }

      showAlert('Cancelado', 'Pedido cancelado com sucesso.', 'success');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Não foi possível cancelar o pedido.';
      showAlert('Erro', msg, 'error');
    } finally {
      setConfirmCancelOpen(false);
      setPedidoParaCancelar(null);
    }
  };

  const abortarCancelamento = () => {
    setConfirmCancelOpen(false);
    setPedidoParaCancelar(null);
  };

  if (isLoading) {
    return (
      <Section>
        <div style={{ textAlign: 'center', padding: '4rem' }}>Carregando histórico...</div>
      </Section>
    );
  }

  return (
    <Section>
      <div className={styles.pageContainer}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <LuScrollText size={32} className={styles.headerIcon} strokeWidth={1.5} />
            <h1 className={styles.cardTitle}>Histórico de Pedidos</h1>
            <p className={styles.cardSubtitle}>
              Veja o status, filtre e repita seus pedidos facilmente!
            </p>
          </div>

          <div className={styles.filterSection}>
            {/* ... Filtros mantidos iguais ... */}
            <div className={styles.filterLabelContainer}>
              <LuFilter size={20} className={styles.filterIcon} />
              <span className={styles.filterLabelText}>Filtros:</span>
            </div>
            <div className={styles.filterInputsGroup}>
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

          <div className={styles.ordersGrid}>
            {pedidosMostrados.length > 0 ? (
              pedidosMostrados.map((pedido) => (
                <div key={pedido.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <span className={styles.orderDate}>
                      {/* Formata a data vinda do Prisma */}
                      {formatDataHoraBR(pedido.createdAt)}
                    </span>
                    {/* Opcional: Mostrar ID do pedido */}
                    <span style={{ fontSize: '0.8em', color: '#888' }}>#{pedido.id}</span>
                  </div>
                  <div className={styles.orderBody}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Status:</span>
                      <ul className={styles.infoList}>
                        <li>{pedido.status}</li>
                      </ul>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Loja:</span>
                      <ul className={styles.infoList}>
                        <li>{pedido.loja?.nome}</li>
                      </ul>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Modo de entrega:</span>
                      <ul className={styles.infoList}>
                        <li>{pedido.tipo}</li>
                      </ul>
                    </div>
                    {pedido.observacoes && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Observações:</span>
                        <ul className={styles.infoList}>
                          <li>{pedido.observacoes}</li>
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className={styles.orderFooter}>
                    <span className={styles.orderTotal}>
                      {formatCurrency(Number(pedido.valorCobrado))}
                    </span>
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

      {/* MODAIS */}

      {pedidoSelecionado && (
        <DetalhesPedidoModal
          pedido={pedidoSelecionado}
          onClose={handleCloseDetails}
          onRepeatOrder={handleRepeatOrder}
          onCancelOrder={handleCancelOrder}
        />
      )}

      {confirmCancelOpen && (
        <ConfirmModal
          title="Cancelar Pedido"
          description={
            <>
              Tem certeza que deseja cancelar o pedido <strong>#{pedidoParaCancelar?.id}</strong>?
              <br />
              <br />
              Esta ação não poderá ser desfeita.
            </>
          }
          confirmText="Sim, cancelar"
          cancelText="Voltar"
          variant="primary" // Botão vermelho de perigo
          onConfirm={finalizarCancelamento}
          onCancel={() => {}}
          onClose={abortarCancelamento}
        />
      )}

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

export default HistoricoPedidos;
