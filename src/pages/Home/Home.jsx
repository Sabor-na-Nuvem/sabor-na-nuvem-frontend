import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Section from '../../components/Section';
import Button from '../../components/Button';
import imagemCards from '../../assets/placeholder-small.png';
import useMediaQuery from '../../hooks/useMediaQuery';
import styles from './Home.module.css';
import { buscarCategoriaPorNome, listarProdutosPorCategoria } from '../../services/produto.service';
import { useCarrinho } from '../../contexts/CarrinhoContext';
import ConfirmModal from '../../components/Modals/ConfirmModal';

const DESKTOP_BREAKPOINT = '(min-width: 1024px)';

const Home = () => {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT);
  const { carrinhoInfo, atualizarInfoCarrinho } = useCarrinho();

  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipoPedidoModalOpen, setTipoPedidoModalOpen] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      try {
        const categoria = await buscarCategoriaPorNome('Destaques do Dia');

        const listaProdutos = await listarProdutosPorCategoria(categoria.id);

        setProdutos(listaProdutos);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const openTipoPedidoModal = () => setTipoPedidoModalOpen(true);
  const closeTipoPedidoModal = () => setTipoPedidoModalOpen(false);

  const handleSelectEntrega = async () => {
    await atualizarInfoCarrinho({ ...carrinhoInfo, tipo: 'ENTREGA' });
    openTipoPedidoModal();
  };

  const handleSelectRetirada = async () => {
    await atualizarInfoCarrinho({ ...carrinhoInfo, tipo: 'RETIRADA' });
    openTipoPedidoModal();
  };

  const handleIrParaCardapio = () => {
    navigate('/cardapio');
  };

  return (
    <Section id="home">
      <div>
        {/* HERO */}
        <div className={styles.topContainer}>
          <div className={styles.contentBlock}>
            <div className={styles.innerLeftTopContainer}>
              <h1 className={isDesktop ? 'text-left' : 'text-center'}>Um sabor inesquecível...</h1>
              <div>
                <p className={isDesktop ? 'text-left' : 'text-center'}>
                  Como você quer pedir hoje?
                </p>
                <div className={styles.buttonContainer}>
                  <Button variant="primary" onClick={handleSelectEntrega}>
                    Delivery
                  </Button>
                  <Button variant="outline-red" onClick={handleSelectRetirada}>
                    Retirar na Loja
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.imageBlock}>
            <img
              src={
                'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1000&auto=format&fit=crop'
              }
              className={styles.imagemPrincipal}
            />
          </div>
        </div>

        {/* CARDAPIO */}
        <div className={styles.cardapioContainer}>
          <h2>Confira nosso...</h2>
          <Button
            variant="outline-yellow"
            className={styles.cardapioButton}
            onClick={() => navigate('/cardapio')}
          >
            Cardápio
          </Button>
        </div>
      </div>

      {/* DESTAQUES DO DIA */}
      <div className={styles.bottomContainer}>
        <div style={{ textAlign: 'center' }}>
          <p>Ou talvez esteja afim dos</p>
          <h3>Destaques do Dia?</h3>
        </div>
        <div className={styles.destaquesContainer}>
          {!loading ? (
            produtos.map((produto) => (
              <div
                key={produto.id}
                onClick={() => navigate(`/detalhes-produto/${produto.id}`)}
                className={styles.destaquesCard}
              >
                <div className={styles.destaquesText}>
                  <h4>{produto.nome}</h4>
                  <p>{produto.descricao}</p>
                </div>
                <img src={produto.imagemUrl || imagemCards} className={styles.destaquesImagem} />
              </div>
            ))
          ) : (
            <div style={{ width: '100%', textAlign: 'center' }}>Carregando...</div>
          )}
        </div>
      </div>

      {tipoPedidoModalOpen && (
        <ConfirmModal
          title="Tipo de Pedido"
          description={
            <>
              <br />
              Você escolheu <br />
              {carrinhoInfo.tipo === 'RETIRADA' ? (
                <>
                  <strong>retirar seu pedido na loja!</strong>
                </>
              ) : (
                <>
                  <strong>receber seu pedido em casa!</strong>
                </>
              )}
              <br />
              <br />
              Você pode alterar essa opção quando quiser!
            </>
          }
          confirmText="Ir para o cardápio"
          cancelText="Continuar na página atual"
          variant="primary"
          onConfirm={handleIrParaCardapio}
          onCancel={() => {}}
          onClose={closeTipoPedidoModal}
        />
      )}
    </Section>
  );
};

export default Home;
