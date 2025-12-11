const pool = require('../server/db');

// --- CATEGORIAS ---
exports.listarCategorias = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorias ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- JOGOS ---
exports.listarParaAdmin = async (req, res) => {
    const sql = `SELECT j.*, array_agg(jc.categoria_id) as categorias_ids FROM jogos j LEFT JOIN jogo_categorias jc ON j.id = jc.jogo_id GROUP BY j.id ORDER BY j.id DESC`;
    const result = await pool.query(sql);
    res.json(result.rows);
};

exports.adicionarJogo = async (req, res) => {
    const { titulo, preco, imagem_url, categoriaIds } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const resJogo = await client.query('INSERT INTO jogos (titulo, preco, imagem_url) VALUES ($1, $2, $3) RETURNING id', [titulo, preco, imagem_url]);
        const jogoId = resJogo.rows[0].id;
        if (categoriaIds) {
            for (const catId of categoriaIds) await client.query('INSERT INTO jogo_categorias (jogo_id, categoria_id) VALUES ($1, $2)', [jogoId, catId]);
        }
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); } finally { client.release(); }
};

exports.editarJogo = async (req, res) => {
    const { id } = req.params;
    const { titulo, preco, imagem_url, categoriaIds } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('UPDATE jogos SET titulo = $1, preco = $2, imagem_url = $3 WHERE id = $4', [titulo, preco, imagem_url, id]);
        await client.query('DELETE FROM jogo_categorias WHERE jogo_id = $1', [id]);
        if (categoriaIds) {
            for (const catId of categoriaIds) await client.query('INSERT INTO jogo_categorias (jogo_id, categoria_id) VALUES ($1, $2)', [id, catId]);
        }
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); } finally { client.release(); }
};

exports.deletarJogo = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM jogos WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- USUÁRIOS ---
exports.listarUsuarios = async (req, res) => {
    try {
        const sql = `SELECT u.id, u.email, u.is_admin, p.nome_completo FROM usuarios u LEFT JOIN perfis p ON u.id = p.usuario_id ORDER BY u.id ASC`;
        const result = await pool.query(sql);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.toggleAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE usuarios SET is_admin = NOT is_admin WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- PEDIDOS ---
exports.listarTodosPedidos = async (req, res) => {
    try {
        const sql = `
            SELECT p.id, p.data_pedido, p.total, p.status, p.forma_pagamento, 
                   u.email as cliente_email,
                   json_agg(json_build_object('id', j.id, 'titulo', j.titulo)) as itens
            FROM pedidos p
            JOIN usuarios u ON p.usuario_id = u.id
            JOIN itens_pedido ip ON p.id = ip.pedido_id
            JOIN jogos j ON ip.jogo_id = j.id
            GROUP BY p.id, u.email
            ORDER BY p.data_pedido DESC
        `;
        const result = await pool.query(sql);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.atualizarStatusPedido = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await pool.query('UPDATE pedidos SET status = $1 WHERE id = $2', [status, id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deletarPedido = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM itens_pedido WHERE pedido_id = $1', [id]);
        await client.query('DELETE FROM pedidos WHERE id = $1', [id]);
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); } finally { client.release(); }
};

exports.editarItensPedido = async (req, res) => {
    const { id } = req.params;
    const { novosJogosIds } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM itens_pedido WHERE pedido_id = $1', [id]);
        let novoTotal = 0;
        if (novosJogosIds && novosJogosIds.length > 0) {
            for (const jogoId of novosJogosIds) {
                const resJogo = await client.query('SELECT preco FROM jogos WHERE id = $1', [jogoId]);
                const preco = resJogo.rows[0].preco;
                await client.query('INSERT INTO itens_pedido (pedido_id, jogo_id, preco_unitario) VALUES ($1, $2, $3)', [id, jogoId, preco]);
                novoTotal += parseFloat(preco);
            }
        }
        await client.query('UPDATE pedidos SET total = $1 WHERE id = $2', [novoTotal, id]);
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); } finally { client.release(); }
};

// --- RELATÓRIOS (NOVO) ---
exports.relatorioVendasMensais = async (req, res) => {
    try {
        const sql = `
            SELECT TO_CHAR(data_pedido, 'MM/YYYY') as mes, SUM(total) as receita, COUNT(id) as qtd_pedidos
            FROM pedidos WHERE status != 'Cancelado'
            GROUP BY mes ORDER BY MIN(data_pedido) DESC
        `;
        const result = await pool.query(sql);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.relatorioCategorias = async (req, res) => {
    try {
        const sql = `
            SELECT c.nome, COUNT(ip.id) as itens_vendidos, SUM(ip.preco_unitario) as faturamento
            FROM itens_pedido ip
            JOIN pedidos p ON ip.pedido_id = p.id
            JOIN jogos j ON ip.jogo_id = j.id
            JOIN jogo_categorias jc ON j.id = jc.jogo_id
            JOIN categorias c ON jc.categoria_id = c.id
            WHERE p.status != 'Cancelado'
            GROUP BY c.nome ORDER BY faturamento DESC
        `;
        const result = await pool.query(sql);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};