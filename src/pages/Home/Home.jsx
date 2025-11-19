import React from 'react';
import Section from '../../components/Section';
import Button from '../../components/Button';

const Home = () => (
  <Section id="home">
    <h1 className="text-center">Um sabor inesquecível...</h1>
    <p className="text-center">Como você quer pedir hoje?</p>
    <div
      style={{
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        marginTop: '20px',
      }}
    >
      <Button variant="primary">Delivery</Button>
      <Button variant="outline-yellow">Retirar na Loja</Button>
    </div>
  </Section>
);

export default Home;
