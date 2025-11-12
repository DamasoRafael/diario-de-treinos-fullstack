const jwt = require('jsonwebtoken');

// o secret do cracha, que o servidor usa para verificar a assinatura
// carregar do .env, assim como fiz no server.js
const JWT_SECRET = process.env.JWT_SECRET;

// middleware
function authMiddleware(req, res, next) {

    // depuracao de erro na criacao da ficha
     // console.log('### CABEÇALHOS RECEBIDOS PELO SEGURANÇA: ###', req.headers);

    // 1. o padrao eh enviar o token no cabecalho (header) da requisicao
    const authHeader = req.headers.authorization;

    // 2. verifica se o token foi enviado
    if (!authHeader) {
        return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    }

    // 3. o cabecalho vem como Bearer Token. Eh preciso separar o token.
    const parts = authHeader.split(' '); // separa no espaco

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Token em formato invalido'});
    }

    const token = parts[1]; // Token JWT puro


    // 4. verifica se o token eh valido
    try {
        // jwt.verify() decodifica o token usando o segredo
        // Se o token for inválido ou expirado, ele vai "explodir" um erro
        const decoded = jwt.verify(token, JWT_SECRET);

        // 5. o token eh valido
        // anexa as informacoes do usuario na requisicao (ex: id)
        // para que a rota do CRUD saiba quem fez o pedido
        req.userId = decoded.id;

        // 6. continua para a proxima funcao
        return next();
    } catch (error) {
        // 7. falhou, o cracha eh invalido ou expirado
        return res.status(401).json({ message: 'Token invalido ou expirado'});
    }
}

module.exports = authMiddleware;