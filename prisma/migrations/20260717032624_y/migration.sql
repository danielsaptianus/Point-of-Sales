/*
  Warnings:

  - You are about to drop the column `email` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `position_id` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[employee_number]` on the table `employees` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `employees` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `employee_number` to the `employees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `employees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position_id` to the `employees` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_position_id_fkey";

-- DropIndex
DROP INDEX "employees_email_key";

-- AlterTable
ALTER TABLE "employees" DROP COLUMN "email",
DROP COLUMN "role",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "employee_number" TEXT NOT NULL,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "hire_date" TIMESTAMP(3),
ADD COLUMN     "position_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "first_name",
DROP COLUMN "last_name",
DROP COLUMN "position_id",
ADD COLUMN     "last_login" TIMESTAMP(3),
ADD COLUMN     "last_password_reset" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "employees_employee_number_key" ON "employees"("employee_number");

-- CreateIndex
CREATE UNIQUE INDEX "employees_user_id_key" ON "employees"("user_id");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
