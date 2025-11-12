import React, { useState } from "react"; //importando useState
// import axios from "axios"; // antes precisava importar axios, mas agora ele vai navegar com a agenda api
import api from '../services/api'
import { useNavigate } from "react-router-dom"; //useNavigate para redirecionar

function Register() {
  // 4. Criando bloco de notas (estados) para cada campo do formulario
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [mensagemErro, setMensagemErro] = useState(""); // para mostrar erros

  const navigate = useNavigate(); // inicializa o "GPS" para redirecionar

  // 5. Funcao que sera chamda quando o formulario for enviado
  const handleSubmit = async (evento) => {
    evento.preventDefault(); // impede o navegador de recarregar a pagina
    setMensagemErro(""); // limpa erros antigos

    try {
      // 6. "telefona" para o backend na porta 3333
      const response = await api.post('/usuarios', {
        nome: nome,
        email: email,
        senha: senha,
      });

      //7. se deu certo (cod 201), sucesso
      console.log("Usuário registrado!", response.data);

      // redireciona usuario para pagina de login
      navigate("/login");
    } catch (error) {
      // 8. Se deu errado, como email duplicado, garante que o erro veio do back antes de tentar mostra-lo
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        console.error("Erro ao registrar:", error.response.data.message);
        setMensagemErro(error.response.data.message); // mostra o erro do back
      } else {
        console.error("Erro desconhecido ao registrar:", error);
        setMensagemErro("Ocorreu um erro inesperado. Tente novamente.");
      }
    }
  };

  return (
    <div>
      <h1>Página de Registro</h1>

      {/* 9. O formulario */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>
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

        <button type="submit">Registrar</button>
      </form>

      {/* 10. Local para mostrar a mensagem de erro */}
      {mensagemErro && <p style={{ color: "red" }}>{mensagemErro}</p>}
    </div>
  );
}

export default Register;
