-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "bank_account_name" TEXT,
ADD COLUMN     "bank_account_number" TEXT,
ADD COLUMN     "bank_name" TEXT,
ADD COLUMN     "birth_date" TIMESTAMP(3),
ADD COLUMN     "email" TEXT,
ADD COLUMN     "employment_type" TEXT,
ADD COLUMN     "marital_status" TEXT,
ADD COLUMN     "salary" DECIMAL(15,2),
ADD COLUMN     "termination_date" TIMESTAMP(3),
ALTER COLUMN "last_name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "applied_voucher_id" INTEGER;

-- CreateTable
CREATE TABLE "vouchers" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discount_type" TEXT NOT NULL,
    "discount_value" DECIMAL(15,2) NOT NULL,
    "max_discount" DECIMAL(15,2),
    "min_transaction" DECIMAL(15,2),
    "usage_limit" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_vouchers" (
    "id" SERIAL NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "voucher_id" INTEGER NOT NULL,
    "discount_amount" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vouchers_code_key" ON "vouchers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_vouchers_transaction_id_voucher_id_key" ON "transaction_vouchers"("transaction_id", "voucher_id");

-- AddForeignKey
ALTER TABLE "transaction_vouchers" ADD CONSTRAINT "transaction_vouchers_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_vouchers" ADD CONSTRAINT "transaction_vouchers_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
