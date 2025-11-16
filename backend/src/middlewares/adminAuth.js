// este eh o middleware de "Nível 2"
function adminAuthMiddleware(req, res, next) {

  // 1. O auth.js ja rodou e carimbou o req.userNivel
  // se nao houver 'userNivel', algo deu muito errado (embora o auth.js devesse ter pego)
  if (!req.userNivel) {
    return res.status(500).json({ message: 'Erro interno na verificação de permissão.' });
  }

  // 2. a verificaçao principal
  if (req.userNivel !== 'admin') {
    // se o usuario NAO eh um admin...
    return res.status(403).json({ message: 'Acesso negado. Esta rota é restrita a administradores.' });
  }

  // 3. se for admin, pode passar
  return next();
}

module.exports = adminAuthMiddleware;