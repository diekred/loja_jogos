const { query, transaction } = require('../database');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
    const { email, senha } = req.body;
    
    try {
        const result = await query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const match = await bcrypt.compare(senha, user.senha);

            if (match) {
                // Cria o cookie exatamente como você fazia
                res.cookie('usuarioLogado', user.id, { httpOnly: true }); 
                res.json({ success: true, userId: user.id });
            } else {
                res.status(401).json({ success: false, message: 'Senha incorreta' });
            }
        } else {
            res.status(401).json({ success: false, message: 'Usuário não encontrado' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.cadastro = async (req, res) => {
    const { email, senha, nome, cpf } = req.body;
    
    // Usamos a função 'transaction' do novo database.js para garantir segurança
    try {
        await transaction(async (client) => {
            const hashedPassword = await bcrypt.hash(senha, 10);

            const resUser = await client.query(
                'INSERT INTO usuarios (email, senha) VALUES ($1, $2) RETURNING id', 
                [email, hashedPassword]
            );
            const userId = resUser.rows[0].id;

            await client.query(
                'INSERT INTO perfis (usuario_id, nome_completo, cpf) VALUES ($1, $2, $3)', 
                [userId, nome, cpf]
            );
        });

        res.json({ success: true });
    } catch (e) {
        if (e.code === '23505') {
            res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
        } else {
            res.status(500).json({ success: false, error: e.message });
        }
    }
};

exports.logout = (req, res) => {
    res.clearCookie('usuarioLogado');
    res.json({ success: true });
};

exports.checkAuth = async (req, res) => {
    const userId = req.cookies.usuarioLogado;
    if (!userId) return res.json({ loggedIn: false });

    try {
        const sql = `
            SELECT p.nome_completo, u.is_admin 
            FROM perfis p 
            JOIN usuarios u ON p.usuario_id = u.id 
            WHERE p.usuario_id = $1
        `;
        const result = await query(sql, [userId]);
        
        if (result.rows.length > 0) {
            res.json({ 
                loggedIn: true, 
                nome: result.rows[0].nome_completo, 
                isAdmin: result.rows[0].is_admin 
            });
        } else {
            res.json({ loggedIn: false });
        }
    } catch (err) {
        res.status(500).json({ loggedIn: false });
    }
};