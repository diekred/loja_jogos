document.addEventListener('DOMContentLoaded', async () => {
    const spanData = document.getElementById('dataEmissao');
    if(spanData) spanData.innerText = new Date().toLocaleDateString('pt-BR');

    // Busca Relatório Mensal (Rota Nova)
    const res1 = await fetch('/admin/pedidos/relatorios/mensal');
    
    // SE DER ERRO DE LOGIN, VOLTA PARA A TELA DE LOGIN
    if(res1.status === 403 || res1.status === 401) return window.location.href = '../../login/login.html';
    
    const dadosMensal = await res1.json();
    const tabMensal = document.getElementById('tabMensal');
    
    if(tabMensal) {
        tabMensal.innerHTML = '';
        if (dadosMensal.length === 0) {
            tabMensal.innerHTML = '<tr><td colspan="3">Nenhum dado encontrado.</td></tr>';
        } else {
            dadosMensal.forEach(d => {
                tabMensal.innerHTML += `
                    <tr>
                        <td>${d.mes}</td>
                        <td>${d.qtd_pedidos}</td>
                        <td>R$ ${d.receita}</td>
                    </tr>
                `;
            });
        }
    }

    // Busca Relatório Categorias (Rota Nova)
    const res2 = await fetch('/admin/pedidos/relatorios/categorias');
    const dadosCat = await res2.json();
    
    const tabCat = document.getElementById('tabCategoria');
    if(tabCat) {
        tabCat.innerHTML = '';
        if (dadosCat.length === 0) {
            tabCat.innerHTML = '<tr><td colspan="3">Nenhum dado encontrado.</td></tr>';
        } else {
            dadosCat.forEach(d => {
                tabCat.innerHTML += `
                    <tr>
                        <td>${d.nome}</td>
                        <td>${d.itens_vendidos}</td>
                        <td>R$ ${d.faturamento}</td>
                    </tr>
                `;
            });
        }
    }
});