document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('formLogin');
    const formCadastro = document.getElementById('formCadastro');
    const toggleLink = document.getElementById('toggleLink');
    const formTitle = document.getElementById('formTitle');

    // Alternar entre Login e Cadastro
    if(toggleLink) {
        toggleLink.addEventListener('click', () => {
            if (formLogin.classList.contains('hidden')) {
                formLogin.classList.remove('hidden');
                formCadastro.classList.add('hidden');
                formTitle.innerText = 'Bem-vindo';
                toggleLink.innerText = 'Criar uma conta';
            } else {
                formLogin.classList.add('hidden');
                formCadastro.classList.remove('hidden');
                formTitle.innerText = 'Nova Conta';
                toggleLink.innerText = 'Já tenho conta';
            }
        });
    }

    // LOGIN
    if(formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;

            try {
                const res = await fetch('/auth/login', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });
                const data = await res.json();
                
                if (data.success) {
                    // --- CORREÇÃO AQUI ---
                    // Antes estava: window.location.href = '../loja/catalogo.html';
                    // Agora deve ser:
                    window.location.href = '../catalogo/catalogo.html'; 
                } else {
                    alert('Erro: ' + data.message);
                }
            } catch (err) {
                console.error(err);
                alert('Erro ao conectar com o servidor');
            }
        });
    }

    // CADASTRO
    if(formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = document.getElementById('cadNome').value;
            const cpf = document.getElementById('cadCpf').value;
            const email = document.getElementById('cadEmail').value;
            const senha = document.getElementById('cadSenha').value;

            try {
                const res = await fetch('/auth/cadastro', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, cpf, email, senha })
                });
                const data = await res.json();

                if (data.success) {
                    alert('Conta criada com sucesso! Faça login.');
                    location.reload();
                } else {
                    alert('Erro: ' + (data.error || 'Erro desconhecido'));
                }
            } catch (err) {
                alert('Erro na requisição');
            }
        });
    }
});

// Máscara de CPF
function mascaraCPF(i) {
    let v = i.value.replace(/\D/g, "");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    i.value = v;
}