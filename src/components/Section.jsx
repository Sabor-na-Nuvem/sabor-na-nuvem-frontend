import React from 'react';
import PropTypes from 'prop-types';

const Section = ({ children, id, className = '' }) => {
  return (
    <section id={id} className={`section ${className}`}>
      <div className="container">{children}</div>
    </section>
  );
};

Section.propTypes = {
  children: PropTypes.node.isRequired,
  id: PropTypes.string,
  className: PropTypes.string,
};

export default Section;
