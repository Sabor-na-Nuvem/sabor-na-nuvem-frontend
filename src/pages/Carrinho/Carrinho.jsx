/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaRegTrashAlt, FaStore, FaTruck } from 'react-icons/fa';
import { LuPencilLine, LuInfo } from 'react-icons/lu';
import useMediaQuery from '../../hooks/useMediaQuery';
import placeholderImage from '../../assets/placeholder-small.png';
// --- IMPORTS DOS COMPONENTES ---
import Section from '../../components/Section';
import Button from '../../components/Button';
import QuantitySelector from '../../components/QuantitySelector';
// --- IMPORTS DOS UTILS ---
import { formatCurrency } from '../../utils/produtoUtils';
import { formatAddress } from '../../utils/enderecoUtils';
// --- IMPORTS DOS CONTEXTS ---
import { useAuth } from '../../contexts/AuthContext';
import { useCarrinho } from '../../contexts/CarrinhoContext';
// --- IMPORTS DOS SERVICES ---
import { criarPedido } from '../../services/pedido.service';
import { buscarLojaPorId } from '../../services/loja.service';
import { atualizarEndereco, criarEndereco } from '../../services/usuario.service';
// --- IMPORTS DOS MODAIS ---
import ConfirmModal from '../../components/Modals/ConfirmModal';
import EnderecoModal from '../../components/Modals/EnderecoModal';
import ConfirmarEnderecoFinalModal from '../../components/Modals/ConfirmarEnderecoModal/ConfirmarEnderecoFinalModal';
import AlertModal from '../../components/Modals/AlertModal';
// --- IMPORTS DO ESTILO ---
import styles from './Carrinho.module.css';

const DESKTOP_BREAKPOINT = '(min-width: 1024px)';

