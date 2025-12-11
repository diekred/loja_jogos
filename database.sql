-- ==========================================================
-- 1. SCRIPT DE LIMPEZA E CRIAÇÃO (ESTRUTURA MELHORADA)
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
    senha VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Perfis
CREATE TABLE perfis (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    nome_completo VARCHAR(150),
    cpf VARCHAR(14)
);

-- 3. Tabela de Categorias
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

-- 4. Tabela de Jogos (Melhorada com Descrição e Destaque)
CREATE TABLE jogos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT, -- Sinopse do jogo
    preco DECIMAL(10,2) NOT NULL,
    imagem_url TEXT,
    destaque BOOLEAN DEFAULT FALSE, -- Para banners na home
    data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabela Pivô (Jogos <-> Categorias)
CREATE TABLE jogo_categorias (
    jogo_id INTEGER REFERENCES jogos(id) ON DELETE CASCADE,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE CASCADE,
    PRIMARY KEY (jogo_id, categoria_id)
);

-- 6. Tabela de Pedidos
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL, -- Se apagar usuário, mantemos o histórico financeiro
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2),
    forma_pagamento VARCHAR(20),
    status VARCHAR(50) DEFAULT 'Pendente',
    detalhes_pagamento TEXT
);

-- 7. Itens do Pedido
CREATE TABLE itens_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
    -- AQUI ESTÁ A MÁGICA: Se deletar o jogo, ele some do pedido automaticamente
    jogo_id INTEGER REFERENCES jogos(id) ON DELETE CASCADE, 
    preco_unitario DECIMAL(10,2)
);

-- 8. Cartões de Crédito
CREATE TABLE cartoes_credito (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    nome_titular VARCHAR(100),
    final_cartao VARCHAR(4),
    bandeira VARCHAR(20)
);

-- ==========================================================
-- 2. POPULAÇÃO DE DADOS (CARGA INICIAL ROBUSTA)
-- ==========================================================

-- 2.1 Categorias (Lista Expandida)
INSERT INTO categorias (nome) VALUES 
('Ação'), ('Aventura'), ('RPG'), ('Terror'), ('Corrida'), 
('Estratégia'), ('Esportes'), ('FPS (Tiro)'), ('Battle Royale'), 
('Mundo Aberto'), ('Stealth'), ('Sobrevivência'), ('Luta'), 
('Plataforma'), ('Puzzle'), ('Simulador'), ('MMO'), 
('Indie'), ('Retrô'), ('Souls-like');

-- 2.2 Jogos Exemplo
INSERT INTO jogos (titulo, preco, imagem_url, descricao, destaque) VALUES 
(
    'Resident Evil 4 Remake', 
    199.90, 
    'https://image.api.playstation.com/vulcan/ap/rnd/202210/0706/EVWyZD63pahuh95eKloFaJuC.png',
    'A sobrevivência é apenas o começo. Seis anos se passaram desde o desastre biológico em Raccoon City. Leon S. Kennedy foi enviado para resgatar a filha do presidente.',
    TRUE
),
(
    'EA SPORTS FC 24', 
    299.90, 
    'https://image.api.playstation.com/vulcan/ap/rnd/202307/1715/1c5d9856-1b4e-48a0-8d58-745a90184457.png',
    'Sinta o jogo. A experiência mais autêntica de futebol com mais de 19.000 jogadores licenciados e 700 times.',
    FALSE
),
(
    'God of War Ragnarök', 
    249.50, 
    'https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/4xJ8XB3bi888QTLZYdl7Oi0s.png',
    'Kratos e Atreus devem viajar pelos Nove Reinos em busca de respostas enquanto as forças asgardianas se preparam para uma batalha profetizada.',
    TRUE
),
(
    'Elden Ring', 
    229.90, 
    'https://image.api.playstation.com/vulcan/ap/rnd/202110/2000/phvVT0qZfcRms5qDAk0SI3CM.png',
    'Levante-se, Maculado, e seja guiado pela graça para portar o poder do Anel Prístino e se tornar um Lorde Prístino nas Terras Intermédias.',
    TRUE
),
(
    'Grand Theft Auto V', 
    89.90, 
    'https://image.api.playstation.com/vulcan/ap/rnd/202202/2816/mYn2ETBTFzwp1g5AJ8qPT1zs.png',
    'Um jovem traficante, um assaltante de bancos aposentado e um psicopata aterrorizante precisam realizar uma série de golpes para sobreviver.',
    FALSE
);

-- 2.3 Relacionamento Jogos <-> Categorias
-- RE4: Terror (4), Ação (1), Sobrevivência (12)
INSERT INTO jogo_categorias (jogo_id, categoria_id) VALUES (1, 4), (1, 1), (1, 12);

-- FC 24: Esportes (7), Simulador (16)
INSERT INTO jogo_categorias (jogo_id, categoria_id) VALUES (2, 7), (2, 16);

-- God of War: Ação (1), Aventura (2)
INSERT INTO jogo_categorias (jogo_id, categoria_id) VALUES (3, 1), (3, 2);

-- Elden Ring: RPG (3), Mundo Aberto (10), Souls-like (20)
INSERT INTO jogo_categorias (jogo_id, categoria_id) VALUES (4, 3), (4, 10), (4, 20);

-- GTA V: Ação (1), Mundo Aberto (10)
INSERT INTO jogo_categorias (jogo_id, categoria_id) VALUES (5, 1), (5, 10);