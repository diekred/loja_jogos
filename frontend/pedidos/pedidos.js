let listaTodosJogos = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarPedidos();
    
    // Botões do Modal
    const btnFechar = document.getElementById('btnFecharModal');
    if(btnFechar) btnFechar.addEventListener('click', fecharModal);
    
    const btnSalvar = document.getElementById('btnSalvarItens');
    if(btnSalvar) btnSalvar.addEventListener('click', salvarEdicaoItens);
});

async function carregarPedidos() {
    try {
        const res = await fetch('/admin/pedidos');
        // Se não for admin, chuta pro login
        if (res.status === 403 || res.status === 401) {
            return window.location.href = '../../login/login.html';
        }
        
        const pedidos = await res.json();
        const tbody = document.getElementById('listaPedidos');
        tbody.innerHTML = '';

        if(pedidos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">Nenhum pedido encontrado.</td></tr>';
            return;
        }

        pedidos.forEach(p => {
            const data = new Date(p.data_pedido).toLocaleDateString('pt-BR');
            const listaItens = p.itens || [];
            const itensTexto = listaItens.map(i => i.titulo).join(', ');
            // Guarda IDs para o modal saber o que marcar
            const idsAtuais = JSON.stringify(listaItens.map(i => i.id));

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
    } catch (e) {
        console.error(e);
    }
}

async function salvarStatus(id) {
    const novoStatus = document.getElementById(`status-${id}`).value;
    await fetch(`/admin/pedidos/${id}/status`, {
        method: 'PUT', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ status: novoStatus })
    });
    // Feedback visual opcional aqui
}

async function deletarPedido(id) {
    if(!confirm('Tem certeza que deseja apagar este pedido?')) return;
    
    const res = await fetch(`/admin/pedidos/${id}`, { method: 'DELETE' });
    const data = await res.json();
    
    if(data.success) {
        carregarPedidos();
    } else {
        alert('Erro ao deletar: ' + data.error);
    }
}

// --- LÓGICA DO MODAL ---

async function abrirModal(pedidoId, idsAtuais) {
    if (listaTodosJogos.length === 0) {
        const res = await fetch('/admin/jogos');
        listaTodosJogos = await res.json();
    }

    document.getElementById('modalPedidoId').innerText = pedidoId;
    document.getElementById('modalPedidoId').dataset.id = pedidoId; 
    
    const div = document.getElementById('listaJogosModal');
    div.innerHTML = '';

    listaTodosJogos.forEach(jogo => {
        const estaNoPedido = idsAtuais.includes(jogo.id);
        div.innerHTML += `
            <label style="display:block; margin:5px 0;">
                <input type="checkbox" value="${jogo.id}" ${estaNoPedido ? 'checked' : ''}>
                <span>${jogo.titulo} (R$ ${jogo.preco})</span>
            </label>
        `;
    });

    document.getElementById('modalEdicao').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modalEdicao').style.display = 'none';
}

async function salvarEdicaoItens() {
    const pedidoId = document.getElementById('modalPedidoId').dataset.id;
    const checkboxes = document.querySelectorAll('#listaJogosModal input:checked');
    const novosIds = Array.from(checkboxes).map(cb => cb.value);

    if (novosIds.length === 0) return alert('O pedido precisa ter pelo menos 1 item.');

    const res = await fetch(`/admin/pedidos/${pedidoId}/itens`, {
        method: 'PUT', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ novosJogosIds: novosIds })
    });

    const data = await res.json();

    if (data.success) {
        alert('Itens atualizados!');
        fecharModal();
        carregarPedidos();
    } else {
        alert('Erro ao atualizar: ' + data.error);
    }
}