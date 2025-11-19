import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './ReturnLink.module.css';

const ReturnLink = ({ to = '/', text = 'Voltar', ...props }) => {
  // Símbolo Unicode simples (leftarrow) para o ícone
  const icon = '‹';

  return (
    <Link to={to} className={styles.returnLink} {...props}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.text}>{text}</span>
    </Link>
  );
};

ReturnLink.propTypes = {
  to: PropTypes.string,
  text: PropTypes.string,
};

export default ReturnLink;
