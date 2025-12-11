let listaJogosCache = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarJogosAdmin();
    carregarOpcoesCategorias();
    carregarUsuarios();
    setupFormulario();
});

function setupFormulario() {
    const form = document.getElementById('formJogo');
    const btnCancelar = document.getElementById('btnCancelar');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('jogoId').value;
        const titulo = document.getElementById('titulo').value;
        const imagem_url = document.getElementById('imgUrl').value;
        
        // CONVERTE PREÇO FORMATADO PARA FLOAT
        let preco = document.getElementById('preco').value;
        preco = preco.replace(/\D/g, ""); // Remove R$ e pontos
        preco = (parseFloat(preco) / 100).toFixed(2); // Vira decimal

        const checkboxes = document.querySelectorAll('input[name="categoria"]:checked');
        const idsSelecionados = Array.from(checkboxes).map(cb => cb.value);

        if (idsSelecionados.length === 0) return alert("Selecione uma categoria!");

        const payload = { titulo, preco, imagem_url, categoriaIds: idsSelecionados };
        let url = id ? `/admin/jogos/${id}` : '/admin/jogos';
        let method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method, headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.success) {
            alert(id ? 'Atualizado!' : 'Cadastrado!');
            resetarFormulario();
            carregarJogosAdmin();
        } else alert('Erro: ' + data.error);
    });

    btnCancelar.addEventListener('click', resetarFormulario);
}

function resetarFormulario() {
    document.getElementById('formJogo').reset();
    document.getElementById('jogoId').value = '';
    document.getElementById('formTitulo').innerText = 'Adicionar Jogo';
    document.getElementById('btnSalvar').innerText = 'Cadastrar';
    document.getElementById('btnCancelar').classList.add('hidden');
    document.querySelectorAll('input[name="categoria"]').forEach(cb => cb.checked = false);
}

// MÁSCARA DE MOEDA
function mascaraMoeda(i) {
    let v = i.value.replace(/\D/g,'');
    v = (v/100).toFixed(2) + '';
    v = v.replace(".", ",");
    v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
    i.value = v;
}

// ... (MANTENHA AS FUNÇÕES carregarOpcoesCategorias, carregarJogosAdmin, prepararEdicao, deletar, etc IGUAIS AO ANTERIOR) ...
// Para não ficar gigante, estou abreviando as funções de leitura que não mudaram a lógica,
// mas lembre-se de manter o código de carregar/deletar que você já tinha.

async function carregarOpcoesCategorias() {
    try {
        const res = await fetch('/admin/categorias');
        const categorias = await res.json();
        const div = document.getElementById('containerCategorias');
        div.innerHTML = '';
        categorias.forEach(cat => {
            div.innerHTML += `<label><input type="checkbox" name="categoria" value="${cat.id}"> <span>${cat.nome}</span></label>`;
        });
    } catch(e) {}
}

async function carregarJogosAdmin() {
    const res = await fetch('/admin/jogos');
    if (res.status === 403 || res.status === 401) return window.location.href = '../auth/index.html';
    
    listaJogosCache = await res.json();
    const table = document.getElementById('tabelaJogos');
    table.innerHTML = `<thead><tr><th>ID</th><th>Img</th><th>Título</th><th>Preço</th><th>Ações</th></tr></thead><tbody>` + 
    listaJogosCache.map(j => `
        <tr>
            <td>${j.id}</td>
            <td><img src="${j.imagem_url}" height="30"></td>
            <td>${j.titulo}</td>
            <td>R$ ${j.preco}</td>
            <td>
                <button class="btn-edit" onclick="prepararEdicao(${j.id})">✏️</button>
                <button class="btn-del" onclick="deletar(${j.id})">🗑️</button>
            </td>
        </tr>`).join('') + `</tbody>`;
}

function prepararEdicao(id) {
    const jogo = listaJogosCache.find(j => j.id === id);
    if (!jogo) return;
    document.getElementById('jogoId').value = jogo.id;
    document.getElementById('titulo').value = jogo.titulo;
    document.getElementById('imgUrl').value = jogo.imagem_url;
    
    // Formata o preço para o input com máscara
    let precoFormatado = parseFloat(jogo.preco).toFixed(2).replace('.', ',');
    document.getElementById('preco').value = precoFormatado;
    
    document.querySelectorAll('input[name="categoria"]').forEach(cb => cb.checked = false);
    if (jogo.categorias_ids) {
        jogo.categorias_ids.forEach(catId => {
            const cb = document.querySelector(`input[name="categoria"][value="${catId}"]`);
            if (cb) cb.checked = true;
        });
    }
    document.getElementById('formTitulo').innerText = 'Editando: ' + jogo.titulo;
    document.getElementById('btnSalvar').innerText = 'Salvar';
    document.getElementById('btnCancelar').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deletar(id) {
    if(confirm('Tem certeza?')) {
        await fetch(`/admin/jogos/${id}`, { method: 'DELETE' });
        carregarJogosAdmin();
    }
}

async function carregarUsuarios() {
    const res = await fetch('/admin/usuarios');
    const usuarios = await res.json();
    const tbody = document.querySelector('#tabelaUsuarios tbody');
    tbody.innerHTML = '';
    usuarios.forEach(u => {
        const btnClass = u.is_admin ? 'btn-del' : 'btn-add';
        const btnText = u.is_admin ? 'Remover' : 'Tornar Admin';
        const status = u.is_admin ? '<span style="color:var(--success);font-weight:bold">ADMIN</span>' : 'Usuário';
        tbody.innerHTML += `<tr><td>${u.id}</td><td>${u.nome_completo || '-'}</td><td>${u.email}</td><td>${status}</td><td><button class="${btnClass}" onclick="toggleAdmin(${u.id})">${btnText}</button></td></tr>`;
    });
}

async function toggleAdmin(id) {
    if(confirm('Alterar permissão?')) {
        await fetch(`/admin/usuarios/${id}/toggle`, { method: 'PUT' });
        carregarUsuarios();
    }
}