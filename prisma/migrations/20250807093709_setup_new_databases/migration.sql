/*
  Warnings:

  - The values [MALE,FEMALE] on the enum `Assessee_gender` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `location` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Assessment` table. All the data in the column will be lost.
  - The values [PLANNED,ONGOING,COMPLETED] on the enum `Assessment_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `end_date` on the `Assessment` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to drop the column `name` on the `Element` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Unit_Competency` table. All the data in the column will be lost.
  - You are about to drop the column `scheme_id` on the `Unit_Competency` table. All the data in the column will be lost.
  - You are about to drop the `Assessment_Assesse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Assessment_Result` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `Assessee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `Assessor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assessment_id` to the `Unit_Competency` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Admin` DROP FOREIGN KEY `Admin_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Assessee` DROP FOREIGN KEY `Assessee_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Assessee_Job` DROP FOREIGN KEY `Assessee_Job_assessee_id_fkey`;

-- DropForeignKey
ALTER TABLE `Assessment` DROP FOREIGN KEY `Assessment_assessor_id_fkey`;

-- DropForeignKey
ALTER TABLE `Assessment` DROP FOREIGN KEY `Assessment_scheme_id_fkey`;

-- DropForeignKey
ALTER TABLE `Assessment_Assesse` DROP FOREIGN KEY `Assessment_Assesse_assessee_id_fkey`;

-- DropForeignKey
ALTER TABLE `Assessment_Assesse` DROP FOREIGN KEY `Assessment_Assesse_assessment_id_fkey`;

-- DropForeignKey
ALTER TABLE `Assessment_Result` DROP FOREIGN KEY `Assessment_Result_assessee_id_fkey`;

-- DropForeignKey
ALTER TABLE `Assessment_Result` DROP FOREIGN KEY `Assessment_Result_assessment_id_fkey`;

-- DropForeignKey
ALTER TABLE `Assessor` DROP FOREIGN KEY `Assessor_scheme_id_fkey`;

-- DropForeignKey
ALTER TABLE `Assessor` DROP FOREIGN KEY `Assessor_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Element` DROP FOREIGN KEY `Element_unit_competency_id_fkey`;

-- DropForeignKey
ALTER TABLE `Unit_Competency` DROP FOREIGN KEY `Unit_Competency_scheme_id_fkey`;

-- DropIndex
DROP INDEX `Admin_user_id_fkey` ON `Admin`;

-- DropIndex
DROP INDEX `Assessee_user_id_fkey` ON `Assessee`;

-- DropIndex
DROP INDEX `Assessee_Job_assessee_id_fkey` ON `Assessee_Job`;

-- DropIndex
DROP INDEX `Assessment_assessor_id_fkey` ON `Assessment`;

-- DropIndex
DROP INDEX `Assessment_scheme_id_fkey` ON `Assessment`;

-- DropIndex
DROP INDEX `Assessor_scheme_id_fkey` ON `Assessor`;

-- DropIndex
DROP INDEX `Assessor_user_id_fkey` ON `Assessor`;

-- DropIndex
DROP INDEX `Element_unit_competency_id_fkey` ON `Element`;

-- DropIndex
DROP INDEX `Unit_Competency_scheme_id_fkey` ON `Unit_Competency`;

-- AlterTable
ALTER TABLE `Assessee` MODIFY `gender` ENUM('Male', 'Female') NOT NULL;

-- AlterTable
ALTER TABLE `Assessment` DROP COLUMN `location`,
    DROP COLUMN `name`,
    ADD COLUMN `code` VARCHAR(191) NOT NULL,
    MODIFY `status` ENUM('Planned', 'Ongoing', 'Completed') NOT NULL,
    MODIFY `end_date` DATETIME(3) NOT NULL,
    MODIFY `assessor_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `Element` DROP COLUMN `name`;

-- AlterTable
ALTER TABLE `Unit_Competency` DROP COLUMN `description`,
    DROP COLUMN `scheme_id`,
    ADD COLUMN `assessment_id` INTEGER NOT NULL;

-- DropTable
DROP TABLE `Assessment_Assesse`;

-- DropTable
DROP TABLE `Assessment_Result`;

-- CreateTable
CREATE TABLE `Occupation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `scheme_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Element_Details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `element_id` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assessment_Details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `assessor_id` INTEGER NOT NULL,
    `location` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assessment_Question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `type` ENUM('PG', 'Essay') NOT NULL,
    `question` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuestionPG_Details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `question_id` INTEGER NOT NULL,
    `option` VARCHAR(191) NOT NULL,
    `isanswer` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assessee_Answer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `question_id` INTEGER NOT NULL,
    `assessee_id` INTEGER NOT NULL,
    `answer` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Result` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `assessee_id` INTEGER NOT NULL,
    `approve` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Result_Details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `element_id` INTEGER NOT NULL,
    `answer` BOOLEAN NOT NULL,
    `proof` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assessor_Details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessor_id` INTEGER NOT NULL,
    `tax_id_number` VARCHAR(191) NOT NULL,
    `bank_book_cover` VARCHAR(191) NOT NULL,
    `certificate` VARCHAR(191) NOT NULL,
    `national_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Assessor_Details_assessor_id_key`(`assessor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Admin_user_id_key` ON `Admin`(`user_id`);

-- CreateIndex
CREATE UNIQUE INDEX `Assessee_user_id_key` ON `Assessee`(`user_id`);

-- CreateIndex
CREATE UNIQUE INDEX `Assessor_user_id_key` ON `Assessor`(`user_id`);

-- AddForeignKey
ALTER TABLE `Assessee` ADD CONSTRAINT `Assessee_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessor` ADD CONSTRAINT `Assessor_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessor` ADD CONSTRAINT `Assessor_scheme_id_fkey` FOREIGN KEY (`scheme_id`) REFERENCES `Schemes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Admin` ADD CONSTRAINT `Admin_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Occupation` ADD CONSTRAINT `Occupation_scheme_id_fkey` FOREIGN KEY (`scheme_id`) REFERENCES `Schemes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Unit_Competency` ADD CONSTRAINT `Unit_Competency_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `Assessment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Element` ADD CONSTRAINT `Element_unit_competency_id_fkey` FOREIGN KEY (`unit_competency_id`) REFERENCES `Unit_Competency`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Element_Details` ADD CONSTRAINT `Element_Details_element_id_fkey` FOREIGN KEY (`element_id`) REFERENCES `Element`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessment` ADD CONSTRAINT `Assessment_scheme_id_fkey` FOREIGN KEY (`scheme_id`) REFERENCES `Schemes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessment` ADD CONSTRAINT `Assessment_assessor_id_fkey` FOREIGN KEY (`assessor_id`) REFERENCES `Assessor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessment_Details` ADD CONSTRAINT `Assessment_Details_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `Assessment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessment_Question` ADD CONSTRAINT `Assessment_Question_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `Assessment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionPG_Details` ADD CONSTRAINT `QuestionPG_Details_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `Assessment_Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessee_Answer` ADD CONSTRAINT `Assessee_Answer_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `Assessment_Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessee_Answer` ADD CONSTRAINT `Assessee_Answer_assessee_id_fkey` FOREIGN KEY (`assessee_id`) REFERENCES `Assessee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result` ADD CONSTRAINT `Result_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `Assessment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result` ADD CONSTRAINT `Result_assessee_id_fkey` FOREIGN KEY (`assessee_id`) REFERENCES `Assessee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_Details` ADD CONSTRAINT `Result_Details_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `Result`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_Details` ADD CONSTRAINT `Result_Details_element_id_fkey` FOREIGN KEY (`element_id`) REFERENCES `Element`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessee_Job` ADD CONSTRAINT `Assessee_Job_assessee_id_fkey` FOREIGN KEY (`assessee_id`) REFERENCES `Assessee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessor_Details` ADD CONSTRAINT `Assessor_Details_assessor_id_fkey` FOREIGN KEY (`assessor_id`) REFERENCES `Assessor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
