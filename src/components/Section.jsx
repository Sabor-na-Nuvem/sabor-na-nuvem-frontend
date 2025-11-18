import React from "react";

const Section = ({ children, id, className = "" }) => {
  return (
    <section id={id} className={`section ${className}`}>
      <div className="container">{children}</div>
    </section>
  );
};

export default Section;
