/*
  Warnings:

  - You are about to drop the `group_ia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `uc_ia` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `element_ia` DROP FOREIGN KEY `element_ia_uc_id_fkey`;

-- DropForeignKey
ALTER TABLE `group_ia` DROP FOREIGN KEY `group_ia_assessment_id_fkey`;

-- DropForeignKey
ALTER TABLE `ia02_tool` DROP FOREIGN KEY `ia02_tool_group_id_fkey`;

-- DropForeignKey
ALTER TABLE `ia03_question` DROP FOREIGN KEY `ia03_question_group_id_fkey`;

-- DropForeignKey
ALTER TABLE `uc_ia` DROP FOREIGN KEY `uc_ia_group_id_fkey`;

-- DropIndex
DROP INDEX `element_ia_uc_id_fkey` ON `element_ia`;

-- DropIndex
DROP INDEX `ia02_tool_group_id_fkey` ON `ia02_tool`;

-- DropIndex
DROP INDEX `ia03_question_group_id_fkey` ON `ia03_question`;

-- DropTable
DROP TABLE `group_ia`;

-- DropTable
DROP TABLE `uc_ia`;

-- CreateTable
CREATE TABLE `group_ia01` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `uc_ia01` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_id` INTEGER NOT NULL,
    `unit_code` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group_ia02` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `scenario` TEXT NOT NULL,
    `duration` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `uc_ia02` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_id` INTEGER NOT NULL,
    `unit_code` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group_ia03` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `uc_ia03` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_id` INTEGER NOT NULL,
    `unit_code` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `group_ia01` ADD CONSTRAINT `group_ia01_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `uc_ia01` ADD CONSTRAINT `uc_ia01_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `group_ia01`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `element_ia` ADD CONSTRAINT `element_ia_uc_id_fkey` FOREIGN KEY (`uc_id`) REFERENCES `uc_ia01`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_ia02` ADD CONSTRAINT `group_ia02_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `uc_ia02` ADD CONSTRAINT `uc_ia02_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `group_ia02`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ia02_tool` ADD CONSTRAINT `ia02_tool_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `group_ia02`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_ia03` ADD CONSTRAINT `group_ia03_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `uc_ia03` ADD CONSTRAINT `uc_ia03_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `group_ia03`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ia03_question` ADD CONSTRAINT `ia03_question_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `group_ia03`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
