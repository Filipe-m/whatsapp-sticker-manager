# Whatsapp Sticker Manager

## Identificação

- Integrantes: Arthur,Julia,Filipe,Vitor,Clara
- Disciplina: Programação Web

---

## Resumo

Projeto full‑stack chamado "Whatsapp Sticker Manager" para gerenciar pacotes e figurinhas (stickers). Tecnologias observadas no repositório:

- Front-end: Angular (ver `frontend/`)
- Back-end: TypeScript rodando sobre Bun com Elysia (ver `backend/`)
- Banco de dados: PostgreSQL (via Docker Compose)
- Armazenamento de objetos: MinIO (via Docker Compose)
- Migrations: Drizzle (config em `backend/drizzle.config.ts`)

---

## Introdução

Contexto: ferramenta para gerenciar coleções de figurinhas/packets compatíveis com WhatsApp, armazenando metadados no banco e arquivos no storage. Objetivo: permitir criação, edição, listagem e compartilhamento de pacotes de figurinhas por usuários autenticados.

Objetivos específicos (exemplos que o projeto suporta/vislumbra):
- CRUD de packs (pacotes de figurinhas)
- Upload, listagem e remoção de figurinhas dentro de packs
- Autenticação/autorização de usuários

---

## Arquitetura do Sistema

### Diagrama de Arquitetura

Componentes:

- Cliente (Frontend Angular)
- API (Backend Elysia rodando em Bun)
- Banco de Dados (Postgres)
- Object Storage (MinIO)

A comunicação típica:
- Cliente ↔ API (HTTP/REST)
- API ↔ Postgres (Drizzle / queries)
- API ↔ MinIO (upload/download de arquivos)

### Descrição dos Componentes

- Front-end (`frontend/`): Aplicação Angular com SSR configurado (arquivos em `frontend/src`). Comandos: `ng serve`, `ng build`, `ng test`.
- Back-end (`backend/`): API em TypeScript usando Elysia; entrada em `backend/src/index.ts`. Usa path aliases configuradas em `backend/tsconfig.json`.
- Banco de Dados: PostgreSQL configurado em `backend/docker-compose.yml` (imagem `postgres:16`). Migrations em `backend/migrations`.
- Armazenamento: MinIO configurado via Docker Compose; bucket criado pelo job `minio-init`.

---

## Funcionalidades Implementadas

### 1) Gerenciar Packs (packs)

- Descrição e Objetivo:
  - Criar, listar, editar e remover pacotes de figurinhas.
- Fluxo de Execução (exemplo):
  1. Usuário solicita criação de um pack no frontend.
  2. Frontend envia requisição POST para `/packs` na API.
  3. Middleware de autenticação (`authMiddleware`) valida o token.
  4. Controller de packs persiste metadados no Postgres (via camada DB).
  5. API retorna sucesso; frontend atualiza a UI.

### 2) Gerenciar Figurinhas (stickers)

- Descrição e Objetivo:
  - Upload de arquivos de figurinha, associação a packs, listagem e remoção.
- Fluxo de Execução (exemplo):
  1. Usuário escolhe arquivo para upload no frontend e confirma o pack alvo.
  2. Frontend envia requisição (multipart/form-data) para rota de stickers.
  3. API valida o usuário e processa o upload; armazena arquivo em MinIO e metadados no Postgres.
  4. API retorna URL/identificador; frontend exibe a figurinha no pack.

### 3) Gerenciamento de Usuários (users)

- Descrição e Objetivo:
  - Registro, login e gestão básica de contas de usuário (autenticação/autorizações mínimas).
- Fluxo de Execução (exemplo):
  1. Usuário realiza login via frontend.
  2. Frontend chama rota de autenticação na API.
  3. API valida credenciais e emite token/seu mecanismo de sessão (estrutura `auth` observada em `backend/src`).
  4. Frontend armazena token e o inclui nas requisições subsequentes.

---

## Como executar

```bash
docker compose up
```

Acesse o frontend em `http://localhost:4200` e a API em `http://localhost:8080` (ou conforme configurado na variável de ambiente `PORT`). Documentação da api se encontra em `http://localhost:8080/docs`.

---

## Observações e pontos importantes

- O carregador de variáveis de ambiente (`backend/src/lib/enviroments.ts`) usa `zod` e encerra o processo se a validação falhar. Certifique-se de preencher `.env` corretamente.
- O backend foi escrito para rodar sobre Bun; não execute assumindo Node sem adaptações.
- Drizzle (migrations) lê as variáveis de ambiente em tempo de importação (ver `backend/drizzle.config.ts`), então garanta que `.env` esteja presente quando rodar comandos de migrations.

---
