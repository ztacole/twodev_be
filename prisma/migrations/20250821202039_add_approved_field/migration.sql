/*
  Warnings:

  - You are about to drop the column `approved` on the `result_apl02_header` table. All the data in the column will be lost.
  - Added the required column `approved_assessee` to the `result_apl02_header` table without a default value. This is not possible if the table is not empty.
  - Added the required column `approved_assessor` to the `result_apl02_header` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `result_apl02_header` DROP COLUMN `approved`,
    ADD COLUMN `approved_assessee` BOOLEAN NOT NULL,
    ADD COLUMN `approved_assessor` BOOLEAN NOT NULL;
