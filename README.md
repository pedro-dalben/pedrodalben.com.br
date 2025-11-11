# Portfólio Pedro Dalben

Aplicação Rails 8 com portfólio, blog e dashboard administrativo usando TailAdmin como frontend.

## Tecnologias

- Rails 8.0+
- PostgreSQL
- Tailwind CSS 4.0 via Vite
- Devise para autenticação
- Hotwire (Turbo + Stimulus)
- Alpine.js

## Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   bundle install
   npm install
   ```
3. Configure o banco de dados:
   ```bash
   rails db:create db:migrate db:seed
   ```
4. Inicie o servidor:
   ```bash
   bin/dev
   ```

## Credenciais Admin

- Email: admin@pedrodalben.com
- Senha: password123

## Estrutura

- `/` - Homepage com projetos em destaque
- `/portfolio` - Lista de projetos
- `/blog` - Lista de posts
- `/about` - Sobre mim
- `/admin` - Dashboard administrativo (requer autenticação)

## Funcionalidades

### Públicas
- Visualização de projetos
- Visualização de posts do blog
- Página sobre

### Admin
- CRUD de projetos
- CRUD de posts
- CRUD de clientes
- Dashboard com estatísticas
