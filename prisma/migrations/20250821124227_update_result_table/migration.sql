/*
  Warnings:

  - You are about to drop the column `approved` on the `result` table. All the data in the column will be lost.
  - You are about to drop the column `approved` on the `result_doc` table. All the data in the column will be lost.
  - Added the required column `is_competent` to the `result` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `result` DROP COLUMN `approved`,
    ADD COLUMN `is_competent` BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE `result_doc` DROP COLUMN `approved`;
