const { query, transaction } = require('../database');

// Listar todos os pedidos para o Admin ver
exports.listarTodos = async (req, res) => {
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
        const result = await query(sql);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Mudar status (ex: Pendente -> Pago)
exports.atualizarStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await query('UPDATE pedidos SET status = $1 WHERE id = $2', [status, id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Deletar pedido
exports.deletar = async (req, res) => {
    const { id } = req.params;
    try {
        await transaction(async (client) => {
            await client.query('DELETE FROM itens_pedido WHERE pedido_id = $1', [id]);
            await client.query('DELETE FROM pedidos WHERE id = $1', [id]);
        });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Relatórios
exports.relatorioMensal = async (req, res) => {
    try {
        const sql = `
            SELECT TO_CHAR(data_pedido, 'MM/YYYY') as mes, SUM(total) as receita, COUNT(id) as qtd_pedidos
            FROM pedidos WHERE status != 'Cancelado'
            GROUP BY mes ORDER BY MIN(data_pedido) DESC
        `;
        const result = await query(sql);
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
        const result = await query(sql);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- ESSA FUNÇÃO ESTAVA FALTANDO ---
exports.editarItensPedido = async (req, res) => {
    const { id } = req.params;
    const { novosJogosIds } = req.body;

    try {
        await transaction(async (client) => {
            // 1. Remove itens antigos
            await client.query('DELETE FROM itens_pedido WHERE pedido_id = $1', [id]);
            
            let novoTotal = 0;
            
            // 2. Insere novos itens e recalcula total
            if (novosJogosIds && novosJogosIds.length > 0) {
                for (const jogoId of novosJogosIds) {
                    const resJogo = await client.query('SELECT preco FROM jogos WHERE id = $1', [jogoId]);
                    const preco = resJogo.rows[0].preco;
                    
                    await client.query(
                        'INSERT INTO itens_pedido (pedido_id, jogo_id, preco_unitario) VALUES ($1, $2, $3)', 
                        [id, jogoId, preco]
                    );
                    novoTotal += parseFloat(preco);
                }
            }
            // 3. Atualiza o total do pedido
            await client.query('UPDATE pedidos SET total = $1 WHERE id = $2', [novoTotal, id]);
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};