/*
  Warnings:

  - You are about to drop the column `elemen` on the `result_ia01_header` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `result_ia01_header` DROP COLUMN `elemen`,
    ADD COLUMN `element` VARCHAR(255) NULL;
