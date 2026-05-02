# CLAUDE.md

## Contexto do Projeto

Este projeto e uma API REST para o desafio tecnico de backend da SIAPESQ. O objetivo e gerenciar e analisar dados de especies, com cadastro, consultas, estatisticas, autenticacao JWT, banco relacional e uma futura integracao com API publica externa.

O foco atual e deixar a base bem organizada, simples de evoluir e com as responsabilidades separadas.

## Stack

- Runtime/bundler: Bun
- API HTTP: Express
- Linguagem: TypeScript
- ORM: Prisma
- Banco: PostgreSQL
- Banco local: Docker Compose
- Validacao: Zod
- Autenticacao: JWT
- Hash de senha: `Bun.password` com Argon2

## Comandos

```bash
bun install
bun run dev
bun run start
bun run typecheck
```

Comandos do banco e Prisma:

```bash
docker compose up -d
bun run db:generate
bun run db:migrate
bun run db:deploy
bun run db:studio
```

Observacao: o Prisma precisa baixar/ter disponivel o engine local para `generate` e `migrate`. Se o ambiente bloquear internet, esses comandos podem falhar ate que o engine esteja presente ou a permissao de rede seja liberada.

## Variaveis de Ambiente

Exemplo em `.env.example`:

```env
PORT=3333
DATABASE_URL="postgresql://desafio:desafio@localhost:5432/especies?schema=public"
JWT_SECRET="troque-este-segredo-em-producao-com-pelo-menos-32-caracteres"
JWT_EXPIRES_IN_SECONDS=86400
```

O arquivo `.env` e ignorado pelo Git.

## Estrutura Principal

```text
src/
  app.ts
  server.ts
  controllers/
  lib/
  middlewares/
  routes/
  services/
  types/
  valueObjects/
prisma/
  schema.prisma
  migrations/
docker-compose.yml
```

Responsabilidades:

- `src/app.ts`: configura Express, JSON, healthcheck, rotas e middlewares finais.
- `src/server.ts`: inicia o servidor HTTP.
- `src/controllers`: camada HTTP, recebe request e devolve response.
- `src/services`: regras de aplicacao e acesso ao Prisma.
- `src/routes`: agrupamento das rotas.
- `src/middlewares`: autenticacao, validacao, tratamento de erros e async handler.
- `src/lib`: utilitarios compartilhados, Prisma Client, env, JWT e erro HTTP.
- `src/valueObjects`: schemas Zod e tipos derivados.
- `src/types`: tipos globais e augmentations do Express.

## Modelo de Dados

### User

Representa o usuario autenticado.

Campos principais:

- `id`
- `name`
- `email`
- `passwordHash`
- `createdAt`
- `updatedAt`

### Species

Representa uma especie cadastrada.

Campos principais:

- `id`
- `commonName`
- `scientificName`
- `category`
- `latitude`
- `longitude`
- `recordedAt`
- `externalData`
- `createdById`
- `createdAt`
- `updatedAt`

`externalData` e `Json?` porque a API publica externa ainda sera escolhida.

## Endpoints

### Health

- `GET /health`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Species

- `GET /api/species`
- `GET /api/species?category=ave`
- `GET /api/species?q=tilapia`
- `GET /api/species/stats`
- `GET /api/species/:id`
- `POST /api/species`
- `PUT /api/species/:id`
- `DELETE /api/species/:id`

Rotas de escrita de especies exigem:

```http
Authorization: Bearer <token>
```

## Payloads

Cadastro de usuario:

```json
{
  "name": "Luan",
  "email": "luan@example.com",
  "password": "12345678"
}
```

Login:

```json
{
  "email": "luan@example.com",
  "password": "12345678"
}
```

Cadastro de especie:

```json
{
  "commonName": "Tilapia",
  "scientificName": "Oreochromis niloticus",
  "category": "peixe",
  "latitude": -3.7319,
  "longitude": -38.5267,
  "recordedAt": "2026-05-02T20:00:00.000Z"
}
```

## Padroes de Codigo

- Manter controllers finos.
- Regras de negocio ficam em services.
- Validacoes de entrada ficam em schemas Zod dentro de `valueObjects`.
- Nao acessar Prisma diretamente em controllers.
- Erros esperados devem usar `HttpError`.
- Rotas async devem usar `asyncHandler`.
- Novas rotas devem passar por `validate` quando receberem `body`, `params` ou `query`.
- Senhas nunca devem ser retornadas em responses.
- Categorias sao normalizadas para lowercase nos schemas.

## Autenticacao

JWT assinado com HMAC SHA-256 usando `JWT_SECRET`.

O payload contem:

- `sub`: id do usuario
- `email`: email do usuario
- `iat`: emitido em
- `exp`: expiracao

O middleware `authMiddleware` popula:

```ts
request.user = {
  id: payload.sub,
  email: payload.email,
};
```

## Integracao Externa

A API publica externa ainda nao foi escolhida.

O ponto preparado para isso e:

```text
src/services/external-data.service.ts
```

Hoje ele retorna `null`. Quando a API for escolhida, implementar `getSpeciesData` e gravar o retorno em `Species.externalData`.

Boas opcoes futuras:

- Clima por latitude/longitude
- Geolocalizacao reversa
- Dados ambientais
- Alguma API publica relacionada a biodiversidade

## Banco Local

O `docker-compose.yml` sobe um PostgreSQL local:

- usuario: `desafio`
- senha: `desafio`
- database: `especies`
- porta: `5432`

## Migration Inicial

Existe migration inicial em:

```text
prisma/migrations/20260502180000_init/migration.sql
```

Ela cria:

- tabela `User`
- tabela `species`
- indices
- relacionamento `species.createdById -> User.id`

## Pendencias Planejadas

- Escolher e implementar a API externa.
- Adicionar testes unitarios ou de integracao.
- Criar collection Insomnia/Postman se sobrar tempo.
- Rodar `bun run db:generate` e `bun run db:migrate` em ambiente com Prisma engine disponivel.
- Revisar ownership das especies se a regra exigir que apenas o criador edite/delete.

## Observacoes Importantes

- O projeto esta configurado para Bun.
- O Prisma Client precisa ser gerado antes de rodar a API contra o banco.
- A estrutura foi pensada para evoluir sem misturar responsabilidades.
- O README deve continuar focado em instrucoes de execucao e endpoints.
- Este arquivo deve servir como contexto rapido para agentes ou colaboradores entenderem o projeto sem reler toda a conversa.