const Carrinho = () => {
  const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT);
  const { user, updateUser, refreshUser } = useAuth();

  const {
    carrinho,
    carrinhoInfo,
    loadingCarrinho,
    removerItem,
    atualizarQuantidade,
    atualizarInfoCarrinho,
    limparCarrinho,
    valorTotalFormatado,
    calcularPrecoTotalItem,
  } = useCarrinho();

  // --- ESTADOS DOS MODAIS ---
  const [tipoPedidoModalOpen, setTipoPedidoModalOpen] = useState(false);
  const [addressPromptOpen, setAddressPromptOpen] = useState(false);
  const [enderecoModalOpen, setEnderecoModalOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);

  // Estados de dados temporários para o fluxo de endereço
  const [tempEndereco, setTempEndereco] = useState(null);

  // Estados para controlar o comportamento do mapa
  const [mapReadOnly, setMapReadOnly] = useState(false);
  const [mapTitle, setMapTitle] = useState('Confirme a localização');
  const [isStoreAddress, setIsStoreAddress] = useState(false);

  // Estado de Loading do Botão de Pedido
  const [isSubmittingPedido, setIsSubmittingPedido] = useState(false);

  const [alertInfo, setAlertInfo] = useState({
    isOpen: false,
    title: '',
    msg: '',
    type: 'success',
  });

  const isCartEmpty = carrinho.length === 0;

  const closeAlert = () => setAlertInfo((prev) => ({ ...prev, isOpen: false }));

  // --- LÓGICA DE TIPOS DE PEDIDO ---
  const openTipoPedidoModal = () => setTipoPedidoModalOpen(true);
  const closeTipoPedidoModal = () => setTipoPedidoModalOpen(false);

  const handleSelectEntrega = async () => {
    await atualizarInfoCarrinho({ ...carrinhoInfo, tipo: 'ENTREGA' });
    setTipoPedidoModalOpen(false);
  };

  const handleSelectRetirada = async () => {
    await atualizarInfoCarrinho({ ...carrinhoInfo, tipo: 'RETIRADA' });
    setTipoPedidoModalOpen(false);
  };

  // --- LÓGICA DE ENDEREÇO E CLICK NO LOCAL ---

  const getEnderecoAtual = () => {
    if (user?.endereco) return user.endereco;
    return carrinhoInfo?.enderecoEntrega || null;
  };

  const handleLocalClick = async () => {
    // CASO 1: RETIRADA (Buscar loja e mostrar)
    if (carrinhoInfo?.tipo === 'RETIRADA') {
      if (!carrinhoInfo.lojaId) return; // Segurança

      try {
        // Busca dados completos da loja (incluindo endereço)
        const { data: lojaData } = await buscarLojaPorId(carrinhoInfo.lojaId);

        if (lojaData && lojaData.endereco) {
          setTempEndereco(lojaData.endereco);
          setMapReadOnly(true);
          setMapTitle(`Local de Retirada - ${lojaData.nome}`);
          setIsStoreAddress(true);
          setMapModalOpen(true);
        }
      } catch (error) {
        console.error('Erro ao buscar endereço da loja', error);
        setAlertInfo({
          isOpen: true,
          title: 'Erro',
          msg: 'Não foi possível carregar o endereço da loja.',
          type: 'error',
        });
      }
      return;
    }

    // CASO 2: ENTREGA (Endereço do usuário)
    const endereco = getEnderecoAtual();

    if (!endereco) {
      // Sem endereço -> Pergunta se quer cadastrar
      setAddressPromptOpen(true);
    } else {
      // Com endereço -> Mostra mapa (ReadOnly mas com opção de editar)
      setTempEndereco(endereco);
      setMapReadOnly(true);
      setMapTitle('Endereço de Entrega');
      setIsStoreAddress(false);
      setMapModalOpen(true);
    }
  };

  // --- FLUXO DE CADASTRO/EDIÇÃO DE ENDEREÇO ---

  const handlePromptRetirar = async () => {
    await atualizarInfoCarrinho({ ...carrinhoInfo, tipo: 'RETIRADA' });
    setAddressPromptOpen(false);
  };

  const handlePromptCadastrar = () => {
    setAddressPromptOpen(false);
    setTempEndereco(null);
    setEnderecoModalOpen(true);
  };

  // Botão "Editar Endereço" dentro do modal de mapa
  const handleEditExistingAddress = () => {
    setMapModalOpen(false);
    setEnderecoModalOpen(true);
  };

  // Salvar vindo do formulário
  const handleSaveEnderecoForm = (dadosEndereco) => {
    setTempEndereco(dadosEndereco);
    setEnderecoModalOpen(false);
    // Abre o mapa para confirmação FINAL
    setMapReadOnly(false);
    setMapTitle('Confirme a localização exata');
    setIsStoreAddress(false);
    setTimeout(() => setMapModalOpen(true), 300);
  };

  // Confirmação final no Mapa
  const handleConfirmEnderecoMap = async (enderecoFinal) => {
    // Se for apenas visualização (loja ou endereço já salvo), só fecha
    if (mapReadOnly) {
      setMapModalOpen(false);
      return;
    }

    // Se for edição (mapReadOnly = false), salva no backend
    try {
      const enderecoSanitizado = {
        ...enderecoFinal,
        estado: enderecoFinal.estado ? enderecoFinal.estado.toUpperCase() : '',
      };

      if (user) {
        // Lógica com usuário logado
        if (user.endereco && user.endereco.id) {
          await atualizarEndereco(user.id, enderecoSanitizado);
        } else {
          await criarEndereco(user.id, enderecoSanitizado);
        }
        if (refreshUser) await refreshUser();
        else await updateUser({ endereco: enderecoSanitizado });
      } else {
        // Lógica com usuário anônimo
        await atualizarInfoCarrinho({ ...carrinhoInfo, enderecoEntrega: enderecoSanitizado });
      }

      setMapModalOpen(false);
      setAlertInfo({
        isOpen: true,
        title: 'Endereço Atualizado!',
        msg: 'Local de entrega salvo com sucesso.',
        type: 'success',
      });
    } catch (error) {
      console.error(error);
      setAlertInfo({
        isOpen: true,
        title: 'Erro',
        msg: 'Falha ao salvar endereço.',
        type: 'error',
      });
    }
  };

  // --- LÓGICA DE REALIZAR PEDIDO (CHECKOUT) ---
  const handleRealizarPedido = async () => {
    const enderecoEntrega = getEnderecoAtual();

    // Validação de Endereço para Entrega
    if (carrinhoInfo?.tipo === 'ENTREGA' && !enderecoEntrega) {
      setAddressPromptOpen(true);
      return;
    }

    setIsSubmittingPedido(true);

    try {
      let payload = {};

      if (user) {
        // --- USUÁRIO LOGADO ---
        payload = {
          observacoes: '',
          enderecoEntrega: carrinhoInfo?.tipo === 'ENTREGA' ? enderecoEntrega : undefined,
        };
      } else {
        // --- USUÁRIO ANÔNIMO ---
        const itensFormatados = carrinho.map((item) => ({
          produtoId: item.produtoId,
          qtdProduto: item.qtdProduto,
          modificadoresSelecionados:
            item.modificadoresSelecionados?.map((mod) => ({
              modificadorId: mod.modificadorId,
              valorAdicionalCobrado: mod.valorAdicionalCobrado,
            })) || [],
        }));

        payload = {
          carrinho: {
            lojaId: carrinhoInfo.lojaId,
            tipo: carrinhoInfo.tipo,
            itensNoCarrinho: itensFormatados,
            enderecoEntrega: carrinhoInfo?.tipo === 'ENTREGA' ? enderecoEntrega : undefined,
          },
          observacoes: '',
        };
      }

      const pedidoCriado = await criarPedido(payload);

      await limparCarrinho();
      if (user) {
        setAlertInfo({
          isOpen: true,
          title: 'Pedido Recebido!',
          msg: `Seu pedido #${pedidoCriado.id} foi realizado com sucesso. Acompanhe-o no histórico de pedidos da sua conta!`,
          type: 'success',
        });
      } else {
        // TODO: Adicionar informações de contato do anônimo nos detalhes do pedido (talvez nas observações)
        setAlertInfo({
          isOpen: true,
          title: 'Pedido Realizado!',
          msg: `Anote o número do seu pedido: #${pedidoCriado.id}.
            ${pedidoCriado.tipo === 'RETIRADA' ? 'Acompanhe no balcão!' : 'Assim que estiver pronto ele será enviado para seu endereço!'}`,
          type: 'success',
        });
      }
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      const msg = error.response?.data?.message || 'Erro ao realizar o pedido. Tente novamente.';
      setAlertInfo({ isOpen: true, title: 'Erro no Pedido', msg, type: 'error' });
    } finally {
      setIsSubmittingPedido(false);
    }
  };

  if (loadingCarrinho) {
    return (
      <Section id="carrinho" className={styles.carrinhoContent}>
        <div className="pageTitleContainer">
          <h2 style={{ textAlign: 'center' }}>Carregando carrinho...</h2>
        </div>
      </Section>
    );
  }

  return (
    <Section id="carrinho" className={isCartEmpty ? styles.carrinhoVazio : styles.carrinhoContent}>
      {isCartEmpty ? (
        // --- CONTEÚDO CARRINHO VAZIO ---
        <>
          <div className="pageTitleContainer">
            <h2 style={{ textAlign: 'center' }}>Seu carrinho está vazio!</h2>
          </div>
          <p style={{ textAlign: 'center' }}>Que tal explorar nossos produtos?</p>
          <Link to="/cardapio">
            <Button variant="primary">Ir para o Cardápio</Button>
          </Link>
        </>
      ) : (
        // --- CONTEÚDO CARRINHO CHEIO ---
        <>
          <div className="pageTitleContainer">
            <h2 style={{ textAlign: 'center' }}>Carrinho</h2>
          </div>
          <div className={styles.carrinhoGrid}>
            {/* LADO ESQUERDO ... (Mantido Igual) */}
            <div className={styles.itensCarrinhoBox}>
              {carrinho.map((item) => {
                const precoTotalItem = calcularPrecoTotalItem(item);
                const key = item.id || item.idItemCarrinhoLocal;

                return (
                  <div key={key} className={styles.itemCarrinho}>
                    <div className={styles.itemCarrinhoHeader}>
                      <div>
                        <h3>{item.produto?.nome || item.nomeProduto}</h3>
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
                                      {valorExtra > 0 && ` (+${formatCurrency(valorExtra)})`}
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
                      <span className={styles.itemCarrinhoPreco}>
                        {formatCurrency(precoTotalItem)}
                      </span>
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

            {/* LADO DIREITO */}
            <div className={styles.colunaDireita}>
              {isDesktop && (
                <div className={styles.limparCarrinhoContainer}>
                  <Button variant="outline-red" onClick={limparCarrinho}>
                    <FaRegTrashAlt /> Limpar Carrinho
                  </Button>
                </div>
              )}
              <div className={styles.resumoPedidoBox}>
                {/* TODO: Ao integrar cupom de desconto, descomentar as linhas abaixo */}
                {/* <div className={styles.resumoHeader}>
              <div className={styles.resumoHeaderItem}>
                <h3>Descontos e promoções</h3>
                <span className={styles.resumoHeaderIcon}>&gt;</span>
              </div>
            </div> */}

                <div className={styles.resumoHeader}>
                  <div className={styles.resumoHeaderItem} onClick={openTipoPedidoModal}>
                    <div className={styles.resumoInfoContainer}>
                      <FaTruck style={{ flexShrink: 0 }} />
                      <h3>Tipo: {carrinhoInfo?.tipo || 'A definir'}</h3>
                    </div>
                    <LuPencilLine
                      size={18}
                      className={styles.resumoHeaderIcon}
                      style={{ flexShrink: 0 }}
                    />
                  </div>
                </div>

                <div className={styles.resumoHeader}>
                  <div className={styles.resumoHeaderItem} onClick={handleLocalClick}>
                    <div className={styles.resumoInfoContainer}>
                      <FaStore style={{ flexShrink: 0 }} />
                      <h3>
                        Local:{' '}
                        {carrinhoInfo?.tipo === 'RETIRADA'
                          ? carrinhoInfo?.loja?.nome || 'Sabor na Nuvem'
                          : getEnderecoAtual()
                            ? formatAddress(getEnderecoAtual())
                            : 'Clique para definir endereço'}
                      </h3>
                    </div>
                    {carrinhoInfo?.tipo === 'RETIRADA' ? (
                      <LuInfo
                        size={18}
                        className={styles.resumoHeaderIcon}
                        style={{ flexShrink: 0 }}
                      />
                    ) : (
                      <LuPencilLine
                        size={18}
                        className={styles.resumoHeaderIcon}
                        style={{ flexShrink: 0 }}
                      />
                    )}
                  </div>
                </div>

                <div className={styles.resumoDetalhes}>
                  <div className={styles.resumoDetalhesItem}>
                    <span>Subtotal</span>
                    <span>{valorTotalFormatado}</span>{' '}
                  </div>
                  <div className={styles.resumoDetalhesItem}>
                    <span>Total</span>
                    <span className={styles.resumoTotal}>{valorTotalFormatado}</span>
                  </div>
                </div>
                {isDesktop && (
                  <div className={styles.resumoFooter}>
                    <Button
                      variant="primary"
                      className={styles.proximoButton}
                      onClick={handleRealizarPedido}
                      disabled={isSubmittingPedido}
                    >
                      {isSubmittingPedido ? 'Processando...' : 'Realizar Pedido'}
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

          {/* BARRA FIXA MOBILE */}
          {!isDesktop && (
            <div className={styles.mobileStickyBar}>
              <div>
                <div className={styles.mobileTotalLabel}>Total</div>
                <div className={styles.mobileTotalValue}>{valorTotalFormatado}</div>
              </div>
              <Button
                variant="primary"
                style={{ minWidth: '140px' }}
                onClick={handleRealizarPedido}
                disabled={isSubmittingPedido}
              >
                {isSubmittingPedido ? 'Processando...' : 'Realizar Pedido'}
              </Button>
            </div>
          )}
        </>
      )}

      {/* --- MODAIS --- */}

      {tipoPedidoModalOpen && (
        <ConfirmModal
          title="Tipo de Pedido"
          description={
            <>
              Você deseja que seu pedido seja <br />
              <strong>entregue em sua casa</strong> <br />
              ou prefere ir <br />
              <strong> retirar na loja</strong>?
            </>
          }
          confirmText="Receber em casa"
          cancelText="Retirar na loja"
          variant="primary"
          onConfirm={handleSelectEntrega}
          onCancel={handleSelectRetirada}
          onClose={closeTipoPedidoModal}
        />
      )}

      {addressPromptOpen && (
        <ConfirmModal
          title="Endereço necessário"
          description="Você não tem um endereço cadastrado para entrega. Deseja cadastrar um agora ou prefere retirar seu pedido diretamente na loja?"
          confirmText="Cadastrar endereço"
          cancelText="Retirar na loja"
          variant="primary"
          onConfirm={handlePromptCadastrar}
          onCancel={handlePromptRetirar}
          onClose={() => setAddressPromptOpen(false)}
        />
      )}

      {enderecoModalOpen && (
        <EnderecoModal
          onClose={() => setEnderecoModalOpen(false)}
          onSave={handleSaveEnderecoForm}
          textoBotao="Continuar"
          initialData={tempEndereco} // Passa o endereço atual para edição
          startEditing={true}
        />
      )}

      {mapModalOpen && tempEndereco && (
        <ConfirmarEnderecoFinalModal
          endereco={tempEndereco}
          readOnly={mapReadOnly}
          title={mapTitle}
          onBack={() => {
            setMapModalOpen(false);
            // Se estava editando, volta para o formulário
            if (!mapReadOnly) setEnderecoModalOpen(true);
          }}
          // Se for visualização de endereço do usuário, permite ir para edição
          onEdit={!isStoreAddress && mapReadOnly ? handleEditExistingAddress : undefined}
          onConfirm={handleConfirmEnderecoMap}
          onClose={() => setMapModalOpen(false)}
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

export default Carrinho;
