const Login = () => (
  <div
    style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f0f0f0",
    }}
  >
    <div
      style={{
        background: "white",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        textAlign: "center",
      }}
    >
      <h2>Bem-vindo de volta!</h2>
      <p>Esta é a tela de Login (sem Header/Footer)</p>
      <Link to="/">Voltar para Home</Link>
    </div>
  </div>
);

export default Login;
