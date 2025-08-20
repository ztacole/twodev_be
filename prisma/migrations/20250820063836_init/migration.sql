-- CreateTable
CREATE TABLE `role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role_id` INTEGER NOT NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `phone_no` VARCHAR(255) NOT NULL,
    `birth_date` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admin_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `scheme` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `occupation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `scheme_id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assessor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `scheme_id` INTEGER NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `phone_no` VARCHAR(255) NOT NULL,
    `birth_date` DATETIME(3) NOT NULL,

    UNIQUE INDEX `assessor_user_id_key`(`user_id`),
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
CREATE TABLE `assessee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `identity_number` VARCHAR(255) NOT NULL,
    `birth_date` DATETIME(3) NOT NULL,
    `birth_location` VARCHAR(255) NOT NULL,
    `gender` ENUM('male', 'female') NOT NULL,
    `nationality` VARCHAR(255) NOT NULL,
    `phone_no` VARCHAR(255) NOT NULL,
    `house_phone_no` VARCHAR(255) NULL,
    `office_phone_no` VARCHAR(255) NULL,
    `address` VARCHAR(255) NOT NULL,
    `postal_code` VARCHAR(255) NULL,
    `educational_qualifications` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `assessee_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assessee_job` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessee_id` INTEGER NOT NULL,
    `institution_name` VARCHAR(255) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `postal_code` VARCHAR(255) NOT NULL,
    `position` VARCHAR(255) NOT NULL,
    `phone_no` VARCHAR(255) NOT NULL,
    `job_email` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `assessee_job_assessee_id_key`(`assessee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assessment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `occupation_id` INTEGER NOT NULL,
    `code` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assessment_schedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,

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
CREATE TABLE `result` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `assessor_id` INTEGER NOT NULL,
    `assessee_id` INTEGER NOT NULL,
    `approved` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tuk` ENUM('sewaktu', 'tempat_kerja', 'mandiri') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `result_doc` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
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
CREATE TABLE `uc_apl02` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `unit_code` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `element_apl02` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uc_id` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `element_details_apl02` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `element_id` INTEGER NOT NULL,
    `description` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `result_apl02_header` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `approved` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `result_apl02` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_apl02_id` INTEGER NOT NULL,
    `element_id` INTEGER NOT NULL,
    `is_competent` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `apl02_evidence` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_apl02_id` INTEGER NOT NULL,
    `evidence` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `result_ak01_header` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `approved_assessee` BOOLEAN NOT NULL,
    `approved_assessor` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `result_ak01` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `header_id` INTEGER NOT NULL,
    `evidence` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `result_ak02_header` (
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
CREATE TABLE `result_ak02` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `header_id` INTEGER NOT NULL,
    `uc_id` INTEGER NOT NULL,
    `evidence` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group_ia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `scenario` TEXT NOT NULL,
    `duration` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ia02_tool` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `uc_ia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_id` INTEGER NOT NULL,
    `unit_code` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `element_ia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uc_id` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `element_details_ia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `element_id` INTEGER NOT NULL,
    `description` TEXT NOT NULL,
    `benchmark` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `result_ia01_header` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `approved_assessee` BOOLEAN NOT NULL,
    `approved_assessor` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `result_ia01` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `header_id` INTEGER NOT NULL,
    `element_detail_id` INTEGER NOT NULL,
    `is_competent` BOOLEAN NOT NULL,
    `evaluation` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `result_ia02_header` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `approved_assessee` BOOLEAN NOT NULL,
    `approved_assessor` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ia03_question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_id` INTEGER NOT NULL,
    `question` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `result_ia03_header` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `approved_assessee` BOOLEAN NOT NULL,
    `approved_assessor` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `result_ia03` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `header_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `answer` VARCHAR(255) NOT NULL,
    `approved` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ia05_question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `order` INTEGER NOT NULL,
    `question` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_option` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `question_id` INTEGER NOT NULL,
    `option` TEXT NOT NULL,
    `is_answer` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `result_ia05_header` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `approved_assessee` BOOLEAN NOT NULL,
    `approved_assessor` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `result_ia05` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `header_id` INTEGER NOT NULL,
    `option_id` INTEGER NOT NULL,
    `approved` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ia07_question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `question` TEXT NOT NULL,
    `answer_key` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `result_ia07_header` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `approved_assessee` BOOLEAN NOT NULL,
    `approved_assessor` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `result_ia07` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `header_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `approved` BOOLEAN NOT NULL,

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
ALTER TABLE `result` ADD CONSTRAINT `result_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result` ADD CONSTRAINT `result_assessor_id_fkey` FOREIGN KEY (`assessor_id`) REFERENCES `assessor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result` ADD CONSTRAINT `result_assessee_id_fkey` FOREIGN KEY (`assessee_id`) REFERENCES `assessee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_doc` ADD CONSTRAINT `result_doc_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
