/*
  Warnings:

  - You are about to drop the column `result_id` on the `result_ak03` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[result_id]` on the table `result_ak05` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `header_id` to the `result_ak03` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `result_ak03` DROP FOREIGN KEY `result_ak03_result_id_fkey`;

-- DropIndex
DROP INDEX `result_ak03_result_id_fkey` ON `result_ak03`;

-- AlterTable
ALTER TABLE `result_ak03` DROP COLUMN `result_id`,
    ADD COLUMN `header_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `result_ak03_header` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `comment` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `result_ak03_header_result_id_key`(`result_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `result_ak05_result_id_key` ON `result_ak05`(`result_id`);

-- AddForeignKey
ALTER TABLE `result_ak03_header` ADD CONSTRAINT `result_ak03_header_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_ak03` ADD CONSTRAINT `result_ak03_header_id_fkey` FOREIGN KEY (`header_id`) REFERENCES `result_ak03_header`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
