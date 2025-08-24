/*
  Warnings:

  - Added the required column `is_competent` to the `result_ia01_header` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `result_ia01_header` ADD COLUMN `elemen` VARCHAR(255) NULL,
    ADD COLUMN `group` VARCHAR(255) NULL,
    ADD COLUMN `is_competent` BOOLEAN NOT NULL,
    ADD COLUMN `kuk` VARCHAR(255) NULL,
    ADD COLUMN `unit` VARCHAR(255) NULL;
