/*
  Warnings:

  - You are about to drop the column `question_id` on the `result_ak03` table. All the data in the column will be lost.
  - You are about to drop the `result_ak03_question` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `question` to the `result_ak03` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `result_ak03` DROP FOREIGN KEY `result_ak03_header_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_ak03` DROP FOREIGN KEY `result_ak03_question_id_fkey`;

-- DropIndex
DROP INDEX `result_ak03_header_id_question_id_key` ON `result_ak03`;

-- DropIndex
DROP INDEX `result_ak03_question_id_fkey` ON `result_ak03`;

-- AlterTable
ALTER TABLE `result_ak03` DROP COLUMN `question_id`,
    ADD COLUMN `question` VARCHAR(255) NOT NULL;

-- DropTable
DROP TABLE `result_ak03_question`;

-- AddForeignKey
-- ALTER TABLE `result_ak05` ADD CONSTRAINT `result_ak05_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
