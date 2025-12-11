const { query, transaction } = require('../database');

// Listar jogos para a tabela do Admin (trazendo as categorias juntas)
exports.listarTodos = async (req, res) => {
    const sql = `
        SELECT j.*, array_agg(jc.categoria_id) as categorias_ids 
        FROM jogos j 
        LEFT JOIN jogo_categorias jc ON j.id = jc.jogo_id 
        GROUP BY j.id 
        ORDER BY j.id DESC
    `;
    try {
        const result = await query(sql);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obter UM jogo específico (para preencher o formulário de edição)
exports.obterJogo = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query('SELECT * FROM jogos WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Jogo não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Adicionar Novo Jogo
exports.adicionarJogo = async (req, res) => {
    const { titulo, preco, imagem_url, categoriaIds } = req.body;
    
    try {
        await transaction(async (client) => {
            // 1. Insere o Jogo
            const resJogo = await client.query(
                'INSERT INTO jogos (titulo, preco, imagem_url) VALUES ($1, $2, $3) RETURNING id', 
                [titulo, preco, imagem_url]
            );
            const jogoId = resJogo.rows[0].id;

            // 2. Insere as Categorias (se houver)
            if (categoriaIds && categoriaIds.length > 0) {
                for (const catId of categoriaIds) {
                    await client.query(
                        'INSERT INTO jogo_categorias (jogo_id, categoria_id) VALUES ($1, $2)', 
                        [jogoId, catId]
                    );
                }
            }
        });
        
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Editar Jogo Existente
exports.editarJogo = async (req, res) => {
    const { id } = req.params;
    const { titulo, preco, imagem_url, categoriaIds } = req.body;

    try {
        await transaction(async (client) => {
            // 1. Atualiza dados básicos
            await client.query(
                'UPDATE jogos SET titulo = $1, preco = $2, imagem_url = $3 WHERE id = $4', 
                [titulo, preco, imagem_url, id]
            );

            // 2. Atualiza categorias (Remove todas e insere as novas)
            await client.query('DELETE FROM jogo_categorias WHERE jogo_id = $1', [id]);
            
            if (categoriaIds && categoriaIds.length > 0) {
                for (const catId of categoriaIds) {
                    await client.query(
                        'INSERT INTO jogo_categorias (jogo_id, categoria_id) VALUES ($1, $2)', 
                        [id, catId]
                    );
                }
            }
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Deletar Jogo (COM REMOÇÃO FORÇADA DE HISTÓRICO)
exports.deletarJogo = async (req, res) => {
    const { id } = req.params;
    try {
        await transaction(async (client) => {
            // 1. PRIMEIRO: Remove dos pedidos feitos (limpa o histórico de compras desse item)
            await client.query('DELETE FROM itens_pedido WHERE jogo_id = $1', [id]);

            // 2. SEGUNDO: Remove as categorias
            await client.query('DELETE FROM jogo_categorias WHERE jogo_id = $1', [id]);

            // 3. TERCEIRO: Remove o jogo em si
            await client.query('DELETE FROM jogos WHERE id = $1', [id]);
        });

        res.json({ success: true });
    } catch (err) {
        // Se der erro, mostra qual foi
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Listar Categorias
exports.listarCategorias = async (req, res) => {
    try {
        const result = await query('SELECT * FROM categorias ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};