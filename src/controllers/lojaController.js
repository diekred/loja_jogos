const pool = require('../server/db');

// Listar Jogos
exports.listarJogos = async (req, res) => {
    const sql = `
        SELECT j.id, j.titulo, j.preco, j.imagem_url, 
               STRING_AGG(c.nome, ', ') as categorias_nomes
        FROM jogos j
        LEFT JOIN jogo_categorias jc ON j.id = jc.jogo_id
        LEFT JOIN categorias c ON jc.categoria_id = c.id
        GROUP BY j.id
    `;
    const result = await pool.query(sql);
    res.json(result.rows);
};

// Checkout (Pix e Cartão)
exports.checkout = async (req, res) => {
    const userId = req.cookies.usuarioLogado;
    const { carrinho, total, formaPagamento, dadosCartao } = req.body;

    if (!userId) return res.status(401).json({ error: 'Não autorizado' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Salvar Cartão (se solicitado)
        if (formaPagamento === 'CARTAO' && dadosCartao && dadosCartao.salvarCartao) {
            const final = dadosCartao.numero.slice(-4);
            await client.query(
                'INSERT INTO cartoes_credito (usuario_id, nome_titular, final_cartao, bandeira) VALUES ($1, $2, $3, $4)',
                [userId, dadosCartao.nome, final, 'Master/Visa']
            );
        }

        // 2. Detalhes
        let detalhes = '';
        if (formaPagamento === 'PIX') {
            detalhes = 'Código Pix gerado: ' + Math.random().toString(36).substring(7);
        } else {
            detalhes = `Cartão final ${dadosCartao ? dadosCartao.numero.slice(-4) : 'Salvo'}`;
        }

        // 3. Criar Pedido
        const sqlPedido = 'INSERT INTO pedidos (usuario_id, total, forma_pagamento, status, detalhes_pagamento) VALUES ($1, $2, $3, $4, $5) RETURNING id';
        const pedidoRes = await client.query(sqlPedido, [userId, total, formaPagamento, 'Pendente', detalhes]);
        const pedidoId = pedidoRes.rows[0].id;

        // 4. Inserir Itens
        for (const item of carrinho) {
            await client.query(
                'INSERT INTO itens_pedido (pedido_id, jogo_id, preco_unitario) VALUES ($1, $2, $3)',
                [pedidoId, item.id, item.preco]
            );
        }

        await client.query('COMMIT');
        res.json({ success: true, pedidoId });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
};

// Meus Pedidos
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
        const result = await pool.query(sql, [userId]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Listar Cartões
exports.listarCartoes = async (req, res) => {
    const userId = req.cookies.usuarioLogado;
    if (!userId) return res.json([]);
    try {
        const result = await pool.query('SELECT * FROM cartoes_credito WHERE usuario_id = $1', [userId]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Deletar Cartão
exports.deletarCartao = async (req, res) => {
    const userId = req.cookies.usuarioLogado;
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM cartoes_credito WHERE id = $1 AND usuario_id = $2', [id, userId]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// NOVO: Verificar Jogos Comprados
exports.verificarJogosComprados = async (req, res) => {
    const userId = req.cookies.usuarioLogado;
    if (!userId) return res.json([]);

    try {
        // Busca IDs de jogos em pedidos que NÃO foram cancelados
        const sql = `
            SELECT DISTINCT ip.jogo_id
            FROM itens_pedido ip
            JOIN pedidos p ON ip.pedido_id = p.id
            WHERE p.usuario_id = $1 AND p.status != 'Cancelado'
        `;
        const result = await pool.query(sql, [userId]);
        const ids = result.rows.map(row => row.jogo_id);
        res.json(ids);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};