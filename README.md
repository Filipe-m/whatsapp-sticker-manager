# WhatsApp Sticker Manager

Uma aplicação moderna para gerenciar e compartilhar pacotes de figurinhas (stickers) do WhatsApp. Crie, organize e compartilhe coleções de figurinhas com outros usuários através de uma interface web intuitiva.

## Funcionalidades

* 📦 **Criar e Gerenciar Pacotes** - Organize figurinhas em pacotes personalizados
* 👥 **Compartilhar e Colaborar** - Compartilhe pacotes com outros usuários com permissões granulares (ver, editar, excluir)
* 🔐 **Autenticação Segura** - Autenticação por e-mail/senha com gerenciamento de sessão
* 💾 **Armazenamento em Nuvem** - Figurinhas armazenadas no MinIO (Object Storage compatível com S3)
* 📱 **Design Responsivo** - Funciona perfeitamente em dispositivos desktop e móveis
* 🔍 **Documentação Completa da API** - Docs OpenAPI/Swagger gerados automaticamente em `/docs`

## Stack Tecnológica

### Backend

* **Runtime:** [Bun](https://bun.sh/) - Runtime JavaScript rápido
* **Framework:** [Elysia](https://elysiajs.com/) - Framework web minimalista, focado em TypeScript
* **Banco de Dados:** PostgreSQL com [Drizzle ORM](https://orm.drizzle.team/)
* **Autenticação:** [Better-auth](https://github.com/better-auth/better-auth) - Autenticação baseada em sessão
* **Armazenamento:** [MinIO](https://min.io/) - Armazenamento de objetos compatível com S3
* **Linguagem:** TypeScript (strict mode)
* **Qualidade de Código:** ESLint + Prettier

### Frontend

* Interface web moderna para gerenciar figurinhas

## Início Rápido (Quick Start)

### Pré-requisitos

* **Bun** 1.3.5+ ([Instalar](https://bun.sh/docs/installation))
* **Docker & Docker Compose** (para banco de dados e armazenamento)

### Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd Whatsapp-Sticker-Manager

```


2. **Instale as dependências do backend**
```bash
cd backend
bun install

```


3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com sua configuração

```


4. **Inicie o ambiente de desenvolvimento**
```bash
docker compose up

```


Isso inicia:
* Banco de dados PostgreSQL (porta 5432)
* Armazenamento de objetos MinIO (porta 9000)
* Servidor Backend (porta 3000) com hot-reload



### Desenvolvimento

```bash
# Iniciar servidor de dev com hot-reload
bun run dev

# Checagem de tipos (Type-check)
bun run compile

# Rodar linter com correção automática
bun run lint

# Formatar código com Prettier
bun run format

```

### Documentação da API

Assim que o servidor estiver rodando, acesse:

* **Swagger UI:** http://localhost:3000/docs
* **OpenAPI JSON:** http://localhost:3000/swagger.json

### Build de Produção

```bash
# Construir executável autônomo otimizado
bun run build

# Saída: ./build/server
# Executar: ./build/server

```

O build de produção inclui:

* Build Docker multi-estágio para tamanho de imagem mínimo
* Imagem base "Distroless" para segurança
* Todas as migrações empacotadas

## Estrutura do Projeto

```
backend/
├── src/
│   ├── database/              # Esquema do banco de dados e relações
│   │   └── schema/            # Definições de tabelas do Drizzle
│   ├── modules/               # Módulos de funcionalidades
│   │   ├── packs/             # Operações CRUD de Pacotes
│   │   │   ├── pack.controller.ts
│   │   │   ├── pack.service.ts
│   │   │   └── pack.schema.ts
│   │   └── stickers/          # Gerenciamento de figurinhas
│   ├── lib/                   # Bibliotecas compartilhadas
│   │   ├── auth/              # Utilitários de autenticação
│   │   ├── storage/           # Cliente de armazenamento MinIO
│   │   ├── environment.ts     # Validação de ambiente (Zod)
│   │   └── logger.ts          # Configuração do logger Pino
│   ├── middlewares/           # Middleware de validação de Auth
│   ├── exceptions/            # Classes de erro customizadas com esquemas OpenAPI
│   ├── utils/                 # Utilitários (status HTTP, auxiliares de schema)
│   └── index.ts               # Ponto de entrada da aplicação
├── migrations/                # Migrações do Drizzle geradas automaticamente
├── docker-compose.yml         # Configuração do ambiente de dev
├── Dockerfile                 # Build de produção multi-estágio
├── drizzle.config.ts          # Configuração do Drizzle ORM
├── tsconfig.json              # Configuração do TypeScript (strict mode)
├── eslint.config.js           # Configuração do ESLint
├── .prettierrc                # Configuração do Prettier (4 espaços, sem ponto e vírgula)
└── package.json               # Dependências e scripts

frontend/
└── index.html                 # Interface Web

```

## Endpoints da API

### Autenticação (Better-auth)

* `POST /auth/sign-up` - Registrar novo usuário
* `POST /auth/sign-in` - Login
* `POST /auth/sign-out` - Logout
* `GET /auth/session` - Obter sessão atual

### Pacotes (Packs)

* `GET /pack` - Listar pacotes de figurinhas do usuário (paginado)
* `POST /pack` - Criar novo pacote
* `GET /pack/:id` - Obter detalhes do pacote
* `PATCH /pack/:id` - Atualizar pacote
* `DELETE /pack/:id` - Excluir pacote
* `GET /pack/:id/share` - Obter configurações de compartilhamento do pacote
* `POST /pack/:id/share` - Compartilhar pacote com usuário

### Figurinhas (Stickers)

* `POST /pack/:packId/sticker` - Adicionar figurinha ao pacote
* `DELETE /pack/:packId/sticker/:stickerId` - Remover figurinha
* `GET /pack/:packId/stickers` - Listar figurinhas do pacote

Todos os endpoints estão documentados no Swagger UI em `/docs`.

## Variáveis de Ambiente

Variáveis obrigatórias (veja `.env.example`):

```
# Servidor
NODE_ENV=development|production|test
PORT=3000
BACKEND_URL=http://localhost:3000

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ws_db

# Armazenamento MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_ENDPOINT=http://localhost:9000
BUCKET_NAME=ws-stickers

# Autenticação
AUTH_SECRET=sua-chave-secreta-altere-em-producao

```

## Esquema do Banco de Dados

### Tabelas Principais

* **users** - Usuários de autenticação
* **packs** - Pacotes de figurinhas (dono, flag pública, timestamps)
* **stickers** - Figurinhas individuais (vinculadas a pacotes, referências S3)
* **sharedPacks** - Compartilhamento de pacotes com flags de permissão (`canView`, `canEdit`, `canDelete`)

### Tabelas Better-auth

* **sessions** - Sessões de usuário
* **accounts** - Contas OAuth/social
* **verifications** - Tokens de verificação de e-mail

Veja as migrações na pasta `migrations/` para o esquema completo.

## Explicação das Funcionalidades Chave

### Gerenciamento de Pacotes

* Crie pacotes de figurinhas privados ou públicos
* Faça upload de figurinhas para os pacotes
* Edite metadados do pacote
* Exclua pacotes (apenas se for o dono)

### Compartilhamento e Permissões

Usuários têm permissão para acessar um pacote se eles:

1. **São donos do pacote**, OU
2. **Têm acesso de compartilhamento explícito** com as flags apropriadas

Permissões:

* `canView` - Acesso somente leitura ao pacote e figurinhas
* `canEdit` - Modificar detalhes do pacote e figurinhas
* `canDelete` - Remover o pacote

### Armazenamento de Arquivos

* Figurinhas armazenadas no bucket MinIO: `ws-stickers`
* API compatível com S3 para armazenamento de objetos confiável
* Limpeza automática quando as figurinhas são excluídas

### Tratamento de Erros

Todos os endpoints retornam respostas de erro consistentes:

```json
{
  "error": "Pack not found",
  "status": 404
}

```

Exceções customizadas com esquemas OpenAPI:

* `BadRequestException` (400) - Entrada inválida
* `NotFoundException` (404) - Recurso não encontrado
* `ForbiddenException` (403) - Acesso negado

## Estilo de Código e Convenções

* **Arquivos:** kebab-case (`pack.service.ts`)
* **Classes/Tipos:** PascalCase (`PackService`, `Packs`)
* **Funções/Variáveis:** camelCase (`getPackByID`, `userId`)
* **Campos do Banco de Dados:** snake_case (`created_at`, `updated_at`)
* **Indentação:** 4 espaços
* **Aspas:** Simples (Single quotes)
* **Ponto e vírgula:** Não
* **Organização de Imports:** Auto-organizado pelo Prettier

## Implantação com Docker

### Desenvolvimento

```bash
docker compose up

```

### Produção

```bash
# Construir imagem
docker build -t ws-sticker-manager .

# Rodar container
docker run -p 3000:8080 \
  -e NODE_ENV=production \
  -e DB_HOST=postgres-host \
  -e DB_USER=postgres \
  -e DB_PASSWORD=senha-segura \
  ws-sticker-manager

```

## Testes

Testes ainda não estão configurados. Para adicionar testes:

1. Configure o framework de testes (sugestão: test runner nativo do Bun)
2. Siga os padrões de código existentes para a estrutura de testes
3. Atualize o script `"test"` no `package.json`

## Tarefas Comuns de Desenvolvimento

### Adicionar um Novo Endpoint de API

1. Defina o esquema do banco de dados em `src/database/schema/` (se necessário)
2. Crie a classe de serviço em `src/modules/feature/` com a lógica de negócios
3. Crie o controller com rotas Elysia e esquemas de validação
4. Conecte o controller em `src/index.ts`
5. Execute `bun run compile` e `bun run lint`

### Adicionar um Campo no Banco de Dados

1. Atualize a definição da tabela em `src/database/schema/`
2. Execute o Drizzle para gerar a migração
3. Atualize os métodos de serviço e esquemas de validação
4. Execute `bun run compile`

### Depurar Problemas (Debug)

* Verifique os logs do servidor na saída do servidor de dev
* As respostas da API incluem mensagens de erro e códigos de status HTTP
* Visite `/docs` para testar endpoints interativamente
* Habilite o modo de debug do Drizzle para log de queries do banco de dados

## Licença

Licença MIT - Veja o arquivo [LICENSE](https://www.google.com/search?q=LICENSE) para detalhes.

Copyright (c) 2025 Filipe Moreira Coelho

## Suporte e Contribuição

Para problemas, solicitações de funcionalidades ou contribuições, por favor visite o repositório.

---

**Bom gerenciamento de figurinhas!** 🎨✨
