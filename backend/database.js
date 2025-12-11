const { Pool } = require('pg');

// Configuração da conexão com o banco de dados PostgreSQL
const dbConfig = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',        // Seu usuário
  password: 'diektop123',  // Sua senha (do seu arquivo original)
  database: 'loja_games_db', // Seu banco de dados
  
  // Configurações específicas do PostgreSQL (do código do professor)
  ssl: false,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const schema = 'public';

// Pool de conexões para melhor performance
const pool = new Pool({
  ...dbConfig,
  max: 10,
  min: 0,
  idle: 10000,
  acquire: 30000,
  evict: 1000
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool de conexões:', err);
  process.exit(-1);
});

// Função para testar a conexão
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Conectado ao PostgreSQL com sucesso!');
    await client.query('SET search_path TO ' + schema);
    client.release();
    return true;
  } catch (err) {
    console.error('Erro ao conectar com o PostgreSQL:', err);
    return false;
  }
};

// Função para executar queries
const query = async (text, params) => {
  const client = await pool.connect();
  try {
    await client.query('SET search_path TO public');
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Erro ao executar query:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Função para transações (BEGIN/COMMIT/ROLLBACK)
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro na transação:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query,
  transaction,
  testConnection
};