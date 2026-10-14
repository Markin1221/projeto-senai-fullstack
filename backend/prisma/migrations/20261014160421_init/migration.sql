-- CreateEnum
CREATE TYPE "Posicoes" AS ENUM ('GOL', 'ZAG', 'LAT', 'MEI', 'ATA');

-- CreateEnum
CREATE TYPE "Condicao" AS ENUM ('LIVRE', 'MAL_CONDICIONADO', 'DOENTE');

-- CreateTable
CREATE TABLE "Jogadores" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "posicao" "Posicoes" NOT NULL,
    "agilidade" INTEGER NOT NULL,
    "idade" INTEGER NOT NULL,
    "valor_base" DECIMAL(6,2) NOT NULL,
    "condicao" "Condicao" NOT NULL,
    "clube_id" INTEGER,
    "velocidade" INTEGER NOT NULL,
    "finalizacao" INTEGER NOT NULL,
    "passe" INTEGER NOT NULL,
    "drible" INTEGER NOT NULL,
    "defesa" INTEGER NOT NULL,
    "fisico" INTEGER NOT NULL,
    "potencial" INTEGER NOT NULL,
    "excluido_em" TIMESTAMP(3) NOT NULL,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Jogadores_pkey" PRIMARY KEY ("id")
);
