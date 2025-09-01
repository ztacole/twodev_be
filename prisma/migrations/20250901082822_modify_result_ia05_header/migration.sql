/*
  Warnings:

  - Added the required column `is_achieved` to the `result_ia05_header` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `result_ia05_header` ADD COLUMN `element` VARCHAR(255) NULL,
    ADD COLUMN `is_achieved` BOOLEAN NOT NULL,
    ADD COLUMN `kuk` VARCHAR(255) NULL,
    ADD COLUMN `unit` VARCHAR(255) NULL;
