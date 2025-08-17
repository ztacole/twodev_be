/*
  Warnings:

  - Added the required column `assessor_id` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tuk` to the `Result` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Admin` MODIFY `full_name` VARCHAR(255) NOT NULL,
    MODIFY `address` VARCHAR(255) NOT NULL,
    MODIFY `phone_no` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `Assessee` MODIFY `full_name` VARCHAR(255) NOT NULL,
    MODIFY `identity_number` VARCHAR(255) NOT NULL,
    MODIFY `birth_location` VARCHAR(255) NOT NULL,
    MODIFY `nationality` VARCHAR(255) NOT NULL,
    MODIFY `phone_no` VARCHAR(255) NOT NULL,
    MODIFY `house_phone_no` VARCHAR(255) NULL,
    MODIFY `office_phone_no` VARCHAR(255) NULL,
    MODIFY `address` VARCHAR(255) NOT NULL,
    MODIFY `postal_code` VARCHAR(255) NULL,
    MODIFY `educational_qualifications` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `Assessee_Answer` MODIFY `answer` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `Assessee_Job` MODIFY `institution_name` VARCHAR(255) NOT NULL,
    MODIFY `address` VARCHAR(255) NOT NULL,
    MODIFY `postal_code` VARCHAR(255) NOT NULL,
    MODIFY `position` VARCHAR(255) NOT NULL,
    MODIFY `phone_no` VARCHAR(255) NOT NULL,
    MODIFY `job_email` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `Assessment` MODIFY `code` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `Assessment_Question` MODIFY `question` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `Assessor` MODIFY `full_name` VARCHAR(255) NOT NULL,
    MODIFY `address` VARCHAR(255) NOT NULL,
    MODIFY `phone_no` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `Assessor_Details` MODIFY `tax_id_number` VARCHAR(255) NOT NULL,
    MODIFY `bank_book_cover` VARCHAR(255) NOT NULL,
    MODIFY `certificate` VARCHAR(255) NOT NULL,
    MODIFY `national_id` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `Element` MODIFY `title` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `Element_Details` MODIFY `description` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `Occupation` MODIFY `name` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `QuestionPG_Details` MODIFY `option` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `Result` ADD COLUMN `assessor_id` INTEGER NOT NULL,
    ADD COLUMN `tuk` ENUM('sewaktu', 'tempat_kerja', 'mandiri') NOT NULL;

-- AlterTable
ALTER TABLE `Result_Details` MODIFY `proof` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `Result_Docs` MODIFY `purpose` VARCHAR(255) NOT NULL,
    MODIFY `school_report_card` VARCHAR(255) NOT NULL,
    MODIFY `field_work_practice_certificate` VARCHAR(255) NOT NULL,
    MODIFY `student_card` VARCHAR(255) NOT NULL,
    MODIFY `family_card` VARCHAR(255) NOT NULL,
    MODIFY `id_card` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `Role` MODIFY `name` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `Schedule_Details` MODIFY `location` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `Schemes` MODIFY `code` VARCHAR(255) NOT NULL,
    MODIFY `name` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `Unit_Competency` MODIFY `unit_code` VARCHAR(255) NOT NULL,
    MODIFY `title` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `email` VARCHAR(255) NOT NULL,
    MODIFY `password` VARCHAR(255) NOT NULL;

-- CreateTable
CREATE TABLE `Uc_APL02` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `unit_code` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Element_APL02` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uc_id` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Element_Details_APL02` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `element_id` INTEGER NOT NULL,
    `description` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Result_APL02_Header` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `approved` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Result_APL02` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_apl02_id` INTEGER NOT NULL,
    `element_id` INTEGER NOT NULL,
    `is_competent` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `APL02_evidence` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_apl02_id` INTEGER NOT NULL,
    `evidence` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Result_AK01_Header` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `approved_assessee` BOOLEAN NOT NULL,
    `approved_assessor` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Result_AK01` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `header_id` INTEGER NOT NULL,
    `evidence` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Result_AK02_Header` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `approved_assessee` BOOLEAN NOT NULL,
    `approved_assessor` BOOLEAN NOT NULL,
    `is_competent` BOOLEAN NOT NULL,
    `follow_up` TEXT NULL,
    `comment` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Result_AK02` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `header_id` INTEGER NOT NULL,
    `uc_id` INTEGER NOT NULL,
    `evidence` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Group_IA` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `scenario` TEXT NOT NULL,
    `duration` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IA02_tools` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Uc_IA` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_id` INTEGER NOT NULL,
    `unit_code` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Element_IA` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uc_id` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Element_Details_IA` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `element_id` INTEGER NOT NULL,
    `description` TEXT NOT NULL,
    `benchmark` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Result_IA01_Header` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `approved_assessee` BOOLEAN NOT NULL,
    `approved_assessor` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Result_IA01` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `header_id` INTEGER NOT NULL,
    `element_detail_id` INTEGER NOT NULL,
    `is_competent` BOOLEAN NOT NULL,
    `evaluation` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Result_IA02_Header` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `approved_assessee` BOOLEAN NOT NULL,
    `approved_assessor` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IA03_Question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_id` INTEGER NOT NULL,
    `question` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Result_IA03_Header` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `approved_assessee` BOOLEAN NOT NULL,
    `approved_assessor` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Result_IA03` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `header_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `answer` VARCHAR(255) NOT NULL,
    `approved` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IA05_Question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `order` INTEGER NOT NULL,
    `question` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Question_Option` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `question_id` INTEGER NOT NULL,
    `option` TEXT NOT NULL,
    `is_answer` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Result_IA05_Header` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `approved_assessee` BOOLEAN NOT NULL,
    `approved_assessor` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Result_IA05` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `header_id` INTEGER NOT NULL,
    `option_id` INTEGER NOT NULL,
    `approved` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IA07_Question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `question` TEXT NOT NULL,
    `answer_key` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Result_IA07_Header` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `approved_assessee` BOOLEAN NOT NULL,
    `approved_assessor` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Result_IA07` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `header_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `approved` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Result` ADD CONSTRAINT `Result_assessor_id_fkey` FOREIGN KEY (`assessor_id`) REFERENCES `Assessor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Uc_APL02` ADD CONSTRAINT `Uc_APL02_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Element_APL02` ADD CONSTRAINT `Element_APL02_uc_id_fkey` FOREIGN KEY (`uc_id`) REFERENCES `Uc_APL02`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Element_Details_APL02` ADD CONSTRAINT `Element_Details_APL02_element_id_fkey` FOREIGN KEY (`element_id`) REFERENCES `Element_APL02`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_APL02_Header` ADD CONSTRAINT `Result_APL02_Header_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `Result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_APL02` ADD CONSTRAINT `Result_APL02_result_apl02_id_fkey` FOREIGN KEY (`result_apl02_id`) REFERENCES `Result_APL02_Header`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_APL02` ADD CONSTRAINT `Result_APL02_element_id_fkey` FOREIGN KEY (`element_id`) REFERENCES `Element_APL02`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `APL02_evidence` ADD CONSTRAINT `APL02_evidence_result_apl02_id_fkey` FOREIGN KEY (`result_apl02_id`) REFERENCES `Result_APL02`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_AK01_Header` ADD CONSTRAINT `Result_AK01_Header_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `Result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_AK01` ADD CONSTRAINT `Result_AK01_header_id_fkey` FOREIGN KEY (`header_id`) REFERENCES `Result_AK01_Header`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_AK02_Header` ADD CONSTRAINT `Result_AK02_Header_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `Result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_AK02` ADD CONSTRAINT `Result_AK02_header_id_fkey` FOREIGN KEY (`header_id`) REFERENCES `Result_AK02_Header`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_AK02` ADD CONSTRAINT `Result_AK02_uc_id_fkey` FOREIGN KEY (`uc_id`) REFERENCES `Uc_APL02`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Group_IA` ADD CONSTRAINT `Group_IA_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IA02_tools` ADD CONSTRAINT `IA02_tools_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `Group_IA`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Uc_IA` ADD CONSTRAINT `Uc_IA_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `Group_IA`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Element_IA` ADD CONSTRAINT `Element_IA_uc_id_fkey` FOREIGN KEY (`uc_id`) REFERENCES `Uc_IA`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Element_Details_IA` ADD CONSTRAINT `Element_Details_IA_element_id_fkey` FOREIGN KEY (`element_id`) REFERENCES `Element_IA`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_IA01_Header` ADD CONSTRAINT `Result_IA01_Header_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `Result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_IA01` ADD CONSTRAINT `Result_IA01_header_id_fkey` FOREIGN KEY (`header_id`) REFERENCES `Result_IA01_Header`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_IA01` ADD CONSTRAINT `Result_IA01_element_detail_id_fkey` FOREIGN KEY (`element_detail_id`) REFERENCES `Element_Details_IA`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_IA02_Header` ADD CONSTRAINT `Result_IA02_Header_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `Result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IA03_Question` ADD CONSTRAINT `IA03_Question_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `Group_IA`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_IA03_Header` ADD CONSTRAINT `Result_IA03_Header_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `Result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_IA03` ADD CONSTRAINT `Result_IA03_header_id_fkey` FOREIGN KEY (`header_id`) REFERENCES `Result_IA03_Header`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_IA03` ADD CONSTRAINT `Result_IA03_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `IA03_Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IA05_Question` ADD CONSTRAINT `IA05_Question_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question_Option` ADD CONSTRAINT `Question_Option_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `IA05_Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_IA05_Header` ADD CONSTRAINT `Result_IA05_Header_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `Result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_IA05` ADD CONSTRAINT `Result_IA05_header_id_fkey` FOREIGN KEY (`header_id`) REFERENCES `Result_IA05_Header`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_IA05` ADD CONSTRAINT `Result_IA05_option_id_fkey` FOREIGN KEY (`option_id`) REFERENCES `Question_Option`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IA07_Question` ADD CONSTRAINT `IA07_Question_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_IA07_Header` ADD CONSTRAINT `Result_IA07_Header_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `Result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_IA07` ADD CONSTRAINT `Result_IA07_header_id_fkey` FOREIGN KEY (`header_id`) REFERENCES `Result_IA07_Header`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_IA07` ADD CONSTRAINT `Result_IA07_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `IA07_Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
