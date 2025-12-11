let todosJogosCache = [];
let jogosCompradosIds = []; // Lista de IDs que o usuário já tem

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verifica Login
    const authRes = await fetch('/auth/check');
    const authData = await authRes.json();
    
    if (!authData.loggedIn) return window.location.href = '../auth/index.html';
    document.getElementById('userDisplay').innerText = 'Olá, ' + authData.nome;

    if (authData.isAdmin) {
        const headerDiv = document.querySelector('header div:last-child');
        const adminBtn = document.createElement('a');
        adminBtn.innerText = '⚙️ Painel Admin';
        adminBtn.href = '../admin/admin.html';
        adminBtn.className = 'header-link';
        adminBtn.style.color = '#ffcc00';
        headerDiv.prepend(adminBtn);
    }

    document.getElementById('btnLogout').addEventListener('click', async () => {
        await fetch('/auth/logout', { method: 'POST' });
        window.location.href = '../auth/index.html';
    });

    // 2. Busca Jogos Disponíveis
    const resJogos = await fetch('/api/jogos');
    todosJogosCache = await resJogos.json();

    // 3. Busca Jogos que o usuário JÁ TEM
    const resComprados = await fetch('/api/jogos-comprados');
    jogosCompradosIds = await resComprados.json();

    renderizarJogos(todosJogosCache);
});

function renderizarJogos(lista) {
    const container = document.getElementById('listaJogos');
    container.innerHTML = '';

    if (lista.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">Nenhum jogo encontrado.</p>';
        return;
    }

    lista.forEach(jogo => {
        // LÓGICA DE BLOQUEIO
        const jaTem = jogosCompradosIds.includes(jogo.id);
        
        let botaoHtml = '';
        if (jaTem) {
            botaoHtml = `<button disabled style="background-color: #b2bec3; cursor: not-allowed; box-shadow: none;">Adquirido ✔</button>`;
        } else {
            botaoHtml = `<button class="btn-add" onclick='addCarrinho(${JSON.stringify(jogo)})'>Comprar</button>`;
        }

        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <img src="${jogo.imagem_url}" alt="${jogo.titulo}">
            <h3>${jogo.titulo}</h3>
            <p style="color: #666; font-size: 0.9em;">${jogo.categorias_nomes || '-'}</p>
            <p><strong>R$ ${jogo.preco}</strong></p>
            ${botaoHtml}
        `;
        container.appendChild(div);
    });
}

function filtrarJogos() {
    const termo = document.getElementById('inputBusca').value.toLowerCase();
    const filtrados = todosJogosCache.filter(jogo => 
        jogo.titulo.toLowerCase().includes(termo) || 
        (jogo.categorias_nomes && jogo.categorias_nomes.toLowerCase().includes(termo))
    );
    renderizarJogos(filtrados);
}

function addCarrinho(jogo) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    
    // Evita adicionar o mesmo jogo 2x no carrinho
    const jaNoCarrinho = carrinho.some(item => item.id === jogo.id);
    if (jaNoCarrinho) {
        return alert("Este jogo já está no seu carrinho!");
    }

    carrinho.push(jogo);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    alert(`${jogo.titulo} adicionado!`);
}