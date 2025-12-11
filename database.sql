-- ==========================================================
-- 1. SCRIPT DE CRIAÇÃO (ZERAR E CRIAR TABELAS)
-- ==========================================================

-- Remove tabelas antigas se existirem (nessa ordem por causa das dependências)
DROP TABLE IF EXISTS cartoes_credito CASCADE;
DROP TABLE IF EXISTS itens_pedido CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS jogo_categorias CASCADE;
DROP TABLE IF EXISTS jogos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS perfis CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- 1. Tabela de Usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL, -- Tamanho aumentado para o Hash
    is_admin BOOLEAN DEFAULT FALSE
);

-- 2. Tabela de Perfis (1:1 com Usuários)
CREATE TABLE perfis (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    nome_completo VARCHAR(150),
    cpf VARCHAR(14)
);

-- 3. Tabela de Categorias
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

-- 4. Tabela de Jogos
CREATE TABLE jogos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    imagem_url TEXT
);

-- 5. Tabela Pivô (N:M - Jogos possuem várias categorias)
CREATE TABLE jogo_categorias (
    jogo_id INTEGER REFERENCES jogos(id) ON DELETE CASCADE,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE CASCADE,
    PRIMARY KEY (jogo_id, categoria_id)
);

-- 6. Tabela de Pedidos
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2),
    forma_pagamento VARCHAR(20),
    status VARCHAR(50) DEFAULT 'Pendente',
    detalhes_pagamento TEXT -- Guarda o código Pix ou final do cartão
);

-- 7. Itens do Pedido (O que foi comprado)
CREATE TABLE itens_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
    jogo_id INTEGER REFERENCES jogos(id),
    preco_unitario DECIMAL(10,2)
);

-- 8. Cartões de Crédito Salvos (NOVO)
CREATE TABLE cartoes_credito (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    nome_titular VARCHAR(100),
    final_cartao VARCHAR(4), -- Salva apenas os 4 últimos dígitos
    bandeira VARCHAR(20)
);

-- ==========================================================
-- 2. SCRIPT DE POPULAÇÃO (DADOS INICIAIS)
-- ==========================================================

-- Inserir Categorias Padrão
INSERT INTO categorias (nome) VALUES 
('Ação'), 
('Aventura'), 
('RPG'), 
('Terror'), 
('Corrida'), 
('Estratégia'), 
('Esportes');

-- Inserir Alguns Jogos de Exemplo
INSERT INTO jogos (titulo, preco, imagem_url) VALUES 
('Resident Evil 4', 199.90, 'https://image.api.playstation.com/vulcan/ap/rnd/202210/0706/EVWyZD63pahuh95eKloFaJuC.png'),
('FIFA 24', 299.90, 'https://image.api.playstation.com/vulcan/ap/rnd/202307/1715/1c5d9856-1b4e-48a0-8d58-745a90184457.png'),
('God of War Ragnarok', 249.50, 'https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/4xJ8XB3bi888QTLZYdl7Oi0s.png');

-- Ligar Jogos às Categorias
-- RE4 é Terror (4) e Ação (1)
INSERT INTO jogo_categorias (jogo_id, categoria_id) VALUES (1, 4), (1, 1);
-- FIFA é Esportes (7)
INSERT INTO jogo_categorias (jogo_id, categoria_id) VALUES (2, 7);
-- GoW é Ação (1) e Aventura (2)
INSERT INTO jogo_categorias (jogo_id, categoria_id) VALUES (3, 1), (3, 2);

-- OBSERVAÇÃO SOBRE USUÁRIOS:
-- Como implementamos criptografia (bcrypt), não podemos inserir o usuário Admin
-- diretamente por aqui com a senha "1234", pois ela precisa ser um Hash.
-- RECOMENDAÇÃO: Crie o usuário pelo site e depois rode:
-- UPDATE usuarios SET is_admin = TRUE WHERE email = 'seu_email@teste.com';