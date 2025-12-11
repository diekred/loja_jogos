const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

// Define os endereços
router.post('/login', loginController.login);
router.post('/cadastro', loginController.cadastro);
router.post('/logout', loginController.logout);
router.get('/check', loginController.checkAuth);

module.exports = router;