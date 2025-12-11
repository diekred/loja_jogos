document.addEventListener('DOMContentLoaded', () => {
    carregarCarrinho();
    carregarCartoesSalvos();
});

// FUNÇÃO ATUALIZADA (COM BOTÃO DE DELETAR)
function carregarCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const container = document.getElementById('itensCarrinho');
    let total = 0;

    container.innerHTML = ''; 

    if (carrinho.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding: 20px;">Seu carrinho está vazio.</p>';
        document.getElementById('btnFinalizar').disabled = true;
        document.getElementById('btnFinalizar').style.background = '#b2bec3';
        document.getElementById('totalValor').innerText = '0.00';
        document.getElementById('btnTotalValor').innerText = '0.00';
        return;
    } 
    
    document.getElementById('btnFinalizar').disabled = false;
    document.getElementById('btnFinalizar').style.background = ''; // Volta ao padrão do CSS

    carrinho.forEach((item, index) => {
        total += parseFloat(item.preco);
        container.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #f1f2f6;">
                <div style="display:flex; align-items:center; gap: 15px;">
                    <button onclick="removerDoCarrinho(${index})" title="Remover" style="background:none; border:none; padding:0; cursor:pointer; color:var(--danger); font-size: 1.2rem;">
                        ✖
                    </button>
                    <span style="font-weight:500;">${item.titulo}</span>
                </div>
                <span style="font-weight:600;">R$ ${item.preco}</span>
            </div>`;
    });
    
    document.getElementById('totalValor').innerText = total.toFixed(2);
    document.getElementById('btnTotalValor').innerText = total.toFixed(2);
    
    // QR Code
    const randomKey = Math.random().toString(36).substring(7);
    const pixData = `00020126330014BR.GOV.BCB.PIX0111${randomKey}5204000053039865802BR5913GameStore6008Curitiba62070503***6304`;
    document.getElementById('imgQrCode').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${pixData}`;
}

// NOVA: Remover item do carrinho
window.removerDoCarrinho = function(index) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    carrinho.splice(index, 1); // Remove
    localStorage.setItem('carrinho', JSON.stringify(carrinho)); // Salva
    carregarCarrinho(); // Atualiza tela
};

// --- O RESTO CONTINUA IGUAL ---

window.mudarPagamento = function(tipo) {
    document.getElementById('contentPix').classList.remove('active');
    document.getElementById('contentCartao').classList.remove('active');

    if (tipo === 'PIX') {
        document.getElementById('contentPix').classList.add('active');
    } else {
        document.getElementById('contentCartao').classList.add('active');
    }
};

async function carregarCartoesSalvos() {
    const res = await fetch('/api/cartoes');
    const cartoes = await res.json();
    const div = document.getElementById('listaCartoesSalvos');
    div.innerHTML = ''; 
    
    if (cartoes.length > 0) {
        div.innerHTML = '<p style="font-size:0.9em;color:#555;margin-bottom:10px;">Seus cartões salvos:</p>';
        cartoes.forEach(c => {
            div.innerHTML += `
                <div class="saved-card-item" onclick="usarCartaoSalvo('${c.final_cartao}')">
                    <div class="card-info">
                        <span style="font-size: 1.5rem;">💳</span>
                        <div>
                            <strong>Final ${c.final_cartao}</strong><br>
                            <small>${c.nome_titular}</small>
                        </div>
                    </div>
                    <button class="btn-trash" onclick="event.stopPropagation(); deletarCartao(${c.id})">
                        🗑️
                    </button>
                </div>
            `;
        });
    }
}

window.usarCartaoSalvo = function(final) {
    alert(`Cartão final ${final} selecionado!`);
    document.getElementById('cartaoNumero').value = "**** **** **** " + final;
    document.getElementById('cartaoNome').value = "Cartão Salvo";
};

window.deletarCartao = async function(id) {
    if(!confirm('Remover este cartão salvo?')) return;
    const res = await fetch(`/api/cartoes/${id}`, { method: 'DELETE' });
    if ((await res.json()).success) {
        carregarCartoesSalvos();
    } else {
        alert('Erro ao deletar cartão.');
    }
};

function mascaraCartao(i) {
    let v = i.value.replace(/\D/g, "");
    v = v.replace(/(\d{4})/g, "$1 ").trim();
    i.value = v;
}

function mascaraData(i) {
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
        window.location.href = 'pedidos.html';
    } else {
        alert('Erro: ' + data.error);
    }
});