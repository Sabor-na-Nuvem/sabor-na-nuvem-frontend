import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Section from '../../components/Section';
import styles from './ListaProdutos.module.css';
import placeholderImage from '../../assets/placeholder-small.png';
import { useCarrinho } from '../../contexts/CarrinhoContext';
import {
  listarProdutosDaLoja,
  listarTodosProdutos,
  buscarCategoriaPorId,
} from '../../services/produto.service';
import { LOJA_PADRAO_ID } from '../../constants/lojaId';

const ListaProdutos = () => {
  const navigate = useNavigate();
  const { categoriaId } = useParams();

  const { carrinhoInfo } = useCarrinho();
  // TODO: Trocar para ver produtos dependendo da loja
  // const lojaIdSelecionada = carrinhoInfo?.lojaId;
  const lojaIdSelecionada = LOJA_PADRAO_ID;

  const [produtos, setProdutos] = useState([]);
  const [titulo, setTitulo] = useState('Carregando...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      try {
        // Define o Título da Categoria
        if (categoriaId === 'todas') {
          setTitulo('Todas as Categorias');
        } else {
          try {
            const categoria = await buscarCategoriaPorId(categoriaId);
            setTitulo(categoria.nome);
          } catch (err) {
            console.error('Erro ao buscar categoria', err);
            setTitulo('Categoria');
          }
        }

        let listaBruta = [];
        let produtosNormalizados = [];

        // Decide qual busca fazer (Loja Específica vs Global)
        if (lojaIdSelecionada) {
          // --- CENÁRIO A: Loja Selecionada ---
          // Retorna array de { lojaId, valorBase, disponivel, produto: { ... } }
          listaBruta = await listarProdutosDaLoja(lojaIdSelecionada);

          produtosNormalizados = listaBruta
            .filter((item) => {
              // Filtra por categoria
              if (categoriaId !== 'todas' && item.categoriaId !== Number(categoriaId)) return false;
              return true;
            })
            .map((item) => ({
              id: item.produtoId,
              nome: item.nomeProduto,
              imagemUrl: item.imagemUrl || null,
              descricao: item.descricaoProduto || '',
              preco: Number(item.valorBase),
              temPreco: true,
              disponivel: item.disponivel,
            }));
        } else {
          // --- CENÁRIO B: Nenhuma Loja (Vitrine Global) ---
          // Retorna array de { id, nome, imagemUrl... }
          listaBruta = await listarTodosProdutos();

          produtosNormalizados = listaBruta
            .filter((item) => {
              if (categoriaId !== 'todas' && item.categoriaId !== Number(categoriaId)) return false;
              return true;
            })
            .map((item) => ({
              id: item.id,
              nome: item.nome,
              imagemUrl: item.imagemUrl,
              descricao: item.descricao,
              preco: 0, // Sem loja = sem preço definido
              temPreco: false,
              disponivel: true,
            }));
        }

        setProdutos(produtosNormalizados);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        setTitulo('Erro ao carregar');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [categoriaId, lojaIdSelecionada]);

  if (loading) {
    return (
      <Section id="lista-produtos">
        <div className="pageTitleContainer">
          <h2 style={{ textAlign: 'center' }}>Carregando produtos...</h2>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <div className="spinner"></div>
        </div>
      </Section>
    );
  }

  return (
    <Section id="lista-produtos">
      <div className="pageTitleContainer">
        <h2 style={{ textAlign: 'center' }}>{titulo}</h2>
        {!lojaIdSelecionada && (
          <p
            style={{
              textAlign: 'center',
              fontSize: '0.9em',
              color: 'var(--text-body)',
            }}
          >
            Visualizando catálogo global. Selecione uma loja para ver preços e disponibilidade.
          </p>
        )}
        {lojaIdSelecionada && carrinhoInfo?.loja && (
          <p
            style={{
              textAlign: 'center',
              fontSize: '0.9em',
              color: 'var(--color-primary)',
            }}
          >
            Loja: {carrinhoInfo.loja.nome}
          </p>
        )}
      </div>

      <div className={styles.produtoList}>
        {produtos.length > 0 ? (
          produtos.map((produto) => (
            <button
              key={produto.id}
              className={styles.produtoButton}
              onClick={() => navigate(`/detalhes-produto/${produto.id}`)}
              disabled={!produto.disponivel}
            >
              <div className={styles.produtoNameBox}>
                <span className={styles.produtoName}>{produto.nome}</span>
                {produto.temPreco ? (
                  <span className={styles.produtoPrice}>R$ {produto.preco.toFixed(2)}</span>
                ) : (
                  <span
                    className={styles.produtoPrice}
                    style={{ fontSize: '0.8em', fontWeight: 'normal' }}
                  >
                    Ver opções
                  </span>
                )}
              </div>

              <div className={styles.produtoImageContainer}>
                <img
                  src={produto.imagemUrl || placeholderImage}
                  alt={produto.nome}
                  className={styles.produtoImage}
                  onError={(e) => {
                    e.target.src = placeholderImage;
                  }}
                  style={!produto.disponivel ? { filter: 'grayscale(100%)', opacity: 0.6 } : {}}
                />
                {!produto.disponivel && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: 'rgba(0,0,0,0.7)',
                      color: '#fff',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      fontSize: '0.8em',
                    }}
                  >
                    Indisponível
                  </div>
                )}
              </div>
            </button>
          ))
        ) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>
            <p>Nenhum produto encontrado nesta categoria.</p>
          </div>
        )}
      </div>
    </Section>
  );
};

export default ListaProdutos;
