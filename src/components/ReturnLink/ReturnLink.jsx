import { Link } from "react-router-dom";
import styles from "./ReturnLink.module.css";

export default function ReturnLink({ to = "/", text = "Voltar", ...props }) {
  // Símbolo Unicode simples (leftarrow) para o ícone
  const icon = "‹";

  return (
    <Link to={to} className={styles.returnLink} {...props}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.text}>{text}</span>
    </Link>
  );
}
