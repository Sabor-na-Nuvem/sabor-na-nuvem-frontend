import React from 'react';
import { useNavigate } from 'react-router-dom';
import Section from '../../components/Section';
import styles from './Cardapio.module.css';
import MOCK_CATEGORIAS from '../../data/categorias';
import placeholderImage from '../../assets/placeholder-small.png';

const Cardapio = () => {
  const navigate = useNavigate();

  return (
    <Section id="home">
      <div className="pageTitleContainer">
        <h2 style={{ textAlign: 'center' }}>Cardápio</h2>
      </div>

      {/* CATEGORIAS */}
      <div className={styles.categoryList}>
        {MOCK_CATEGORIAS.map((categoria) => (
          <button
            key={categoria.id}
            className={styles.categoryButton}
            onClick={() => navigate(`/lista-produtos/${categoria.id}`)}
          >
            <img src={categoria.image} className={styles.categoryImage} />
            <span className={styles.categoryName}>{categoria.name}</span>
          </button>
        ))}
        <button className={styles.categoryButton} onClick={() => navigate(`/lista-produtos/${10}`)}>
          <img src={placeholderImage} className={styles.categoryImage} />
          <span className={styles.categoryName}>Todas as categorias</span>
        </button>
      </div>
    </Section>
  );
};

export default Cardapio;
