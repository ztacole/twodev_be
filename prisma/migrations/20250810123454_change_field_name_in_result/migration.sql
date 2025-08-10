/*
  Warnings:

  - You are about to drop the column `approve` on the `result` table. All the data in the column will be lost.
  - Added the required column `approved` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `approved` to the `Result_Docs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `result` DROP COLUMN `approve`,
    ADD COLUMN `approved` BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE `result_docs` ADD COLUMN `approved` BOOLEAN NOT NULL;
