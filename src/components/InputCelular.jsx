import React from 'react';
import PropTypes from 'prop-types';
import Input from './Input';

const InputCelular = ({ onChange, ...props }) => {
  const handleChange = (e) => {
    let { value } = e.target;

    // Remove tudo que não é número
    value = value.replace(/\D/g, '');
    // Limita a 11 números (DDD + 9 dígitos)
    if (value.length > 11) value = value.slice(0, 11);
    // Aplica a máscara: (XX) XXXXX-XXXX
    if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    if (value.length > 7) {
      const parte1 = value.slice(0, 10);
      const parte2 = value.slice(10);
      value = `${parte1}-${parte2}`;
    }

    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: props.name,
        value,
      },
    };

    onChange(syntheticEvent);
  };

  return (
    <Input
      {...props}
      type="tel"
      onChange={handleChange}
      placeholder="-"
      maxLength={15}
      autoComplete="tel"
    />
  );
};

InputCelular.propTypes = {
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default InputCelular;
