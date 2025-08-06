/*
  Warnings:

  - The values [PENDING,APPROVED,REJECTED] on the enum `Assessment_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `assessment` MODIFY `status` ENUM('PLANNED', 'ONGOING', 'COMPLETED') NOT NULL;
