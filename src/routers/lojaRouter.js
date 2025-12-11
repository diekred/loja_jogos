const express = require('express');
const router = express.Router();
const controller = require('../controllers/lojaController');

router.get('/jogos', controller.listarJogos);
router.post('/checkout', controller.checkout);
router.get('/meus-pedidos', controller.listarMeusPedidos);
router.get('/cartoes', controller.listarCartoes);
router.delete('/cartoes/:id', controller.deletarCartao);
router.get('/jogos-comprados', controller.verificarJogosComprados); // <--- NOVA ROTA

module.exports = router;