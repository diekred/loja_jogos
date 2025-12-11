let listaTodosJogos = []; // Cache dos jogos

document.addEventListener('DOMContentLoaded', () => {
    carregarPedidos();
    
    // Configura botões do Modal
    document.getElementById('btnFecharModal').addEventListener('click', fecharModal);
    document.getElementById('btnSalvarItens').addEventListener('click', salvarEdicaoItens);
});

async function carregarPedidos() {
    const res = await fetch('/admin/pedidos');
    if (res.status === 403) return window.location.href = '../auth/index.html';
    
    const pedidos = await res.json();
    const tbody = document.getElementById('listaPedidos');
    tbody.innerHTML = '';

    if(pedidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Nenhum pedido encontrado.</td></tr>';
        return;
    }

    pedidos.forEach(p => {
        const data = new Date(p.data_pedido).toLocaleDateString('pt-BR');
        const itensTexto = p.itens ? p.itens.map(i => i.titulo).join(', ') : '';
        
        // Guardamos os IDs dos itens atuais num atributo data para usar depois
        const idsAtuais = p.itens ? JSON.stringify(p.itens.map(i => i.id)) : '[]';

        tbody.innerHTML += `
            <tr>
                <td>#${p.id}<br><small>${data}</small></td>
                <td>${p.cliente_email}</td>
                <td style="font-size: 0.9em; color: #555;">${itensTexto}</td>
                <td>R$ ${p.total}</td>
                <td>
                    <select id="status-${p.id}" class="status-select" onchange="salvarStatus(${p.id})">
                        <option value="Pendente" ${p.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                        <option value="Aprovado" ${p.status === 'Aprovado' ? 'selected' : ''}>Aprovado</option>
                        <option value="Enviado" ${p.status === 'Enviado' ? 'selected' : ''}>Enviado</option>
                        <option value="Entregue" ${p.status === 'Entregue' ? 'selected' : ''}>Entregue</option>
                        <option value="Cancelado" ${p.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                    <br><br>
                    <button class="btn-itens" onclick='abrirModal(${p.id}, ${idsAtuais})'>✏️ Itens</button>
                    <button class="btn-del" onclick="deletarPedido(${p.id})">🗑️</button>
                </td>
            </tr>
        `;
    });
}

async function salvarStatus(id) {
    const novoStatus = document.getElementById(`status-${id}`).value;
    await fetch(`/admin/pedidos/${id}/status`, {
        method: 'PUT', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ status: novoStatus })
    });
    // Não precisa alertar toda hora, atualização silenciosa é melhor na UX
}

async function deletarPedido(id) {
    if(!confirm('Tem certeza que deseja apagar este pedido? Isso não pode ser desfeito.')) return;
    
    const res = await fetch(`/admin/pedidos/${id}`, { method: 'DELETE' });
    if((await res.json()).success) {
        carregarPedidos();
    } else {
        alert('Erro ao deletar');
    }
}

// --- LÓGICA DO MODAL ---

async function abrirModal(pedidoId, idsAtuais) {
    // 1. Busca lista de todos os jogos (se ainda não buscou)
    if (listaTodosJogos.length === 0) {
        const res = await fetch('/admin/jogos');
        listaTodosJogos = await res.json();
    }

    // 2. Preenche o Modal
    document.getElementById('modalPedidoId').innerText = pedidoId;
    document.getElementById('modalPedidoId').dataset.id = pedidoId; // Guarda ID para salvar depois
    
    const div = document.getElementById('listaJogosModal');
    div.innerHTML = '';

    listaTodosJogos.forEach(jogo => {
        const estaNoPedido = idsAtuais.includes(jogo.id);
        div.innerHTML += `
            <label>
                <input type="checkbox" value="${jogo.id}" ${estaNoPedido ? 'checked' : ''}>
                <span>${jogo.titulo} (R$ ${jogo.preco})</span>
            </label>
        `;
    });

    // 3. Mostra o Modal
    document.getElementById('modalEdicao').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modalEdicao').style.display = 'none';
}

async function salvarEdicaoItens() {
    const pedidoId = document.getElementById('modalPedidoId').dataset.id;
    
    // Pega os checkboxes marcados no modal
    const checkboxes = document.querySelectorAll('#listaJogosModal input:checked');
    const novosIds = Array.from(checkboxes).map(cb => cb.value);

    if (novosIds.length === 0) return alert('O pedido precisa ter pelo menos 1 item.');

    const res = await fetch(`/admin/pedidos/${pedidoId}/itens`, {
        method: 'PUT', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ novosJogosIds: novosIds })
    });

    if ((await res.json()).success) {
        alert('Itens atualizados e valor total recalculado!');
        fecharModal();
        carregarPedidos();
    } else {
        alert('Erro ao atualizar itens');
    }
}