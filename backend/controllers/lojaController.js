const { query, transaction } = require('../database');

// Listar Jogos (Categorias em Ordem Alfabética)
exports.listarJogos = async (req, res) => {
    const sql = `
        SELECT j.id, j.titulo, j.preco, j.imagem_url, 
               STRING_AGG(c.nome, ', ' ORDER BY c.nome) as categorias_nomes
        FROM jogos j
        LEFT JOIN jogo_categorias jc ON j.id = jc.jogo_id
        LEFT JOIN categorias c ON jc.categoria_id = c.id
        GROUP BY j.id
    `;
    try {
        const result = await query(sql);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.checkout = async (req, res) => {
    const userId = req.cookies.usuarioLogado;
    const { carrinho, total, formaPagamento, dadosCartao } = req.body;

    if (!userId) return res.status(401).json({ error: 'Não autorizado' });

    try {
        const pedidoId = await transaction(async (client) => {
            
            if (formaPagamento === 'CARTAO' && dadosCartao && dadosCartao.salvarCartao) {
                const final = dadosCartao.numero.slice(-4);
                await client.query(
                    'INSERT INTO cartoes_credito (usuario_id, nome_titular, final_cartao, bandeira) VALUES ($1, $2, $3, $4)',
                    [userId, dadosCartao.nome, final, 'Master/Visa']
                );
            }

            let detalhes = '';
            if (formaPagamento === 'PIX') {
                detalhes = 'Código Pix gerado: ' + Math.random().toString(36).substring(7);
            } else {
                detalhes = `Cartão final ${dadosCartao ? dadosCartao.numero.slice(-4) : 'Salvo'}`;
            }

            const sqlPedido = 'INSERT INTO pedidos (usuario_id, total, forma_pagamento, status, detalhes_pagamento) VALUES ($1, $2, $3, $4, $5) RETURNING id';
            const pedidoRes = await client.query(sqlPedido, [userId, total, formaPagamento, 'Pendente', detalhes]);
            const novoPedidoId = pedidoRes.rows[0].id;

            for (const item of carrinho) {
                await client.query(
                    'INSERT INTO itens_pedido (pedido_id, jogo_id, preco_unitario) VALUES ($1, $2, $3)',
                    [novoPedidoId, item.id, item.preco]
                );
            }

            return novoPedidoId;
        });

        res.json({ success: true, pedidoId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.listarMeusPedidos = async (req, res) => {
    const userId = req.cookies.usuarioLogado;
    if (!userId) return res.status(401).json({ error: 'Não logado' });

    try {
        const sql = `
            SELECT p.id, p.data_pedido, p.total, p.status, p.forma_pagamento, p.detalhes_pagamento,
                   json_agg(json_build_object('titulo', j.titulo, 'preco', ip.preco_unitario)) as itens
            FROM pedidos p
            JOIN itens_pedido ip ON p.id = ip.pedido_id
            JOIN jogos j ON ip.jogo_id = j.id
            WHERE p.usuario_id = $1
            GROUP BY p.id
            ORDER BY p.data_pedido DESC
        `;
        const result = await query(sql, [userId]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.listarCartoes = async (req, res) => {
    const userId = req.cookies.usuarioLogado;
    if (!userId) return res.json([]);
    try {
        const result = await query('SELECT * FROM cartoes_credito WHERE usuario_id = $1', [userId]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deletarCartao = async (req, res) => {
    const userId = req.cookies.usuarioLogado;
    const { id } = req.params;
    try {
        await query('DELETE FROM cartoes_credito WHERE id = $1 AND usuario_id = $2', [id, userId]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.verificarJogosComprados = async (req, res) => {
    const userId = req.cookies.usuarioLogado;
    if (!userId) return res.json([]);

    try {
        const sql = `
            SELECT DISTINCT ip.jogo_id
            FROM itens_pedido ip
            JOIN pedidos p ON ip.pedido_id = p.id
            WHERE p.usuario_id = $1 AND p.status != 'Cancelado'
        `;
        const result = await query(sql, [userId]);
        const ids = result.rows.map(row => row.jogo_id);
        res.json(ids);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};