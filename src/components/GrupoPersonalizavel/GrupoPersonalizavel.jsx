import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './GrupoPersonalizavel.module.css';

const GrupoPersonalizavel = ({ grupo, onSelectionChange, selectedValues }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isSelecaoUnica = grupo.selecaoMinima === 1 && grupo.selecaoMaxima === 1;

  const handleToggle = () => setIsOpen(!isOpen);

  const handleOptionChange = (modificadorId, isChecked) => {
    let novaSelecao;
    if (isSelecaoUnica) {
      novaSelecao = isChecked ? modificadorId : null;
    } else {
      const currentSelection = selectedValues || [];
      if (isChecked) {
        novaSelecao = [...currentSelection, modificadorId];
        if (novaSelecao.length > grupo.selecaoMaxima) {
          novaSelecao.shift();
        }
      } else {
        novaSelecao = currentSelection.filter((id) => id !== modificadorId);
      }
    }
    if (onSelectionChange) onSelectionChange(grupo.id, novaSelecao);
  };

  return (
    <div className={styles.grupoPersonalizavel}>
      <button type="button" className={styles.header} onClick={handleToggle}>
        <span>{grupo.nome}</span>
        <span className={`${styles.icon} ${isOpen ? styles.open : ''}`}>&#9660;</span>{' '}
      </button>

      <div className={`${styles.optionsWrapper} ${isOpen ? styles.open : ''}`}>
        <div className={styles.options}>
          {grupo.modificadores.map((modificador) => (
            <label key={modificador.id} className={styles.optionItem}>
              <input
                type={isSelecaoUnica ? 'radio' : 'checkbox'}
                name={`grupo-${grupo.id}`}
                value={modificador.id}
                checked={
                  isSelecaoUnica
                    ? selectedValues === modificador.id
                    : Array.isArray(selectedValues) && selectedValues.includes(modificador.id)
                }
                onChange={(e) => handleOptionChange(modificador.id, e.target.checked)}
              />
              {modificador.nome}
              {modificador.precoAdicional > 0 && (
                <span className={styles.optionPrice}>
                  + R${modificador.precoAdicional.toFixed(2)}
                </span>
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- DEFINIÇÃO DE TIPOS ANINHADOS ---

const ModificadorShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  nome: PropTypes.string.isRequired,
  descricao: PropTypes.string,
  isOpcaoPadrao: PropTypes.bool.isRequired,
  precoAdicional: PropTypes.number,
});

const PersonalizavelShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  nome: PropTypes.string.isRequired,
  selecaoMinima: PropTypes.number.isRequired,
  selecaoMaxima: PropTypes.number.isRequired,
  modificadores: PropTypes.arrayOf(ModificadorShape).isRequired,
});

GrupoPersonalizavel.propTypes = {
  grupo: PersonalizavelShape.isRequired,
  onSelectionChange: PropTypes.func.isRequired,
  selectedValues: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.oneOf([null]),
  ]),
};

GrupoPersonalizavel.defaultProps = {
  selectedValues: null,
};

export default GrupoPersonalizavel;
