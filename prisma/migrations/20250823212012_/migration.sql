/*
  Warnings:

  - You are about to drop the column `evidence` on the `result_ak02` table. All the data in the column will be lost.
  - Added the required column `no_reg_met` to the `assessor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `assessor` ADD COLUMN `no_reg_met` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `result_ak02` DROP COLUMN `evidence`;

-- CreateTable
CREATE TABLE `ak02_evidence` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_ak02_id` INTEGER NOT NULL,
    `evidence` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `result_ak03` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `component` VARCHAR(255) NOT NULL,
    `is_ok` BOOLEAN NOT NULL,
    `comment` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `result_ak04` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `q1_yes` BOOLEAN NOT NULL,
    `q2_yes` BOOLEAN NOT NULL,
    `q3_yes` BOOLEAN NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `approved_assessee` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `result_ak05` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `is_competent` BOOLEAN NOT NULL,
    `description` VARCHAR(255) NULL,
    `negative_positive_aspects` VARCHAR(255) NULL,
    `rejection_notes` VARCHAR(255) NULL,
    `improvement_suggestions` VARCHAR(255) NULL,
    `approved_assessor` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ak02_evidence` ADD CONSTRAINT `ak02_evidence_result_ak02_id_fkey` FOREIGN KEY (`result_ak02_id`) REFERENCES `result_ak02`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_ak03` ADD CONSTRAINT `result_ak03_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_ak04` ADD CONSTRAINT `result_ak04_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_ak05` ADD CONSTRAINT `result_ak05_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
