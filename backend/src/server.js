require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middlewares/auth');

// inicializa o prisma client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// inicializa bcrypt
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// inicializa o express
const app = express();

// configurações do express
app.use(cors()); // permite que o front aceda a essa API
app.use(express.json()); //permite que esse servidor entenda JSON

// Configuração nodemailer
const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
});

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

// --ROTA DE "ESQUECI MINHA SENHA" -- //
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // 1. encontrar usuario pelo email
    const usuario = await prisma.user.findUnique({ where: { email } });

  if (!usuario) {
    // nao retornar que o email nao existe, mas, sim, uma saida generica para nao dar pista para hacker
    return res.status(200).json({ message: 'Se um usuário com este e-mail existir, um link de recuperação será enviado.' });
  }

    // 2. Gera token de reset aleatorio e seguro
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 3. criptografar o token antes de salvar no banco
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // 4. definir data de expiração
    const expirationDate = new Date(Date.now() + 3600000); // 1 hora a partir de agora

    //5. Salvar token criptografado e data no usuario
    await prisma.user.update({
      where: { email: email },
      data: {
        resetToken: hashedToken,
        resetTokenExpires: expirationDate,
      },
    });

    // 6. criar link de recuperação
    // envia token nao criptografado
    const resetURL = `http://localhost:3000/reset-password/${resetToken}`;

    // 7. enviar email usando nodemailer (Mailtrap)
    await transport.sendMail({
      from: '"Diário de Treinos" <noreply@diariotreinos.com>',
      to: email,
      subject: 'Recuperação de Senha - Diário de Treinos',
      html: `<p>Você solicitou uma recuperação de senha.</p>
             <p>Clique neste link para redefinir sua senha (válido por 1 hora):</p>
             <a href="${resetURL}">${resetURL}</a>`
  });

    res.status(200).json({ message: 'Se um usuário com este e-mail existir, um link de recuperação será enviado.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ocorreu um erro ao processar a solicitação.' });
  }
});

// rota para redefinir senha
app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { senha } = req.body;

  try {
    // 1. Criptografar o token que veio da URL para o comparar com o do banco
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Encontrar o usuário que tem este token e que não tenha expirado
    const usuario = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpires: { gte: new Date() }, // "gte" = Maior ou igual (ou seja, não expirou)
      },
    });

    // 3. Se o token for inválido ou tiver expirado
    if (!usuario) {
      return res.status(400).json({ message: 'Token de recuperação inválido ou expirado.' });
    }

    // 4. Criptografar a NOVA senha
    const hashDaNovaSenha = await bcrypt.hash(senha, 10);

    // 5. Atualizar o usuário com a nova senha e limpar os campos de reset
    await prisma.user.update({
      where: { id: usuario.id },
      data: {
        senha: hashDaNovaSenha,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    res.status(200).json({ message: 'Senha redefinida com sucesso!' });

  } catch (error) {
    console.error("### ERRO NO /reset-password: ###", error);
    res.status(500).json({ message: 'Ocorreu um erro ao redefinir a senha.' });
  }
});

// --- ROTAS DE FICHAS DE TREINO (SEMANA 4) ---
// Esta eh a primeira rota *protegida*!

app.get('/fichas', authMiddleware, async (req, res) => {
  // O Express vai executar o (auth.js) priemeiro, como se fosse um seguranca.
  // Se o token for válido, o auth.js vai chamar o next() e este código aqui sera executado.
  // Se o token for inválido, o auth.js vai retornar o erro 401 e este código NUNCA sera executado.

  try {
    // pelo middle que colocou o id do usuario no req
    // posso agora buscar SOMENTE as fichas que pertencem ao usuário logado.
    const fichasDoUsuario = await prisma.fichaTreino.findMany({
      where: {
        usuarioId: req.userId // O ID que o middleware deu
      }
    });

    res.status(200).json(fichasDoUsuario);

  } catch (error) {
    console.error("### ERRO NO GET /fichas: ###", error);
    res.status(500).json({ message: 'Ocorreu um erro ao buscar as fichas de treino.' });
  }
});


// --- FIM DAS ROTAS ---

// inicializa o servidor na porta 3333
const PORTA = 3333;
app.listen(PORTA, () => {
    console.log( `servidor rodando na porta http://localhost:${PORTA}` );
});

