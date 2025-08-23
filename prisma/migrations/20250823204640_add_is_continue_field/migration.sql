/*
  Warnings:

  - Added the required column `is_continue` to the `result_apl02_header` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `result_apl02_header` ADD COLUMN `is_continue` BOOLEAN NOT NULL;
