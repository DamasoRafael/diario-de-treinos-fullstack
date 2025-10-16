-- Tabela de Usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nivel VARCHAR(50) NOT NULL DEFAULT 'padrao', -- 'padrao' ou 'admin'
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Fichas de Treino
CREATE TABLE fichas_treino (
    id SERIAL PRIMARY KEY,
    nome_ficha VARCHAR(255) NOT NULL,
    usuario_id INTEGER NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de Exercícios
CREATE TABLE exercicios (
    id SERIAL PRIMARY KEY,
    nome_exercicio VARCHAR(255) NOT NULL,
    series INTEGER NOT NULL,
    repeticoes VARCHAR(50) NOT NULL,
    ficha_id INTEGER NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (ficha_id) REFERENCES fichas_treino(id) ON DELETE CASCADE
);