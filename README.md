# Desafio Tecnico - Backend Node.js API

API REST para cadastro, consulta e analise de dados de especies.

## Stack

- Bun
- Express
- TypeScript
- Prisma
- PostgreSQL via Docker
- Zod
- JWT

## Como Rodar

1. Instale as dependencias:

```bash
bun install
```

2. Configure o ambiente:

```bash
cp .env.example .env
```

3. Suba o PostgreSQL:

```bash
docker compose up -d
```

4. Gere o Prisma Client e rode as migrations:

```bash
bun run db:generate
bun run db:migrate
```

5. Inicie a API:

```bash
bun run dev
```

A API fica disponivel em `http://localhost:3333`.

## Endpoints

### Health

- `GET /health`

### Autenticacao

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Especies

- `GET /api/species`
- `GET /api/species?category=ave`
- `GET /api/species?q=tilapia`
- `GET /api/species/stats`
- `GET /api/species/:id`
- `POST /api/species`
- `PUT /api/species/:id`
- `DELETE /api/species/:id`

As rotas de escrita de especies precisam de `Authorization: Bearer <token>`.

## Exemplo de Cadastro de Especie

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

## Proximos Passos

- Escolher a API publica externa e preencher `ExternalDataService`.
- Adicionar testes unitarios ou de integracao.
- Opcionalmente criar uma collection do Insomnia/Postman.
