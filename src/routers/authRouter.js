const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');

router.post('/login', controller.login);
router.post('/cadastro', controller.cadastro);
router.post('/logout', controller.logout);
router.get('/check', controller.checkAuth);

module.exports = router;