/*
  Warnings:

  - Added the required column `approved` to the `result_doc` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `result_doc` ADD COLUMN `approved` BOOLEAN NOT NULL;
