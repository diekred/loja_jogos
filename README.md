# Loja de Jogos - Projeto DW1 (4º Bimestre)

## Sobre o Projeto
Este projeto consiste em um sistema de e-commerce de jogos desenvolvido com Node.js, Express e PostgreSQL (sem ORM), utilizando arquitetura MVC.
O sistema possui:
- Login e Cadastro (Cookies).
- Painel do Cliente (Catálogo, Carrinho, Meus Pedidos).
- Painel Administrativo (CRUD de Jogos, Gestão de Usuários, Gestão de Pedidos e Relatórios).

## Tecnologias Utilizadas
- Frontend: HTML, CSS, JavaScript.
- Backend: Node.js, Express.
- Banco de Dados: PostgreSQL.

## Relatório de Aprendizagem (Parte 2)

### O que foi feito
Desenvolvi uma aplicação completa fullstack. Implementei o controle de sessão via cookies, gerenciamento de transações no banco de dados (BEGIN/COMMIT) para garantir integridade nas compras e um sistema de relatórios para impressão.

### Dificuldades e Superação
Tive dificuldade inicial em organizar a estrutura de pastas separando o frontend por contexto (admin/loja), mas superei compreendendo melhor como o Express serve arquivos estáticos. Também foi desafiador manipular o SQL puro para relatórios, mas aprendi a usar GROUP BY e JOINS corretamente.

### Uso de IA
Utilizei IA para auxiliar na estruturação do boilerplate inicial e para corrigir erros de sintaxe no SQL. A IA ajudou a entender como fazer a lógica do "Carrinho" no localStorage, o que acelerou o desenvolvimento.

### Backend vs Frontend
Senti mais facilidade no Backend pois a lógica é mais direta, ou preferi o Frontend pois gosto de ver o resultado visual... *(Escolha o seu)*.

### Como rodar o projeto
1. Instale as dependências: `npm install`
2. Crie o banco de dados `loja_games_db` no PostgreSQL.
3. Execute o script `Documentacao/script_criacao.sql`.
4. Configure a senha no arquivo `src/server/db.js`.
5. Inicie o servidor: `node app.js`