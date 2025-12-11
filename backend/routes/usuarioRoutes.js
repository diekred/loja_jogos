const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuarioController');

// Middleware de Segurança (para garantir que só Admin acesse)
const checkAdmin = async (req, res, next) => {
    const { query } = require('../database');
    const userId = req.cookies.usuarioLogado;
    if(!userId) return res.status(401).send('Não logado');
    
    const result = await query('SELECT is_admin FROM usuarios WHERE id = $1', [userId]);
    if(result.rows[0] && result.rows[0].is_admin) next();
    else res.status(403).send('Acesso Negado');
};

router.use(checkAdmin);

router.get('/', controller.listarTodos);
router.put('/:id/toggle', controller.toggleAdmin);

module.exports = router;