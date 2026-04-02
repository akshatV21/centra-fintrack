-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('income', 'expense');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "type" "PaymentType" NOT NULL DEFAULT 'income';

-- CreateTable
CREATE TABLE "Ledger" (
    "id" TEXT NOT NULL DEFAULT 'GLOBAL_LEDGER',
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "income" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expense" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Ledger_pkey" PRIMARY KEY ("id")
);
