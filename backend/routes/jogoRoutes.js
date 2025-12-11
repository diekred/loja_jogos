const express = require('express');
const router = express.Router();
const jogoController = require('../controllers/jogoController');

// Middleware simples para checar se é admin
// (No futuro podemos melhorar isso, mas vamos manter simples por enquanto)
const checkAdmin = async (req, res, next) => {
    const userId = req.cookies.usuarioLogado;
    if(!userId) return res.status(401).send('Não logado');
    
    // Precisamos acessar o banco via req.db ou importando direto
    const { query } = require('../database'); 
    try {
        const result = await query('SELECT is_admin FROM usuarios WHERE id = $1', [userId]);
        if(result.rows[0] && result.rows[0].is_admin) {
            next();
        } else {
            res.status(403).send('Acesso Negado: Apenas Admins');
        }
    } catch(e) {
        res.status(500).send(e.message);
    }
};

// Rotas Públicas (Qualquer um pode ver categorias, se quiser)
router.get('/categorias', jogoController.listarCategorias);

// Rotas Protegidas (Só Admin mexe)
router.use(checkAdmin); 

router.get('/', jogoController.listarTodos);      // Listar jogos no painel
router.get('/:id', jogoController.obterJogo);     // Pegar dados de um jogo
router.post('/', jogoController.adicionarJogo);   // Criar
router.put('/:id', jogoController.editarJogo);    // Editar
router.delete('/:id', jogoController.deletarJogo);// Deletar

module.exports = router;