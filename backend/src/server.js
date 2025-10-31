const express = require('express');
const cors = require('cors');

// inicializa o prisma client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// inicializa bcrypt
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// inicializa o express
const app = express();

// configurações do express
app.use(cors()); // permite que o front aceda a essa API
app.use(express.json()); //permite que esse servidor entenda JSON

// -- ROTAS COMEÇAM AQUI -- //

// rota de teste para ver se o servidor está vivo
app.get('/', (req, res) => {
    res.send('API do diário de treinos está funcionando')
})

// ---ROTA DE REGISTRO (SEMANA 3) --- //
// primeiro endpoint real

app.post('/usuarios', async (req, res) => {
    try {
        // 1. pegar os dados do corpo de requisição
        const { nome, email, senha } = req.body;

        // 2. criptografar as senhas com bcrypt
        const hashDaSenha = await bcrypt.hash(senha,10) // 10 é o "custo" da criptografia

        // 3. salvar o novo usuário no banco (com Prisma)
        const novoUsuario = await prisma.user.create({
            data: {
                nome: nome,
                email: email,
                senha: hashDaSenha,
                // o nivel 'padrao' já é o defalut, como foi definido em schema.prisma
            },
        });

        // 4. retornar uma resposta de sucesso
        // (não retorne a senha, mesmo criptografada)
        res.status(201).json({ id: novoUsuario.id, nome: novoUsuario.nome, email: novoUsuario.email });

    } catch (error) {
        console.error("### ERRO DETALHADO DO CATCH: ###", error); // diagnosticar o erro que está tendo no insomnia

        if (error.code === 'P2002') { // P2002 é o código de erro do Prisma para "Unique constraint failed"
            return res.status(400).json({ message: 'Esse e-mail já está em uso.' });
        }
        res.status(500).json({ message: 'Ocorreu um erro ao registrar o usuário.' });
    }
});

app.post('/login', async (req, res) => {
  try {
    // 1. Pegar os dados do corpo
    const { email, senha } = req.body;

    // 2. Encontrar o usuário no banco (com Prisma)
    const usuario = await prisma.user.findUnique({
      where: { email: email },
    });

    // 3. Se o usuário não existir, retornará um erro
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // 4. Comparar a senha digitada com a senha do banco (com Bcrypt)
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    // 5. Se a senha estiver incorreta, retornará um erro
    if (!senhaCorreta) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    // 6. Gerar o Token JWT (O "Crachá")
    const token = jwt.sign(
      { id: usuario.id, nivel: usuario.nivel }, // O que guardamos dentro do crachá
      process.env.JWT_SECRET, // Senha secreta salva no arq .env
      { expiresIn: '8h' } // O crachá expira em 8 horas
    );

    // 7. Retornar o token e os dados do usuário
    res.status(200).json({
      token: token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Ocorreu um erro ao fazer login.' });
  }
});

// --- FIM DAS ROTAS ---

// inicializa o servidor na porta 3333
const PORTA = 3333;
app.listen(PORTA, () => {
    console.log( 'servidor rodando na porta http://localhost:${PORTA}`' );
});

