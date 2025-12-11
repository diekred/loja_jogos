let listaJogosCache = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarJogosAdmin();
    carregarOpcoesCategorias();
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
        
        let preco = document.getElementById('preco').value;
        preco = preco.replace(/\D/g, ""); 
        preco = (parseFloat(preco) / 100).toFixed(2); 

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

function mascaraMoeda(i) {
    let v = i.value.replace(/\D/g,'');
    v = (v/100).toFixed(2) + '';
    v = v.replace(".", ",");
    v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
    i.value = v;
}

async function carregarOpcoesCategorias() {
    try {
        const res = await fetch('/admin/jogos/categorias');
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
    if (res.status === 403 || res.status === 401) return window.location.href = '../../login/login.html';
    
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