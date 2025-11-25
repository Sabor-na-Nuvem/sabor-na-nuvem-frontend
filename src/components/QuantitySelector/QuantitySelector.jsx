import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './QuantitySelector.module.css';

const QuantitySelector = ({ initialQuantity = 1, min = 1, onQuantityChange, disabled = false }) => {
  const [qtdProduto, setQtdProduto] = useState(initialQuantity);

  const handleDecrease = () => {
    if (qtdProduto > min) {
      const newQuantity = qtdProduto - 1;
      setQtdProduto(newQuantity);
      if (onQuantityChange) onQuantityChange(newQuantity);
    }
  };

  const handleIncrease = () => {
    const newQuantity = qtdProduto + 1;
    setQtdProduto(newQuantity);
    if (onQuantityChange) onQuantityChange(newQuantity);
  };

  return (
    <div className={styles.quantitySelector}>
      <button
        className={styles.button}
        onClick={handleDecrease}
        disabled={qtdProduto === min || disabled}
        type="button"
      >
        <span className={styles.minus}>-</span>
      </button>

      <span className={styles.quantity}>{qtdProduto}</span>

      <button className={styles.button} onClick={handleIncrease} type="button" disabled={disabled}>
        <span className={styles.plus}>+</span>
      </button>
    </div>
  );
};

QuantitySelector.propTypes = {
  initialQuantity: PropTypes.number,
  min: PropTypes.number,
  onQuantityChange: PropTypes.func,
  disabled: PropTypes.bool,
};

export default QuantitySelector;
