document.addEventListener('DOMContentLoaded', async () => {
    // Busca os pedidos do usuário logado
    const res = await fetch('/api/meus-pedidos');
    
    // Se não estiver logado, manda para o login (subindo uma pasta ../)
    if (res.status === 401) {
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = '../auth/index.html';
        return;
    }

    const pedidos = await res.json();
    const container = document.getElementById('listaPedidos');
    container.innerHTML = '';

    if (pedidos.length === 0) {
        container.innerHTML = '<p>Você ainda não fez nenhum pedido.</p>';
        return;
    }

    pedidos.forEach(p => {
        // Formata a data (Ex: 10/12/2025)
        const data = new Date(p.data_pedido).toLocaleDateString('pt-BR');
        
        // Cria a lista de itens (HTML)
        const listaItens = p.itens ? p.itens.map(item => 
            `<li><span>${item.titulo}</span> <span>R$ ${item.preco}</span></li>`
        ).join('') : 'Erro nos itens';

        // Define a cor do status
        let corStatus = '';
        if(p.status === 'Pendente') corStatus = 'background:#fff3cd; color:#856404;'; // Amarelo
        else if(p.status === 'Aprovado') corStatus = 'background:#d4edda; color:#155724;'; // Verde
        else if(p.status === 'Enviado') corStatus = 'background:#cce5ff; color:#004085;'; // Azul
        else corStatus = 'background:#f8d7da; color:#721c24;'; // Vermelho (Cancelado)

        // Adiciona o cartão do pedido na tela
        container.innerHTML += `
            <div class="pedido-card" style="background: white; border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;">
                    <strong>Pedido #${p.id} - ${data}</strong>
                    <span style="padding: 5px 10px; border-radius: 15px; font-size: 0.9em; font-weight: bold; ${corStatus}">
                        ${p.status}
                    </span>
                </div>
                <ul style="list-style: none; padding: 0;">${listaItens}</ul>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 10px 0;">
                <div style="text-align: right; font-weight: bold;">
                    Total: R$ ${p.total} (${p.forma_pagamento})
                </div>
            </div>
        `;
    });
});