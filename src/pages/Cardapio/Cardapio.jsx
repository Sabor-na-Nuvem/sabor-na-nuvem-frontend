import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Section from '../../components/Section';
import styles from './Cardapio.module.css';
import placeholderImage from '../../assets/placeholder-small.png';
import { listarCategorias } from '../../services/produto.service';

const Cardapio = () => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const dados = await listarCategorias();
        setCategorias(dados);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        // Opcional: Mostrar um alerta de erro
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  if (loading) {
    return (
      <Section id="cardapio">
        <div className="pageTitleContainer">
          <h2 style={{ textAlign: 'center' }}>Carregando cardápio...</h2>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <div className="spinner"></div>
        </div>
      </Section>
    );
  }

  return (
    <Section id="cardapio">
      <div className="pageTitleContainer">
        <h2 style={{ textAlign: 'center' }}>Cardápio</h2>
      </div>

      {/* LISTA DE CATEGORIAS */}
      <div className={styles.categoryList}>
        {categorias.map((categoria) => (
          <button
            key={categoria.id}
            className={styles.categoryButton}
            onClick={() => navigate(`/lista-produtos/${categoria.id}`)}
          >
            {/* Fallback para placeholder se a categoria não tiver imagem */}
            <img
              src={categoria.imagemUrl || placeholderImage}
              className={styles.categoryImage}
              alt={categoria.nome}
              onError={(e) => {
                e.target.src = placeholderImage;
              }} // Garante que não quebra se a URL for inválida
            />
            <span className={styles.categoryName}>{categoria.nome}</span>
          </button>
        ))}

        {/* Botão "Todas as categorias" (ID especial, ex: 'todas' ou 0) */}
        <button className={styles.categoryButton} onClick={() => navigate(`/lista-produtos/todas`)}>
          <img src={placeholderImage} className={styles.categoryImage} alt="Todas" />
          <span className={styles.categoryName}>Todas as categorias</span>
        </button>
      </div>

      {/* Mensagem caso não haja categorias */}
      {categorias.length === 0 && (
        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-body)' }}>
          Nenhuma categoria encontrada no momento.
        </p>
      )}
    </Section>
  );
};

export default Cardapio;
