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

// --- ROTA PARA CRIAR UMA NOVA FICHA (SEMANA 4) ---
// (Verbo POST para /fichas)
app.post('/fichas', authMiddleware, async (req, res) => {
  // 1. o authMiddleware ja rodou e verificou o token e deu o req.userID
  try {
    // 2. pega o nome da nova ficha do corpo da requisicao
    const { nomeFicha } = req.body;

    // 3. valida se o nome foi enviado
    if (!nomeFicha) {
      return res.status(400).json({ message: 'O nome da ficha é obrigatório.' });
    }

    // 4. cria a nova ficha no banco de dados com prisma
    const novaFicha = await prisma.fichaTreino.create({
      data: {
        nomeFicha: nomeFicha,
        usuarioId: req.userId // conecta a ficha ao usuario logado
      }
    });

    // 5. retorna a ficha que acabou de ser criada
    res.status(201).json(novaFicha);

  } catch (error) {
    console.error("### ERRO NO POST /fichas: ###", error);
    res.status(500).json({ message: 'Ocorreu um erro ao criar a ficha de treino.' });
  }
});
  
// --- ROTA PARA ATUALIZAR UMA FICHA (SEMANA 4) ---
// (Verbo PUT para /fichas/ID_DA_FICHA)

app.put('/fichas/:id', authMiddleware, async (req, res) => {
  // 1. o authMiddleware ja validou o token

  try {
    // 2. pegar o ID da ficha da url
    const { id } = req.params;
    // 3. pegar o novo nome da ficha do corpo de requisicao
    const { nomeFicha } = req.body;

    // 4. validar se o nome foi enviado
    if (!nomeFicha) {
      return res.status(400).json({ message: 'O nome da ficha é obrigatório' });
    }

    // 5. atualiza a ficha no banco
    const fichaAtualizada = await prisma.fichaTreino.update({
      where: {
        id: parseInt(id), // converte o ID da URL que eh texto para numero
        usuarioId: req.userId // garante que o usario so pode editar as proprias fichas
      },
      data: {
        nomeFicha: nomeFicha
      }
    });

    // 6. retorna a ficha que foi atualizada
    res.status(200).json(fichaAtualizada);

  }  catch (error) {
    // Se o update falhar (ex: ficha não encontrada ou não pertence ao usuário)
    console.error("### ERRO NO PUT /fichas/:id : ###", error);
    res.status(404).json({ message: 'Ficha não encontrada ou não pertence a este usuário.' });
  }
});

// --- ROTA PARA DELETAR UMA FICHA (SEMANA 4) ---
// (Verbo DELETE para /fichas/ID_DA_FICHA)
app.delete('/fichas/:id', authMiddleware, async (req, res) => {
  // 1. o authMiddleware ja verificou o token

  try {
    // 2. pega o id da ficha da url
    const { id } = req.params;

  // 3. deletar a ficha do banco
  // uso "deleteMany" pois ele permite um "where" complexo
  // vai procurar por uma ficha que tenha esse id e pertece a esse usuario
  const deleteResult = await prisma.fichaTreino.deleteMany({
      where: {
        id: parseInt(id), // pega a id da url e converte em numero
        usuarioId: req.userId // garante que o usuário só pode deletar as proprias fichas
      }
    });

    // 4. verifica se algo realmente foi apagado
    // se o deleteResult.count for 0 significa que a ficha nao foi encontrada ou pertece a outro usuario
    if (deleteResult.count === 0) {
      return res.status(404).json({ message: 'Ficha não encontrada ou não pertence a este usuário.' });
    }

    // 5. retorna uma resposta de sucesso (mas sem conteudo)
    res.status(204).send(); // 204 = no Content sucesso, mas não há nada para enviar de volta)

    } catch (error) {
      console.error("### ERRO NO DELETE /fichas/:id : ###", error);
      res.status(500).json({ message: 'Ocorreu um erro ao deletar a ficha de treino.' });
    }
  });










// --- FIM DAS ROTAS ---

// inicializa o servidor na porta 3333
const PORTA = 3333;
app.listen(PORTA, () => {
    console.log( `servidor rodando na porta http://localhost:${PORTA}` );
});

