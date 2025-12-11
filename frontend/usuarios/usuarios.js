document.addEventListener('DOMContentLoaded', () => {
    carregarUsuarios();
});

async function carregarUsuarios() {
    const res = await fetch('/admin/usuarios');
    if (res.status === 403 || res.status === 401) return window.location.href = '../../login/login.html';

    const usuarios = await res.json();
    const tbody = document.querySelector('#tabelaUsuarios tbody');
    tbody.innerHTML = '';
    
    usuarios.forEach(u => {
        const btnClass = u.is_admin ? 'btn-del' : 'btn-add';
        const btnText = u.is_admin ? 'Remover' : 'Tornar Admin';
        const status = u.is_admin ? '<span style="color:green;font-weight:bold">ADMIN</span>' : 'Usuário';
        
        // Estilo inline para o botão ficar parecido com o do professor se não tiver CSS classe
        const styleBtn = u.is_admin ? 'background: #e74c3c; color: white;' : 'background: #2ecc71; color: white;';

        tbody.innerHTML += `
            <tr>
                <td>${u.id}</td>
                <td>${u.nome_completo || '-'}</td>
                <td>${u.email}</td>
                <td>${status}</td>
                <td>
                    <button style="padding:5px 10px; border:none; cursor:pointer; border-radius:4px; ${styleBtn}" onclick="toggleAdmin(${u.id})">
                        ${btnText}
                    </button>
                </td>
            </tr>`;
    });
}

async function toggleAdmin(id) {
    if(confirm('Alterar permissão deste usuário?')) {
        await fetch(`/admin/usuarios/${id}/toggle`, { method: 'PUT' });
        carregarUsuarios();
    }
}