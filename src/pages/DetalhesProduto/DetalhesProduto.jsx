import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Section from '../../components/Section';
import Button from '../../components/Button';
import QuantitySelector from '../../components/QuantitySelector';
import CustomizationGroup from '../../components/GrupoPersonalizavel';
import styles from './DetalhesProduto.module.css';
import MOCK_PRODUTOS from '../../data/produtos';
import { useCarrinho } from '../../contexts/CarrinhoContext';
import AlertModal from '../../components/Modals/AlertModal';
import { getModificadorData, calcularPrecoTotal, formatCurrency } from '../../utils/produtoUtils';

const DetalhesProduto = () => {
  const params = useParams();
  const produtoId = Number(params.produtoId);
  const produto = MOCK_PRODUTOS.find((p) => p.id === produtoId);

  const [qtdProduto, setQtdProduto] = useState(1);
  const [modificadoresSelecionadosUI, setModificadoresSelecionadosUI] = useState({});

  // Estado para controlar o AlertModal
  const [alertInfo, setAlertInfo] = useState({
    isOpen: false,
    title: '',
    msg: '',
    type: 'success',
  });

  const { adicionarItem } = useCarrinho();

  useEffect(() => {
    if (produto && produto.personalizacao && produto.personalizacao.length > 0) {
      const initialCustoms = {};
      produto.personalizacao.forEach((grupo) => {
        const isSelecaoUnica = grupo.selecaoMinima === 1 && grupo.selecaoMaxima === 1;
        if (isSelecaoUnica && grupo.modificadores.length > 0) {
          initialCustoms[grupo.id] = grupo.modificadores.find((m) => m.isOpcaoPadrao)?.id || null;
        } else {
          initialCustoms[grupo.id] = [];
        }
      });
      setModificadoresSelecionadosUI(initialCustoms);
    } else {
      setModificadoresSelecionadosUI({});
    }
  }, [produto]);

  const handleQuantityChange = (newQuantity) => {
    setQtdProduto(newQuantity);
  };

  const handleCustomizationChange = useCallback((groupId, newSelection) => {
    setModificadoresSelecionadosUI((prev) => ({
      ...prev,
      [groupId]: newSelection,
    }));
  }, []);

  // Usa a função utilitária para cálculo
  const valorTotal = useMemo(
    () => calcularPrecoTotal(produto, qtdProduto, modificadoresSelecionadosUI),
    [produto, qtdProduto, modificadoresSelecionadosUI]
  );

  // Usa a função utilitária para formatação
  const valorTotalFormatado = formatCurrency(valorTotal);

  const closeAlert = () => {
    setAlertInfo((prev) => ({ ...prev, isOpen: false }));
  };

  const handleAdicionarAoCarrinho = () => {
    if (!produto) return;

    const modificadoresParaCarrinho = [];
    Object.values(modificadoresSelecionadosUI).forEach((selectedValue) => {
      const addModToArray = (modId) => {
        // Usa a função utilitária para buscar dados
        const modData = getModificadorData(modId);
        if (modData) {
          modificadoresParaCarrinho.push({
            modificadorId: modData.id,
            nomeModificador: modData.nome,
            valorAdicionalCobrado: modData.precoAdicional || 0,
          });
        }
      };

      if (typeof selectedValue === 'number' && selectedValue !== null) {
        addModToArray(selectedValue);
      } else if (Array.isArray(selectedValue)) {
        selectedValue.forEach(addModToArray);
      }
    });

    const itemParaCarrinho = {
      produtoId: produto.id,
      nomeProduto: produto.nome,
      descricaoProduto: produto.descricao,
      imagemUrl: produto.imagemUrl,
      valorUnitarioProduto: produto.preco,
      qtdProduto,
      modificadoresSelecionados: modificadoresParaCarrinho,
    };

    adicionarItem(itemParaCarrinho);

    setAlertInfo({
      isOpen: true,
      title: 'Adicionado!',
      msg: `${qtdProduto}x ${produto.nome} foi adicionado ao seu carrinho com sucesso.`,
      type: 'success',
    });
  };

  if (!produto) {
    return (
      <Section id="detalhes-produto">
        <div className="pageTitleContainer">
          <h2 style={{ textAlign: 'center' }}>Produto não encontrado.</h2>
        </div>
      </Section>
    );
  }

  return (
    <Section id="detalhes-produto">
      <div className={styles.containerPrincipal}>
        <div className={styles.tituloProduto}>
          <h2>{produto.nome}</h2>
        </div>
        <div className={styles.produtoContent}>
          <div className={styles.leftBlock}>
            <div className={styles.imagemWrapper}>
              <img src={produto.imagemUrl} className={styles.imagemPrincipal} alt={produto.nome} />
            </div>

            <div className={styles.controlsBottom}>
              <div>
                <QuantitySelector
                  onQuantityChange={handleQuantityChange}
                  initialQuantity={qtdProduto}
                  min={1}
                />
              </div>
              <span className={styles.precoBotaoInferior}>{valorTotalFormatado}</span>
            </div>

            <Button
              variant="primary"
              className={styles.addToCartButton}
              onClick={handleAdicionarAoCarrinho}
            >
              Adicionar ao carrinho
            </Button>
          </div>

          <div className={styles.rightBlock}>
            <p className={styles.descricao}>{produto.descricao}</p>

            <h3 className={styles.personalizeSeuPedido}>Personalize seu pedido!</h3>

            {produto.personalizacao && produto.personalizacao.length > 0 ? (
              <div className={styles.customizationGroups}>
                {produto.personalizacao.map((grupo) => (
                  <CustomizationGroup
                    key={grupo.id}
                    grupo={grupo}
                    onSelectionChange={handleCustomizationChange}
                    selectedValues={modificadoresSelecionadosUI[grupo.id]}
                  />
                ))}
              </div>
            ) : (
              <p>Nenhuma opção de personalização disponível para este produto.</p>
            )}
          </div>
        </div>
        <div className={styles.backLinkWrapper}>
          <Link to={`/cardapio`} className={styles.backLink}>
            &lt; Voltar ao cardápio
          </Link>
        </div>
      </div>

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

export default DetalhesProduto;
