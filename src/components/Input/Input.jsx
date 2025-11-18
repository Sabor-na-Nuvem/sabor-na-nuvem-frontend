import styles from "./Input.module.css";

const Input = ({ label, error, type = "text", ...props }) => {
  const inputClass = error
    ? `${styles.inputField} ${styles.error}`
    : styles.inputField;

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

      <span className={`${styles.errorMessage} ${error ? styles.visible : ""}`}>
        {error || " "}
      </span>
    </div>
  );
};

export default Input;
