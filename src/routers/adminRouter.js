const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminController');

const checkAdmin = async (req, res, next) => {
    const pool = require('../server/db');
    const userId = req.cookies.usuarioLogado;
    if(!userId) return res.status(401).send('Não logado');
    const result = await pool.query('SELECT is_admin FROM usuarios WHERE id = $1', [userId]);
    if(result.rows[0] && result.rows[0].is_admin) next();
    else res.status(403).send('Acesso Negado');
};

router.use(checkAdmin);

// Rotas existentes
router.get('/jogos', controller.listarParaAdmin);
router.post('/jogos', controller.adicionarJogo);
router.put('/jogos/:id', controller.editarJogo);
router.delete('/jogos/:id', controller.deletarJogo);
router.get('/categorias', controller.listarCategorias);
router.get('/usuarios', controller.listarUsuarios);
router.put('/usuarios/:id/toggle', controller.toggleAdmin);
router.get('/pedidos', controller.listarTodosPedidos);
router.put('/pedidos/:id/status', controller.atualizarStatusPedido);
router.delete('/pedidos/:id', controller.deletarPedido);
router.put('/pedidos/:id/itens', controller.editarItensPedido);

// NOVAS ROTAS DE RELATÓRIO
router.get('/relatorios/mensal', controller.relatorioVendasMensais);
router.get('/relatorios/categorias', controller.relatorioCategorias);

module.exports = router;