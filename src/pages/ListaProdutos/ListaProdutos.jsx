import React from 'react';
import { useParams } from 'react-router-dom';
import Section from '../../components/Section';
import styles from './ListaProdutos.module.css';
import MOCK_PRODUTOS from '../../data/produtos';
import MOCK_CATEGORIAS from '../../data/categorias';

const ListaProdutos = () => {
  const params = useParams();
  const categoriaId = Number(params.categoriaId);
  const categoriaNome =
    categoriaId === 10 ? 'Todas as Categorias' : MOCK_CATEGORIAS.at(categoriaId - 1).name;

  return (
    <Section id="home">
      <div className="pageTitleContainer">
        <h2 style={{ textAlign: 'center' }}>{categoriaNome}</h2>
      </div>

      {/* CATEGORIAS */}
      <div className={styles.produtoList}>
        {MOCK_PRODUTOS.map(
          (produto) =>
            (produto.categoriaId === categoriaId || categoriaId === 10) && (
              <div key={produto.id} className={styles.produtoButton}>
                <div className={styles.produtoNameBox}>
                  <span className={styles.produtoName}>{produto.nome}</span>
                </div>
                <img src={produto.imageUrl} className={styles.produtoImage} />
              </div>
            )
        )}
      </div>
    </Section>
  );
};

export default ListaProdutos;
