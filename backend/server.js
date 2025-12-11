const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');

// Importar a configuração do banco PostgreSQL
const db = require('./database'); 

// Configurações do servidor
const HOST = 'localhost'; 
const PORT_FIXA = 3000; 

// Configura a pasta do frontend (agora chamada 'frontend')
const caminhoFrontend = path.join(__dirname, '../frontend');
console.log('📂 Caminho frontend:', caminhoFrontend);

app.use(express.static(caminhoFrontend));

// Middlewares Padrão
app.use(express.json());
app.use(cookieParser());

// Middleware de CORS (Segurança de acesso)
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); 
  }
  next();
});

// Middleware para disponibilizar o banco nas requisições
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Tratamento de JSON malformado
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON malformado',
      message: 'Verifique a sintaxe do JSON enviado'
    });
  }
  next(err);
});

// =============================================================
// DEFINIÇÃO DAS ROTAS
// =============================================================

// 1. Autenticação (Login/Cadastro)
const loginRoutes = require('./routes/loginRoutes');
app.use('/auth', loginRoutes);

// 2. Loja (Visão do Cliente)
const lojaRoutes = require('./routes/lojaRoutes');
app.use('/api', lojaRoutes);

// 3. Área Administrativa (Protegida)
const jogoRoutes = require('./routes/jogoRoutes');
app.use('/admin/jogos', jogoRoutes);

const usuarioRoutes = require('./routes/usuarioRoutes');
app.use('/admin/usuarios', usuarioRoutes);

const pedidoRoutes = require('./routes/pedidoRoutes');
app.use('/admin/pedidos', pedidoRoutes);

// =============================================================

// Rota Raiz: Redireciona para o novo caminho do Login
app.get('/', (req, res) => {
    res.redirect('/login/login.html');
});

// Health Check
app.get('/health', async (req, res) => {
  try {
    const connectionTest = await db.testConnection();
    if (connectionTest) {
      res.status(200).json({ status: 'OK', message: 'Servidor e Banco ON!' });
    } else {
      res.status(500).json({ status: 'ERROR', message: 'Banco desconectado' });
    }
  } catch (error) {
    res.status(500).json({ status: 'ERROR', error: error.message });
  }
});

// Middleware global de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro não tratado:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: err.message
  });
});

// Inicialização
const startServer = async () => {
  try {
    console.log('⏳ Testando conexão com PostgreSQL...');
    const connectionTest = await db.testConnection();

    if (!connectionTest) {
      console.error('❌ Falha na conexão com PostgreSQL');
      process.exit(1);
    }

    const PORT = process.env.PORT || PORT_FIXA;
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor rodando em http://${HOST}:${PORT}`);
      console.log(`🗄️  Banco de dados: Conectado`);
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

// Encerramento gracioso
process.on('SIGINT', async () => {
  console.log('\n🔄 Encerrando servidor...');
  try {
    await db.pool.end();
    console.log('✅ Conexões encerradas');
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
});

startServer();