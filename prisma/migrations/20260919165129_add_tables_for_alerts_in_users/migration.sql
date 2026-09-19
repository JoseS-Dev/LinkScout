-- CreateEnum
CREATE TYPE "Frecuency" AS ENUM ('Diario', 'Semanal', 'Mensual');

-- CreateTable
CREATE TABLE "Alert" (
    "id" SERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "terms" TEXT NOT NULL,
    "minSalary" TEXT,
    "frecuency" "Frecuency" NOT NULL DEFAULT 'Diario',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
