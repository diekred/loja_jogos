document.addEventListener('DOMContentLoaded', () => {
    carregarCarrinho();
    carregarCartoesSalvos();
});

function carregarCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const container = document.getElementById('itensCarrinho');
    let total = 0;

    container.innerHTML = ''; 

    if (carrinho.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: #888; padding: 20px;">Seu carrinho está vazio.</p>';
        document.getElementById('btnFinalizar').disabled = true;
        document.getElementById('totalValor').innerText = '0.00';
        document.getElementById('btnTotalValor').innerText = '0.00';
        return;
    } 
    
    document.getElementById('btnFinalizar').disabled = false;

    carrinho.forEach((item, index) => {
        total += parseFloat(item.preco);
        container.innerHTML += `
            <div class="cart-item">
                <div style="display:flex; align-items:center; gap: 15px;">
                    <button onclick="removerDoCarrinho(${index})" style="background:none; border:none; color:#cf6679; padding:0; font-size:1.2rem; cursor:pointer;">✖</button>
                    <span style="color:white; font-weight:500;">${item.titulo}</span>
                </div>
                <span style="color:var(--primary); font-weight:bold;">R$ ${item.preco}</span>
            </div>`;
    });
    
    document.getElementById('totalValor').innerText = total.toFixed(2);
    document.getElementById('btnTotalValor').innerText = total.toFixed(2);
    
    const randomKey = Math.random().toString(36).substring(7);
    const pixData = `00020126330014BR.GOV.BCB.PIX0111${randomKey}5204000053039865802BR5913GameStore6008Curitiba62070503***6304`;
    document.getElementById('imgQrCode').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${pixData}`;
}

window.removerDoCarrinho = function(index) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    carrinho.splice(index, 1); 
    localStorage.setItem('carrinho', JSON.stringify(carrinho)); 
    carregarCarrinho(); 
};

window.mudarPagamento = function(tipo) {
    document.getElementById('contentPix').classList.add('hidden');
    document.getElementById('contentCartao').classList.add('hidden');

    if (tipo === 'PIX') {
        document.getElementById('contentPix').classList.remove('hidden');
    } else {
        document.getElementById('contentCartao').classList.remove('hidden');
    }
};

async function carregarCartoesSalvos() {
    try {
        const res = await fetch('/api/cartoes');
        const cartoes = await res.json();
        const div = document.getElementById('listaCartoesSalvos');
        div.innerHTML = ''; 
        
        if (cartoes.length > 0) {
            div.innerHTML = '<p style="color:var(--text-muted); margin-bottom:10px;">Cartões Salvos:</p>';
            cartoes.forEach(c => {
                div.innerHTML += `
                    <div class="saved-card-item" onclick="usarCartaoSalvo('${c.final_cartao}')">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span style="font-size: 1.5rem;">💳</span>
                            <div>
                                <strong style="color:white;">Final ${c.final_cartao}</strong><br>
                                <small style="color:#888;">${c.nome_titular}</small>
                            </div>
                        </div>
                        <button class="btn-del" style="width:auto; padding:5px 10px;" onclick="event.stopPropagation(); deletarCartao(${c.id})">🗑️</button>
                    </div>
                `;
            });
        }
    } catch(e) { console.error(e); }
}

window.usarCartaoSalvo = function(final) {
    document.getElementById('cartaoNumero').value = "**** **** **** " + final;
    document.getElementById('cartaoNome').value = "Cartão Salvo";
};

window.deletarCartao = async function(id) {
    if(!confirm('Remover cartão?')) return;
    await fetch(`/api/cartoes/${id}`, { method: 'DELETE' });
    carregarCartoesSalvos();
};

window.mascaraCartao = function(i) {
    let v = i.value.replace(/\D/g, "");
    v = v.replace(/(\d{4})/g, "$1 ").trim();
    i.value = v;
}

window.mascaraData = function(i) {
    let v = i.value.replace(/\D/g, "");
    v = v.replace(/(\d{2})(\d)/, "$1/$2");
    i.value = v;
}

document.getElementById('btnFinalizar').addEventListener('click', async () => {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    if (carrinho.length === 0) return alert('Carrinho vazio!');

    const opcao = document.querySelector('input[name="pagamento"]:checked');
    if (!opcao) return alert("Selecione uma forma de pagamento!");

    const formaPagamento = opcao.value;
    const total = document.getElementById('totalValor').innerText;
    
    let dadosCartao = null;

    if (formaPagamento === 'CARTAO') {
        const numero = document.getElementById('cartaoNumero').value;
        const nome = document.getElementById('cartaoNome').value;
        const salvar = document.getElementById('salvarCartao').checked;

        if (!numero || !nome) return alert("Preencha os dados do cartão!");

        dadosCartao = {
            numero: numero.replace(/\s/g, ''),
            nome: nome,
            salvarCartao: salvar
        };
    }
    
    const res = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrinho, total, formaPagamento, dadosCartao })
    });
    
    const data = await res.json();
    if (data.success) {
        alert('Pedido realizado com sucesso!');
        localStorage.removeItem('carrinho');
        window.location.href = '../meus-pedidos/pedidos.html';
    } else {
        alert('Erro: ' + data.error);
    }
});