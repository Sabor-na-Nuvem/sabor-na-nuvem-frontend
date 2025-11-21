import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiFileList3Line } from 'react-icons/ri';
import { MdOutlineDiscount } from 'react-icons/md';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import imagemPrincipal from '../../assets/placeholder-big.png';
import Section from '../../components/Section';
import styles from './Perfil.module.css';
import Button from '../../components/Button';

const Perfil = () => {
  const navigate = useNavigate();

  return (
    <Section>
      <div className="pageTitleContainer">
        <h2 style={{ textAlign: 'center' }}>Minha Conta</h2>
      </div>

      <div className={styles.topContainer}>
        <div className={styles.contentBlock}>
          <div className={styles.innerLeftTopContainer}>
            <Button
              variant="outline-red"
              className={styles.opcoesPerfil}
              onClick={() => navigate('/minha-conta/info')}
              icon={<IoIosInformationCircleOutline size={30} />}
              openSimbol
            >
              Informações da Conta
            </Button>
            <Button
              variant="outline-red"
              className={styles.opcoesPerfil}
              onClick={() => navigate('/minha-conta/historico-pedidos')}
              icon={<RiFileList3Line size={25} />}
              openSimbol
            >
              Histórico de Pedidos
            </Button>
            <Button
              variant="outline-red"
              className={styles.opcoesPerfil}
              icon={<MdOutlineDiscount size={25} />}
              openSimbol
            >
              Cupons de Desconto
            </Button>
          </div>
        </div>

        <div className={styles.imageBlock}>
          <img src={imagemPrincipal} className={styles.imagemPrincipal} />
        </div>
      </div>
    </Section>
  );
};

export default Perfil;
