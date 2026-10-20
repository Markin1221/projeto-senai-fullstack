# Passe — backend

API REST em NestJS, Prisma e PostgreSQL. O passo a passo completo (pré-requisitos, banco, variáveis, execução e diferenciais) está no [README da raiz](../README.md).

Atalhos, dentro de `backend/`:

```bash
cp .env.example .env
npm ci
npx prisma generate
npx prisma migrate deploy   # cria o banco vazio
npm run start:dev           # http://localhost:3000/api/v1  (Swagger em /docs)
npm test                    # testes, terminam sozinhos
npm run lint
npm run format:check
```
