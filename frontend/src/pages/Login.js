import React, { useState } from "react";
// import axios from "axios"; // antes precisava importar axios, mas agora ele vai navegar com a agenda api
import api from '../services/api'
import { useNavigate } from "react-router-dom";

function Login() {
  // 1. Estados para os campos de login
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [mensagemErro, setMensagemErro] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (evento) => {
    evento.preventDefault();
    setMensagemErro("");

    try {
      // 2. "Telefonar" para o endpoint de LOGIN
      const response = await api.post('/login', {
        email: email,
        senha: senha,
      });

      // 3. Se deu certo (código 200), LOGIN BEM-SUCEDIDO!
      console.log("Login bem-sucedido!", response.data);

      // 4. Guardar o Token no navegador
      // Este é o passo mais importante da autenticação
      localStorage.setItem("token", response.data.token);

      // 5. Redirecionar o usuário para a página principal
      navigate('/Dashboard');

      // (No futuro, usara: navigate('/dashboard');)
    } catch (error) {
      // 8. Se deu errado (ex: senha incorreta)
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        console.error("Erro ao logar:", error.response.data.message);
        setMensagemErro(error.response.data.message);
      } else {
        console.error("Erro desconhecido ao logar:", error);
        setMensagemErro("Ocorreu um erro inesperado. Tente novamente.");
      }
    }
  };

  return (
    <div>
      <h1>Página de Login</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Senha:</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        <button type="submit">Entrar</button>
      </form>

      {mensagemErro && <p style={{ color: "red" }}>{mensagemErro}</p>}
    </div>
  );
}

export default Login;
