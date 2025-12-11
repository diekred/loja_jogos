const pool = require('../server/db');
const bcrypt = require('bcrypt'); // Importa a biblioteca de criptografia

exports.login = async (req, res) => {
    const { email, senha } = req.body;
    
    try {
        // 1. Busca o usuário pelo email
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if (result.rows.length > 0) {
            const user = result.rows[0];

            // 2. COMPARA A SENHA: Verifica se a senha digitada bate com a Hash do banco
            // (user.senha agora é um código louco tipo $2b$10$...)
            const match = await bcrypt.compare(senha, user.senha);

            if (match) {
                // Senha correta! Cria o cookie
                res.cookie('usuarioLogado', user.id, { httpOnly: true }); 
                res.json({ success: true, userId: user.id });
            } else {
                // Senha errada
                res.status(401).json({ success: false, message: 'Senha incorreta' });
            }
        } else {
            res.status(401).json({ success: false, message: 'Usuário não encontrado' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.cadastro = async (req, res) => {
    const { email, senha, nome, cpf } = req.body;
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. CRIPTOGRAFA A SENHA
        // O número 10 é o "custo" (quanto mais alto, mais seguro e mais lento)
        const hashedPassword = await bcrypt.hash(senha, 10);

        // 2. Salva o usuário com a senha CRIPTOGRAFADA (hashedPassword)
        const resUser = await client.query(
            'INSERT INTO usuarios (email, senha) VALUES ($1, $2) RETURNING id', 
            [email, hashedPassword]
        );
        const userId = resUser.rows[0].id;

        // 3. Cria o perfil
        await client.query(
            'INSERT INTO perfis (usuario_id, nome_completo, cpf) VALUES ($1, $2, $3)', 
            [userId, nome, cpf]
        );

        await client.query('COMMIT');
        res.json({ success: true });
    } catch (e) {
        await client.query('ROLLBACK');
        // Tratamento de erro para email duplicado
        if (e.code === '23505') {
            res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
        } else {
            res.status(500).json({ success: false, error: e.message });
        }
    } finally {
        client.release();
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
        const result = await pool.query(sql, [userId]);
        
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