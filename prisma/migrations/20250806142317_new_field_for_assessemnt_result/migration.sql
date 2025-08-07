/*
  Warnings:

  - Added the required column `date_sent` to the `Assessment_Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proof` to the `Assessment_Result` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Assessment_Result` ADD COLUMN `date_sent` DATETIME(3) NOT NULL,
    ADD COLUMN `proof` VARCHAR(191) NOT NULL;
