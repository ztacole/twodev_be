/*
  Warnings:

  - Made the column `approved_assessor` on table `result_ak05` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `result_ak05` MODIFY `approved_assessor` BOOLEAN NOT NULL;
