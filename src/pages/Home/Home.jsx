import React from 'react';
import Section from '../../components/Section';
import Button from '../../components/Button';
import imagemPrincipal from '../../assets/placeholder-big.png';
import imagemCards from '../../assets/placeholder-small.png';
import useMediaQuery from '../../hooks/useMediaQuery';
import styles from './Home.module.css';

const DESKTOP_BREAKPOINT = '(min-width: 1024px)';

const Home = () => {
  const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT);

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
                  <Button variant="primary">Delivery</Button>
                  <Button variant="outline-red">Retirar na Loja</Button>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.imageBlock}>
            <img src={imagemPrincipal} className={styles.imagemPrincipal} />
          </div>
        </div>

        {/* CARDAPIO */}
        <div className={styles.cardapioContainer}>
          <h2>Confira nosso...</h2>
          <Button variant="outline-yellow" className={styles.cardapioButton}>
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
          <div className={styles.destaquesCard}>
            <div className={styles.destaquesText}>
              <h4>Cheese Burger</h4>
              <p>
                O tradicional. Um hambúrger de carne bovina (80g), queijo cheddar, maionese e pão.
              </p>
            </div>
            <img src={imagemCards} className={styles.destaquesImagem} />
          </div>

          <div className={styles.destaquesCard}>
            <div className={styles.destaquesText}>
              <h4>X-Bacon</h4>
              <p>
                Dois hambúrgueres (80g carne bovina), queijo cheddar, fatias de bacon, ketchup,
                mostarda e pão com gergelim
              </p>
            </div>
            <img src={imagemCards} className={styles.destaquesImagem} />
          </div>

          <div className={styles.destaquesCard}>
            <div className={styles.destaquesText}>
              <h4>Mega Combo</h4>
              <p>
                Perfeito para quando a fome bate! Um X-Bacon com porção média de fritas e aquele
                refrigerente bem gelado!
              </p>
            </div>
            <img src={imagemCards} className={styles.destaquesImagem} />
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Home;
