const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'loja_games_db',
    password: 'diektop123', // <--- SUA SENHA AQUI
    port: 5432,
});

module.exports = pool;