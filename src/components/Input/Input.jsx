import React from 'react';
import PropTypes from 'prop-types';
import styles from './Input.module.css';

const Input = ({ label, error, type = 'text', ...props }) => {
  const inputClass = error ? `${styles.inputField} ${styles.error}` : styles.inputField;

  return (
    <div className={styles.inputGroup}>
      <label htmlFor={props.id || props.name} className={styles.label}>
        {label}
      </label>

      <input
        id={props.id || props.name}
        type={type}
        className={inputClass}
        aria-invalid={!!error}
        {...props}
      />

      <span className={`${styles.errorMessage} ${error ? styles.visible : ''}`}>
        {error || ' '}
      </span>
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  id: PropTypes.string,
};

export default Input;
