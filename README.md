# Projeto SENAI Fullstack

## Requisitos

- Node.js 20 ou superior
- PostgreSQL rodando em `localhost:5432`
- Prisma 6 (instalado como dependência do `backend`)

## Configuração do backend

Todos os comandos abaixo são executados na pasta `backend`.

```
cd backend
npm install
```

Crie o arquivo `backend/.env` com:

```
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/passe?schema=public"
CORS_ORIGIN=http://localhost:5173
PORT=3000
```

Troque `USUARIO` e `SENHA` pelos dados do seu PostgreSQL e ajuste `CORS_ORIGIN` para a porta do front-end. Nunca use `*`.

## Banco de dados

### 1. Subir o banco

Crie o banco `passe` (uma única vez):

```
psql -U USUARIO -h localhost -c "CREATE DATABASE passe;"
```

### 2. Aplicar as migrations

Em desenvolvimento (aplica as migrations pendentes e gera o Prisma Client):

```
npx prisma migrate dev
```

Em ambiente já configurado (só aplica, sem criar migrations novas):

```
npx prisma migrate deploy
```

### 3. Recriar o banco do zero

Apaga todos os dados, reaplica todas as migrations do início:

```
npx prisma migrate reset --force
```

### 4. Gerar o Prisma Client (se necessário)

```
npx prisma generate
```

## Rodar a API

```
npm run start:dev
```

A API fica em `http://localhost:3000/api/v1`.

## Teste rápido

```
curl.exe -i http://localhost:3000/api/v1/inexistente
```

Esperado: `404` com corpo `{"message":"..."}`.
