let todosJogosCache = [];
let jogosCompradosIds = [];

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Auth Check
    const authRes = await fetch('/auth/check');
    const authData = await authRes.json();
    
    if (!authData.loggedIn) return window.location.href = '../login/login.html';
    document.getElementById('userDisplay').innerText = 'Olá, ' + authData.nome;

    if (authData.isAdmin) {
        const headerDiv = document.querySelector('header div:last-child');
        const adminBtn = document.createElement('a');
        adminBtn.innerText = '⚙️ Painel Admin';
        adminBtn.href = '../jogos/jogos.html';
        adminBtn.className = 'header-link';
        adminBtn.style.color = '#ffcc00';
        headerDiv.prepend(adminBtn);
    }

    document.getElementById('btnLogout').addEventListener('click', async () => {
        await fetch('/auth/logout', { method: 'POST' });
        window.location.href = '../login/login.html';
    });

    // 2. Fetch Data
    const resJogos = await fetch('/api/jogos');
    todosJogosCache = await resJogos.json();

    const resComprados = await fetch('/api/jogos-comprados');
    jogosCompradosIds = await resComprados.json();

    renderizarJogos(todosJogosCache);
});

function renderizarJogos(lista) {
    const container = document.getElementById('listaJogos');
    container.innerHTML = '';

    if (lista.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888; margin-top: 40px;">Nenhum jogo encontrado.</p>';
        return;
    }

    lista.forEach(jogo => {
        const jaTem = jogosCompradosIds.includes(jogo.id);
        
        let botaoHtml = '';
        if (jaTem) {
            botaoHtml = `<button disabled class="btn-del" style="background-color: #2ecc71; border:none; color: #1e272e; font-weight:800; cursor: default;">✔ NA BIBLIOTECA</button>`;
        } else {
            botaoHtml = `<button class="btn-add" onclick='addCarrinho(${JSON.stringify(jogo)})'>ADICIONAR AO CARRINHO</button>`;
        }

        // --- LÓGICA DE BADGES (LIMPA) ---
        let categoriasHtml = '';
        if (jogo.categorias_nomes) {
            const listaCats = jogo.categorias_nomes.split(', ');
            // Mostra apenas 3 para não poluir
            listaCats.slice(0, 3).forEach(cat => {
                categoriasHtml += `<span class="badge">${cat}</span>`;
            });
            if(listaCats.length > 3) {
                categoriasHtml += `<span class="badge badge-more">+${listaCats.length - 3}</span>`;
            }
        } else {
            categoriasHtml = `<span class="badge">Geral</span>`;
        }

        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <img src="${jogo.imagem_url}" alt="${jogo.titulo}" loading="lazy">
            <div class="card-content">
                <h3>${jogo.titulo}</h3>
                <div class="badges-container">
                    ${categoriasHtml}
                </div>
                <div class="price">R$ ${parseFloat(jogo.preco).toFixed(2).replace('.', ',')}</div>
                ${botaoHtml}
            </div>
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
    const jaNoCarrinho = carrinho.some(item => item.id === jogo.id);
    if (jaNoCarrinho) return alert("Este jogo já está no seu carrinho!");

    carrinho.push(jogo);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    alert(`${jogo.titulo} adicionado!`);
}