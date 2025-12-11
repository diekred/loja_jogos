document.addEventListener('DOMContentLoaded', async () => {
    // 1. Data de hoje
    document.getElementById('dataEmissao').innerText = new Date().toLocaleDateString('pt-BR');

    // 2. Busca e preenche Vendas Mensais
    const res1 = await fetch('/admin/relatorios/mensal');
    if(res1.status === 403) return window.location.href = '../auth/index.html';
    
    const dadosMensal = await res1.json();
    const tabMensal = document.getElementById('tabMensal');
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

    // 3. Busca e preenche Categorias
    const res2 = await fetch('/admin/relatorios/categorias');
    const dadosCat = await res2.json();
    
    const tabCat = document.getElementById('tabCategoria');
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
});