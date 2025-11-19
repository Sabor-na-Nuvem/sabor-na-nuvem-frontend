import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './GrupoPersonalizavel.module.css';

const GrupoPersonalizavel = ({ grupo, onSelectionChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Assume que para seleção mínima = 1 e máxima = 1, é radio (single-select)
  const isSelecaoUnica = grupo.selecaoMinima === 1 && grupo.selecaoMaxima === 1;
  const [opcoesSelecionadas, setOpcoesSelecionadas] = useState(
    isSelecaoUnica && grupo.modificadores.length > 0
      ? grupo.modificadores.find((m) => m.isOpcaoPadrao)?.id || null
      : []
  );

  const handleToggle = () => setIsOpen(!isOpen);

  const handleOptionChange = (modificadorId, isChecked) => {
    let novaSelecao;
    if (isSelecaoUnica) {
      novaSelecao = isChecked ? modificadorId : null;
    } else {
      // Multi-select
      // eslint-disable-next-line no-lonely-if
      if (isChecked) {
        novaSelecao = [...opcoesSelecionadas, modificadorId];
        if (novaSelecao.length > grupo.selecaoMaxima) {
          novaSelecao.shift();
        }
      } else {
        novaSelecao = opcoesSelecionadas.filter((id) => id !== modificadorId);
      }
    }
    setOpcoesSelecionadas(novaSelecao);
    if (onSelectionChange) onSelectionChange(grupo.id, novaSelecao);
  };

  return (
    <div className={styles.grupoPersonalizavel}>
      <button className={styles.header} onClick={handleToggle}>
        <span>{grupo.nome}</span>
        <span className={`${styles.icon} ${isOpen ? styles.open : ''}`}>&#9660;</span>{' '}
        {/* Seta para expandir */}
      </button>

      <div className={`${styles.optionsWrapper} ${isOpen ? styles.open : ''}`}>
        <div className={styles.options}>
          {/* O conteúdo real das opções */}
          {grupo.modificadores.map((modificador) => (
            <label key={modificador.id} className={styles.optionItem}>
              <input
                type={isSelecaoUnica ? 'radio' : 'checkbox'}
                name={`grupo-${grupo.id}`}
                value={modificador.id}
                checked={
                  isSelecaoUnica
                    ? opcoesSelecionadas === modificador.id
                    : opcoesSelecionadas.includes(modificador.id)
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

// 1. Definição do formato do Modificador (opção individual)
const ModificadorShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  nome: PropTypes.string.isRequired,
  descricao: PropTypes.string,
  isOpcaoPadrao: PropTypes.bool.isRequired,
  precoAdicional: PropTypes.number,
});

// 2. Definição do formato do Grupo Personalizavel
const PersonalizavelShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  nome: PropTypes.string.isRequired,
  selecaoMinima: PropTypes.number.isRequired,
  selecaoMaxima: PropTypes.number.isRequired,
  modificadores: PropTypes.arrayOf(ModificadorShape).isRequired,
});

// --- DEFINIÇÃO DO COMPONENTE PRINCIPAL ---

GrupoPersonalizavel.propTypes = {
  grupo: PersonalizavelShape.isRequired,
  onSelectionChange: PropTypes.func,
};

export default GrupoPersonalizavel;
