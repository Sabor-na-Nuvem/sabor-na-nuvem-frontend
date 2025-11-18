import styles from "./Button.module.css";

const Button = ({
  type = "text",
  children,
  variant = "primary",
  onClick,
  icon,
  className = "",
}) => {
  // Classe base + a variante + classes extras (se houver)
  const classNames = `${styles.btn} ${styles[variant]} ${className}`;

  return (
    <button className={classNames} onClick={onClick} type={type}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
