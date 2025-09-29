# Time Link

Uma rede social moderna onde usuários podem compartilhar mensagens e interagir através de curtidas.

## Funcionalidades

- **Autenticação de Usuários**: Sistema completo de registro e login
- **Gerenciamento de Perfil**: Usuários podem atualizar suas informações pessoais
- **Publicação de Posts**: Criação e compartilhamento de mensagens
- **Sistema de Curtidas**: Interação social através de curtidas nos posts
- **Feed de Posts**: Visualização de todas as publicações da rede
- **Validação de Dados**: Validação tanto no frontend quanto no backend

## Tecnologias Utilizadas

### Backend
- **Node.js**: Ambiente de execução JavaScript
- **Fastify**: Framework rápido e eficiente
- **Prisma ORM**: Object-Relational Mapping para manipulação de dados
- **SQLite**: Banco de dados relacional leve
- **Jest**: Framework de testes unitários
- **Swagger**: Documentação da API
- **Zod**: Validação de esquemas TypeScript
- **bcrypt**: Criptografia de senhas
- **JWT**: Autenticação baseada em tokens

### Frontend
- **Next.js**: Framework React para aplicações web
- **TypeScript**: Superset tipado do JavaScript
- **Tailwind CSS**: Framework CSS utilitário
- **Axios**: Cliente HTTP para requisições à API
- **Zod**: Validação de formulários
- **React Context**: Gerenciamento de estado global

## Pré-requisitos

Antes de executar o projeto, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn** (gerenciador de pacotes)
- **Git** (para clonagem do repositório)

## Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/franpazello96/dial-timeline.git
cd dial-timeline
```

### 2. Configuração das dependências 

Instale as dependências:

```bash
npm run install:all
```

### 3. Configuração das variáveis de ambiente

Copie os arquivos de exemplo para criar os arquivos de configuração no backend e frontend:

```bash
cd backend && cp .env.example .env && cd ../frontend && cp .env.example .env && cd ..
```

Edite os arquivos `.env` em cada pasta com suas configurações específicas.

### 4. Configuração do banco de dados

Configure o banco de dados:

```bash
npm run build:db
```

### 5. Executar a aplicação

Inicie a aplicação completa (backend e frontend):

```bash
npm run dev
```

A aplicação estará disponível em:
- **Backend**: `http://localhost:3333`
- **Frontend**: `http://localhost:3000`

## Scripts Disponíveis

### Backend

- `npm run dev`: Inicia o servidor em modo de desenvolvimento
- `npm run build`: Compila o projeto para produção
- `npm start`: Inicia o servidor em modo de produção
- `npm test`: Executa os testes unitários
- `npm run test:watch`: Executa os testes em modo watch

### Frontend

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Compila o projeto para produção
- `npm start`: Inicia o servidor em modo de produção
- `npm run lint`: Executa o linter para verificação de código

## Estrutura do Projeto

```
Time-link/
├── backend/
│   ├── src/
│   │   ├── routes/        # Rotas da API
│   │   ├── lib/           # Utilitários e configurações
│   │   ├── generated/     # Arquivos gerados pelo Prisma
│   │   └── server.ts      # Servidor principal
│   ├── prisma/
│   │   ├── schema.prisma  # Schema do banco de dados
│   │   └── migrations/    # Migrações do banco
│   ├── test/              # Testes unitários
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/           # Páginas e layouts
    │   ├── components/    # Componentes reutilizáveis
    │   ├── contexts/      # Contextos React
    │   ├── lib/           # Utilitários e validações
    │   └── services/      # Serviços de API
    └── package.json
```

## API Endpoints

### Autenticação
- `POST /login` - Fazer login
- `POST /register` - Registrar novo usuário

### Usuários
- `GET /profile` - Obter perfil do usuário
- `PUT /profile` - Atualizar perfil
- `DELETE /profile` - Excluir conta

### Posts
- `GET /posts` - Listar todos os posts
- `POST /posts` - Criar novo post

### Curtidas
- `POST /posts/:id/like` - Curtir/descurtir post

## Testes

O projeto inclui uma suíte completa de testes unitários para o backend:

```bash
cd backend
npm test
```

Os testes cobrem:
- Autenticação de usuários
- Operações CRUD de usuários
- Criação e listagem de posts
- Sistema de curtidas

## Documentação da API

A documentação completa da API está disponível através do Swagger. Após iniciar o backend, acesse:

```
http://localhost:3333/docs
```

## Contato

Desenvolvido por [Francielly Pazello](https://github.com/franpazello96)

---
