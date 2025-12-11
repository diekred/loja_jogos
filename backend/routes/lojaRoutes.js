const express = require('express');
const router = express.Router();
const lojaController = require('../controllers/lojaController');

router.get('/jogos', lojaController.listarJogos);
router.post('/checkout', lojaController.checkout);
router.get('/meus-pedidos', lojaController.listarMeusPedidos);
router.get('/cartoes', lojaController.listarCartoes);
router.delete('/cartoes/:id', lojaController.deletarCartao);
router.get('/jogos-comprados', lojaController.verificarJogosComprados);

module.exports = router;