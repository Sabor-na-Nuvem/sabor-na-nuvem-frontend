import React from 'react';
import { TbMathGreater } from 'react-icons/tb';
import PropTypes from 'prop-types';
import styles from './Button.module.css';

const Button = ({
  type = 'text',
  children,
  variant = 'primary',
  onClick,
  icon,
  openSimbol = false,
  className = '',
}) => {
  // Classe base + a variante + classes extras (se houver)
  const classNames = `${styles.btn} ${styles[variant]} ${className}`;

  return (
    <button className={classNames} onClick={onClick} type={type}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
      {openSimbol && <span>{<TbMathGreater />}</span>}
    </button>
  );
};

Button.propTypes = {
  type: PropTypes.string,
  children: PropTypes.node,
  variant: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.string,
  openSimbol: PropTypes.bool,
  className: PropTypes.string,
};

export default Button;
