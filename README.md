# Loja de Jogos - Projeto DW1 (4º Bimestre)

## Sobre o Projeto
Este projeto consiste no desenvolvimento de um sistema de e-commerce de jogos, criado utilizando Node.js, Express e PostgreSQL, sem uso de ORM, seguindo a arquitetura MVC.
O sistema foi desenvolvido como uma aplicação fullstack, contemplando tanto o frontend quanto o backend, com foco em organização, segurança e funcionamento correto das operações.
O sistema possui as seguintes funcionalidades:
    Sistema de Login e Cadastro com controle de sessão via cookies.
    Painel do Cliente, contendo catálogo de jogos, carrinho de compras e visualização de pedidos.
    Painel Administrativo, com funcionalidades de CRUD de jogos, gestão de usuários, gestão de pedidos e geração de relatórios para impressão.

## Tecnologias Utilizadas
- Frontend: HTML, CSS, JavaScript.
- Backend: Node.js, Express.
- Banco de Dados: PostgreSQL.

## Relatório de Aprendizagem (Parte 2)

### O que foi feito
Durante o desenvolvimento do projeto, implementei uma aplicação completa fullstack, conectando o frontend ao backend e ao banco de dados PostgreSQL.
Foi realizado o controle de sessão por meio de cookies, permitindo diferenciar usuários comuns de administradores.

No backend, implementei o gerenciamento de transações no banco de dados utilizando BEGIN e COMMIT, garantindo a integridade das compras realizadas no sistema.
Também desenvolvi um sistema de relatórios, utilizando consultas SQL com JOINs e GROUP BY, permitindo a geração de dados organizados para análise e impressão.

### Dificuldades e Superação
A principal dificuldade enfrentada foi aprender a conectar o banco de dados ao código, entendendo como o Node.js se comunica com o PostgreSQL. No início, tive bastante dificuldade para compreender como funcionavam as queries SQL dentro do código, o uso do client.query e o fluxo entre backend e banco de dados.

Outra dificuldade significativa foi a organização da estrutura de pastas, principalmente na separação entre frontend do administrador e da loja. Essa dificuldade foi superada após entender melhor como o Express serve arquivos estáticos e como organizar as rotas corretamente.

Além disso, trabalhar com SQL puro para criação de relatórios foi desafiador, mas com prática consegui compreender melhor o uso de JOINs, GROUP BY e consultas mais complexas, o que contribuiu muito para meu aprendizado.

### Uso de IA
Utilizei Inteligência Artificial como apoio durante o desenvolvimento do projeto, principalmente para:
    Estruturar o boilerplate inicial do projeto.
    Corrigir erros de sintaxe em SQL.
    Ajudar a entender a lógica de funcionamento do carrinho de compras utilizando localStorage.
No entanto, tive dificuldade para me adaptar ao uso da IA, pois percebi que era necessário saber exatamente o que pedir para obter uma resposta útil. Isso exigiu que eu tivesse um bom entendimento prévio do problema antes de solicitar ajuda, o que acabou contribuindo para meu aprendizado e autonomia no desenvolvimento.
### Backend vs Frontend
Senti mais facilidade no Backend, pois a lógica é mais direta e organizada, principalmente no controle de dados, regras de negócio e comunicação com o banco de dados. Apesar de o Frontend ser importante por apresentar o resultado visual, me identifiquei mais com a parte lógica e estrutural do sistema.

### Como rodar o projeto
1. Instale as dependências: `npm install`
2. Crie o banco de dados `loja_games_db` no PostgreSQL.
3. Execute o script `Documentacao/script_criacao.sql`.
4. Configure a senha no arquivo `src/server/db.js`.
5. Inicie o servidor: `node app.js`