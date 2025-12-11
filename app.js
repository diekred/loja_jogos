const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

const authRouter = require('./src/routers/authRouter');
const lojaRouter = require('./src/routers/lojaRouter');
const adminRouter = require('./src/routers/adminRouter');

app.use('/auth', authRouter);
app.use('/api', lojaRouter);
app.use('/admin', adminRouter);

// Redireciona raiz para o login
app.get('/', (req, res) => {
    res.redirect('/auth/index.html');
});

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});