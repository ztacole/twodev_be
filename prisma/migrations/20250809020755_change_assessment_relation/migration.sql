/*
  Warnings:

  - You are about to drop the column `assessor_id` on the `assessment` table. All the data in the column will be lost.
  - You are about to drop the column `scheme_id` on the `assessment` table. All the data in the column will be lost.
  - Added the required column `occupation_id` to the `Assessment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `assessment` DROP FOREIGN KEY `Assessment_assessor_id_fkey`;

-- DropForeignKey
ALTER TABLE `assessment` DROP FOREIGN KEY `Assessment_scheme_id_fkey`;

-- DropIndex
DROP INDEX `Assessment_assessor_id_fkey` ON `assessment`;

-- DropIndex
DROP INDEX `Assessment_scheme_id_fkey` ON `assessment`;

-- AlterTable
ALTER TABLE `assessment` DROP COLUMN `assessor_id`,
    DROP COLUMN `scheme_id`,
    ADD COLUMN `occupation_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Assessment` ADD CONSTRAINT `Assessment_occupation_id_fkey` FOREIGN KEY (`occupation_id`) REFERENCES `Occupation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessment_Details` ADD CONSTRAINT `Assessment_Details_assessor_id_fkey` FOREIGN KEY (`assessor_id`) REFERENCES `Assessor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
