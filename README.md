# Desafio Tecnico - Backend Node.js API

API REST para cadastro, consulta e analise de dados de especies, com
autenticacao JWT, persistencia em PostgreSQL e enriquecimento de dados pela API
publica do GBIF.

## Stack

- Bun
- Express
- TypeScript
- Prisma
- PostgreSQL hospedado
- Zod
- JWT

## Como o Desafio Foi Estruturado

A solucao foi organizada de forma simples, separando cada responsabilidade em
uma camada pequena:

- `routes`: definem os endpoints HTTP e aplicam middlewares.
- `middlewares`: cuidam de autenticacao, validacao, erros e rotas assincronas.
- `controllers`: recebem a requisicao validada e devolvem a resposta.
- `services`: concentram as regras da aplicacao, chamadas ao Prisma e consulta
  externa ao GBIF.
- `valueObjects`: guardam os schemas Zod e os tipos derivados deles.
- `lib`: reune configuracao de ambiente, Prisma Client, JWT e erro HTTP.
- `prisma`: contem o schema do banco e as migrations.

O fluxo principal segue uma ordem direta: a request entra por uma rota, passa
pela validacao com Zod, chega ao controller e o controller delega a regra para
um service. O service grava ou consulta o PostgreSQL pelo Prisma e, quando uma
especie e cadastrada ou tem o nome cientifico alterado, consulta o GBIF para
salvar os dados externos em `externalData`.

A autenticacao foi mantida objetiva: cadastro e login retornam um JWT; as rotas
de escrita de especies exigem `Authorization: Bearer <token>`. Qualquer usuario
autenticado pode criar, editar ou remover especies, sem regra de ownership por
criador, para nao aumentar a complexidade do desafio.

O banco usado no projeto e um PostgreSQL hospedado na Hostinger via Dokploy. A
conexao e configurada pela variavel `DATABASE_URL` no `.env`.

Para validar a entrega, a API conta com testes automatizados para schemas,
middlewares, JWT e integracao GBIF com `fetch` mockado. Tambem existe uma
collection Postman para testar o fluxo da API e as chamadas externas ao GBIF.

## Como Rodar

1. As dependencias devem ser instaladas:

```bash
bun install
```

2. O arquivo de ambiente deve ser criado a partir do exemplo:

```bash
cp .env.example .env
```

3. O `DATABASE_URL` deve ser ajustado no `.env`.

O projeto usa um banco PostgreSQL hospedado. O `DATABASE_URL` deve receber a
string de conexao do banco provisionado na Hostinger via Dokploy.

4. O Prisma Client deve ser gerado:

```bash
bun run db:generate
```

5. As migrations devem ser executadas quando o banco ainda nao estiver migrado:

```bash
bun run db:deploy
```

Em ambiente de desenvolvimento onde o banco e controlado pelo projeto, tambem e
possivel usar:

```bash
bun run db:migrate
```

6. A API deve ser iniciada:

```bash
bun run dev
```

A API fica disponivel em `http://localhost:3333`.

## Testes

```bash
bun test
bun run typecheck
bun run test:gbif
```

Os testes atuais cobrem schemas Zod, JWT, middlewares principais e o servico de
integracao com o GBIF usando `fetch` mockado.
O `test:gbif` faz uma chamada real para o GBIF usando o
`ExternalDataService`; por padrao testa `Oreochromis niloticus`.
Tambem e possivel passar outro nome cientifico:

```bash
bun run test:gbif "Panthera onca"
```

## Collection Postman

Existe uma collection para testar healthcheck, autenticacao, CRUD de especies e
as consultas externas ao GBIF:

```text
postman/desafio-2026-api-node.postman_collection.json
```

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
Qualquer usuario autenticado pode criar, editar ou remover especies; nao ha
restricao para que apenas o criador altere o proprio registro.

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

## Integracao Externa

O projeto usa a API publica do GBIF para enriquecer os registros de especies.
Ao cadastrar uma especie ou atualizar seu nome cientifico, o
`ExternalDataService` consulta:

- `GET /species/match`: resolve o nome cientifico na taxonomia do GBIF.
- `GET /occurrence/search?limit=0`: busca somente a contagem de ocorrencias do
  taxon encontrado, sem baixar registros.

O resultado e salvo em `Species.externalData`.

Docs: https://techdocs.gbif.org/en/openapi/

Variaveis opcionais:

```env
GBIF_API_BASE_URL="https://api.gbif.org/v1"
GBIF_USER_AGENT="desafio-2026-api-node/1.0 (contato: seu-email@example.com)"
```

O GBIF recomenda definir um `User-Agent` identificavel, preferencialmente com
URL ou email de contato.

## Proximos Passos

- Opcionalmente adicionar testes de integracao para rotas HTTP com banco.
