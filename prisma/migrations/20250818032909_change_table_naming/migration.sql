/*
  Warnings:

  - The values [Male,Female] on the enum `assessee_gender` will be removed. If these variants are still used in the database, this will fail.
  - The values [PG,Essay] on the enum `assessment_question_type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `assessor_details` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `element_details` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ia02_tools` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `questionpg_details` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `result_details` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `result_docs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `schedule_details` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `schemes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `admin` DROP FOREIGN KEY `Admin_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `apl02_evidence` DROP FOREIGN KEY `APL02_evidence_result_apl02_id_fkey`;

-- DropForeignKey
ALTER TABLE `assessee` DROP FOREIGN KEY `Assessee_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `assessee_answer` DROP FOREIGN KEY `Assessee_Answer_assessee_id_fkey`;

-- DropForeignKey
ALTER TABLE `assessee_answer` DROP FOREIGN KEY `Assessee_Answer_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `assessee_job` DROP FOREIGN KEY `Assessee_Job_assessee_id_fkey`;

-- DropForeignKey
ALTER TABLE `assessment` DROP FOREIGN KEY `Assessment_occupation_id_fkey`;

-- DropForeignKey
ALTER TABLE `assessment_question` DROP FOREIGN KEY `Assessment_Question_assessment_id_fkey`;

-- DropForeignKey
ALTER TABLE `assessment_schedule` DROP FOREIGN KEY `Assessment_Schedule_assessment_id_fkey`;

-- DropForeignKey
ALTER TABLE `assessor` DROP FOREIGN KEY `Assessor_scheme_id_fkey`;

-- DropForeignKey
ALTER TABLE `assessor` DROP FOREIGN KEY `Assessor_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `assessor_details` DROP FOREIGN KEY `Assessor_Details_assessor_id_fkey`;

-- DropForeignKey
ALTER TABLE `element` DROP FOREIGN KEY `Element_unit_competency_id_fkey`;

-- DropForeignKey
ALTER TABLE `element_apl02` DROP FOREIGN KEY `Element_APL02_uc_id_fkey`;

-- DropForeignKey
ALTER TABLE `element_details` DROP FOREIGN KEY `Element_Details_element_id_fkey`;

-- DropForeignKey
ALTER TABLE `element_details_apl02` DROP FOREIGN KEY `Element_Details_APL02_element_id_fkey`;

-- DropForeignKey
ALTER TABLE `element_details_ia` DROP FOREIGN KEY `Element_Details_IA_element_id_fkey`;

-- DropForeignKey
ALTER TABLE `element_ia` DROP FOREIGN KEY `Element_IA_uc_id_fkey`;

-- DropForeignKey
ALTER TABLE `group_ia` DROP FOREIGN KEY `Group_IA_assessment_id_fkey`;

-- DropForeignKey
ALTER TABLE `ia02_tools` DROP FOREIGN KEY `IA02_tools_group_id_fkey`;

-- DropForeignKey
ALTER TABLE `ia03_question` DROP FOREIGN KEY `IA03_Question_group_id_fkey`;

-- DropForeignKey
ALTER TABLE `ia05_question` DROP FOREIGN KEY `IA05_Question_assessment_id_fkey`;

-- DropForeignKey
ALTER TABLE `ia07_question` DROP FOREIGN KEY `IA07_Question_assessment_id_fkey`;

-- DropForeignKey
ALTER TABLE `occupation` DROP FOREIGN KEY `Occupation_scheme_id_fkey`;

-- DropForeignKey
ALTER TABLE `question_option` DROP FOREIGN KEY `Question_Option_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `questionpg_details` DROP FOREIGN KEY `QuestionPG_Details_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `result` DROP FOREIGN KEY `Result_assessee_id_fkey`;

-- DropForeignKey
ALTER TABLE `result` DROP FOREIGN KEY `Result_assessment_id_fkey`;

-- DropForeignKey
ALTER TABLE `result` DROP FOREIGN KEY `Result_assessor_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_ak01` DROP FOREIGN KEY `Result_AK01_header_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_ak01_header` DROP FOREIGN KEY `Result_AK01_Header_result_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_ak02` DROP FOREIGN KEY `Result_AK02_header_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_ak02` DROP FOREIGN KEY `Result_AK02_uc_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_ak02_header` DROP FOREIGN KEY `Result_AK02_Header_result_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_apl02` DROP FOREIGN KEY `Result_APL02_element_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_apl02` DROP FOREIGN KEY `Result_APL02_result_apl02_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_apl02_header` DROP FOREIGN KEY `Result_APL02_Header_result_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_details` DROP FOREIGN KEY `Result_Details_element_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_details` DROP FOREIGN KEY `Result_Details_result_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_docs` DROP FOREIGN KEY `Result_Docs_assessor_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_docs` DROP FOREIGN KEY `Result_Docs_result_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_ia01` DROP FOREIGN KEY `Result_IA01_element_detail_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_ia01` DROP FOREIGN KEY `Result_IA01_header_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_ia01_header` DROP FOREIGN KEY `Result_IA01_Header_result_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_ia02_header` DROP FOREIGN KEY `Result_IA02_Header_result_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_ia03` DROP FOREIGN KEY `Result_IA03_header_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_ia03` DROP FOREIGN KEY `Result_IA03_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_ia03_header` DROP FOREIGN KEY `Result_IA03_Header_result_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_ia05` DROP FOREIGN KEY `Result_IA05_header_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_ia05` DROP FOREIGN KEY `Result_IA05_option_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_ia05_header` DROP FOREIGN KEY `Result_IA05_Header_result_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_ia07` DROP FOREIGN KEY `Result_IA07_header_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_ia07` DROP FOREIGN KEY `Result_IA07_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_ia07_header` DROP FOREIGN KEY `Result_IA07_Header_result_id_fkey`;

-- DropForeignKey
ALTER TABLE `schedule_details` DROP FOREIGN KEY `Schedule_Details_assessor_id_fkey`;

-- DropForeignKey
ALTER TABLE `schedule_details` DROP FOREIGN KEY `Schedule_Details_schedule_id_fkey`;

-- DropForeignKey
ALTER TABLE `uc_apl02` DROP FOREIGN KEY `Uc_APL02_assessment_id_fkey`;

-- DropForeignKey
ALTER TABLE `uc_ia` DROP FOREIGN KEY `Uc_IA_group_id_fkey`;

-- DropForeignKey
ALTER TABLE `unit_competency` DROP FOREIGN KEY `Unit_Competency_assessment_id_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_role_id_fkey`;

-- DropIndex
DROP INDEX `Assessor_scheme_id_fkey` ON `assessor`;

-- DropIndex
DROP INDEX `Occupation_scheme_id_fkey` ON `occupation`;

-- AlterTable
ALTER TABLE `assessee` MODIFY `gender` ENUM('male', 'female') NOT NULL;

-- AlterTable
ALTER TABLE `assessment_question` MODIFY `type` ENUM('pg', 'essay') NOT NULL;

-- DropTable
DROP TABLE `assessor_details`;

-- DropTable
DROP TABLE `element_details`;

-- DropTable
DROP TABLE `ia02_tools`;

-- DropTable
DROP TABLE `questionpg_details`;

-- DropTable
DROP TABLE `result_details`;

-- DropTable
DROP TABLE `result_docs`;

-- DropTable
DROP TABLE `schedule_details`;

-- DropTable
DROP TABLE `schemes`;

-- CreateTable
CREATE TABLE `scheme` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assessor_detail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessor_id` INTEGER NOT NULL,
    `tax_id_number` VARCHAR(255) NOT NULL,
    `bank_book_cover` VARCHAR(255) NOT NULL,
    `certificate` VARCHAR(255) NOT NULL,
    `national_id` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `assessor_detail_assessor_id_key`(`assessor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_detail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `schedule_id` INTEGER NOT NULL,
    `assessor_id` INTEGER NOT NULL,
    `location` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `element_detail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `element_id` INTEGER NOT NULL,
    `description` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_pg_detail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `question_id` INTEGER NOT NULL,
    `option` VARCHAR(255) NOT NULL,
    `isanswer` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `result_doc` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `assessor_id` INTEGER NOT NULL,
    `purpose` VARCHAR(255) NOT NULL,
    `school_report_card` VARCHAR(255) NOT NULL,
    `field_work_practice_certificate` VARCHAR(255) NOT NULL,
    `student_card` VARCHAR(255) NOT NULL,
    `family_card` VARCHAR(255) NOT NULL,
    `id_card` VARCHAR(255) NOT NULL,
    `approved` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `result_detail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `element_id` INTEGER NOT NULL,
    `answer` BOOLEAN NOT NULL,
    `proof` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ia02_tool` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin` ADD CONSTRAINT `admin_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `occupation` ADD CONSTRAINT `occupation_scheme_id_fkey` FOREIGN KEY (`scheme_id`) REFERENCES `scheme`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessor` ADD CONSTRAINT `assessor_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessor` ADD CONSTRAINT `assessor_scheme_id_fkey` FOREIGN KEY (`scheme_id`) REFERENCES `scheme`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessor_detail` ADD CONSTRAINT `assessor_detail_assessor_id_fkey` FOREIGN KEY (`assessor_id`) REFERENCES `assessor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessee` ADD CONSTRAINT `assessee_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessee_job` ADD CONSTRAINT `assessee_job_assessee_id_fkey` FOREIGN KEY (`assessee_id`) REFERENCES `assessee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessment` ADD CONSTRAINT `assessment_occupation_id_fkey` FOREIGN KEY (`occupation_id`) REFERENCES `occupation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessment_schedule` ADD CONSTRAINT `assessment_schedule_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_detail` ADD CONSTRAINT `schedule_detail_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `assessment_schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_detail` ADD CONSTRAINT `schedule_detail_assessor_id_fkey` FOREIGN KEY (`assessor_id`) REFERENCES `assessor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `unit_competency` ADD CONSTRAINT `unit_competency_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `element` ADD CONSTRAINT `element_unit_competency_id_fkey` FOREIGN KEY (`unit_competency_id`) REFERENCES `unit_competency`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `element_detail` ADD CONSTRAINT `element_detail_element_id_fkey` FOREIGN KEY (`element_id`) REFERENCES `element`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessment_question` ADD CONSTRAINT `assessment_question_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_pg_detail` ADD CONSTRAINT `question_pg_detail_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `assessment_question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessee_answer` ADD CONSTRAINT `assessee_answer_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `assessment_question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessee_answer` ADD CONSTRAINT `assessee_answer_assessee_id_fkey` FOREIGN KEY (`assessee_id`) REFERENCES `assessee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result` ADD CONSTRAINT `result_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result` ADD CONSTRAINT `result_assessor_id_fkey` FOREIGN KEY (`assessor_id`) REFERENCES `assessor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result` ADD CONSTRAINT `result_assessee_id_fkey` FOREIGN KEY (`assessee_id`) REFERENCES `assessee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_doc` ADD CONSTRAINT `result_doc_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_doc` ADD CONSTRAINT `result_doc_assessor_id_fkey` FOREIGN KEY (`assessor_id`) REFERENCES `assessor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_detail` ADD CONSTRAINT `result_detail_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_detail` ADD CONSTRAINT `result_detail_element_id_fkey` FOREIGN KEY (`element_id`) REFERENCES `element`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `uc_apl02` ADD CONSTRAINT `uc_apl02_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `element_apl02` ADD CONSTRAINT `element_apl02_uc_id_fkey` FOREIGN KEY (`uc_id`) REFERENCES `uc_apl02`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `element_details_apl02` ADD CONSTRAINT `element_details_apl02_element_id_fkey` FOREIGN KEY (`element_id`) REFERENCES `element_apl02`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_apl02_header` ADD CONSTRAINT `result_apl02_header_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_apl02` ADD CONSTRAINT `result_apl02_result_apl02_id_fkey` FOREIGN KEY (`result_apl02_id`) REFERENCES `result_apl02_header`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_apl02` ADD CONSTRAINT `result_apl02_element_id_fkey` FOREIGN KEY (`element_id`) REFERENCES `element_apl02`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `apl02_evidence` ADD CONSTRAINT `apl02_evidence_result_apl02_id_fkey` FOREIGN KEY (`result_apl02_id`) REFERENCES `result_apl02`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_ak01_header` ADD CONSTRAINT `result_ak01_header_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_ak01` ADD CONSTRAINT `result_ak01_header_id_fkey` FOREIGN KEY (`header_id`) REFERENCES `result_ak01_header`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_ak02_header` ADD CONSTRAINT `result_ak02_header_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_ak02` ADD CONSTRAINT `result_ak02_header_id_fkey` FOREIGN KEY (`header_id`) REFERENCES `result_ak02_header`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_ak02` ADD CONSTRAINT `result_ak02_uc_id_fkey` FOREIGN KEY (`uc_id`) REFERENCES `uc_apl02`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_ia` ADD CONSTRAINT `group_ia_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ia02_tool` ADD CONSTRAINT `ia02_tool_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `group_ia`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `uc_ia` ADD CONSTRAINT `uc_ia_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `group_ia`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `element_ia` ADD CONSTRAINT `element_ia_uc_id_fkey` FOREIGN KEY (`uc_id`) REFERENCES `uc_ia`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `element_details_ia` ADD CONSTRAINT `element_details_ia_element_id_fkey` FOREIGN KEY (`element_id`) REFERENCES `element_ia`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_ia01_header` ADD CONSTRAINT `result_ia01_header_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_ia01` ADD CONSTRAINT `result_ia01_header_id_fkey` FOREIGN KEY (`header_id`) REFERENCES `result_ia01_header`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_ia01` ADD CONSTRAINT `result_ia01_element_detail_id_fkey` FOREIGN KEY (`element_detail_id`) REFERENCES `element_details_ia`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_ia02_header` ADD CONSTRAINT `result_ia02_header_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ia03_question` ADD CONSTRAINT `ia03_question_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `group_ia`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_ia03_header` ADD CONSTRAINT `result_ia03_header_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_ia03` ADD CONSTRAINT `result_ia03_header_id_fkey` FOREIGN KEY (`header_id`) REFERENCES `result_ia03_header`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_ia03` ADD CONSTRAINT `result_ia03_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `ia03_question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ia05_question` ADD CONSTRAINT `ia05_question_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_option` ADD CONSTRAINT `question_option_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `ia05_question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_ia05_header` ADD CONSTRAINT `result_ia05_header_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_ia05` ADD CONSTRAINT `result_ia05_header_id_fkey` FOREIGN KEY (`header_id`) REFERENCES `result_ia05_header`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_ia05` ADD CONSTRAINT `result_ia05_option_id_fkey` FOREIGN KEY (`option_id`) REFERENCES `question_option`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ia07_question` ADD CONSTRAINT `ia07_question_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_ia07_header` ADD CONSTRAINT `result_ia07_header_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_ia07` ADD CONSTRAINT `result_ia07_header_id_fkey` FOREIGN KEY (`header_id`) REFERENCES `result_ia07_header`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_ia07` ADD CONSTRAINT `result_ia07_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `ia07_question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RedefineIndex
CREATE UNIQUE INDEX `admin_user_id_keyy` ON `admin`(`user_id`);
DROP INDEX `Admin_user_id_key` ON `admin`;

-- RedefineIndex
CREATE UNIQUE INDEX `assessee_user_id_keyy` ON `assessee`(`user_id`);
DROP INDEX `Assessee_user_id_key` ON `assessee`;

-- RedefineIndex
CREATE UNIQUE INDEX `assessee_job_assessee_id_keyy` ON `assessee_job`(`assessee_id`);
DROP INDEX `Assessee_Job_assessee_id_key` ON `assessee_job`;

-- RedefineIndex
CREATE UNIQUE INDEX `assessor_user_id_keyy` ON `assessor`(`user_id`);
DROP INDEX `Assessor_user_id_key` ON `assessor`;

-- RedefineIndex
CREATE UNIQUE INDEX `user_email_keyy` ON `user`(`email`);
DROP INDEX `User_email_key` ON `user`;
