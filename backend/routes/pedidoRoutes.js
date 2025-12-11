const express = require('express');
const router = express.Router();
const controller = require('../controllers/pedidoController');

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
router.put('/:id/status', controller.atualizarStatus);
router.delete('/:id', controller.deletar);

// --- ROTA QUE FALTAVA ---
router.put('/:id/itens', controller.editarItensPedido);

router.get('/relatorios/mensal', controller.relatorioMensal);
router.get('/relatorios/categorias', controller.relatorioCategorias);

module.exports = router;