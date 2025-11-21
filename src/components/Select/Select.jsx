import React from 'react';
import PropTypes from 'prop-types';
import { LuChevronDown } from 'react-icons/lu';
import styles from './Select.module.css'; // Importe o novo CSS

const Select = ({ label, name, value, onChange, options, error, disabled, ...props }) => {
  const inputClass = error ? `${styles.selectField} ${styles.error}` : styles.selectField;

  return (
    <div className={styles.inputGroup}>
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>

      <div className={styles.selectWrapper}>
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={inputClass}
          disabled={disabled}
          aria-invalid={!!error}
          {...props}
        >
          <option value="" disabled hidden>
            Selecione...
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        {/* Seta Customizada que anima */}
        {!disabled && (
          <div className={styles.iconContainer}>
            <LuChevronDown size={20} />
          </div>
        )}
      </div>

      <span className={`${styles.errorMessage} ${error ? styles.visible : ''}`}>
        {error || ' '}
      </span>
    </div>
  );
};

Select.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  error: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Select;
