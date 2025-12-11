const { query } = require('../database');

exports.listarTodos = async (req, res) => {
    try {
        const sql = `SELECT u.id, u.email, u.is_admin, p.nome_completo 
                     FROM usuarios u 
                     LEFT JOIN perfis p ON u.id = p.usuario_id 
                     ORDER BY u.id ASC`;
        const result = await query(sql);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.toggleAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        await query('UPDATE usuarios SET is_admin = NOT is_admin WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};