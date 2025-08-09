-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role_id` INTEGER NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assessee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `identity_number` VARCHAR(191) NOT NULL,
    `birth_date` DATETIME(3) NOT NULL,
    `birth_location` VARCHAR(191) NOT NULL,
    `gender` ENUM('Male', 'Female') NOT NULL,
    `nationality` VARCHAR(191) NOT NULL,
    `phone_no` VARCHAR(191) NOT NULL,
    `house_phone_no` VARCHAR(191) NULL,
    `office_phone_no` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL,
    `postal_code` VARCHAR(191) NULL,
    `educational_qualifications` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Assessee_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assessor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `scheme_id` INTEGER NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `phone_no` VARCHAR(191) NOT NULL,
    `birth_date` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Assessor_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `phone_no` VARCHAR(191) NOT NULL,
    `birth_date` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Admin_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Schemes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Occupation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `scheme_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Unit_Competency` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `unit_code` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Element` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unit_competency_id` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,

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
CREATE TABLE `Assessment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `occupation_id` INTEGER NOT NULL,
    `code` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assessment_Schedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Schedule_Details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `schedule_id` INTEGER NOT NULL,
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
CREATE TABLE `Result_Docs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `assessor_id` INTEGER NOT NULL,
    `purpose` VARCHAR(191) NOT NULL,
    `school_report_card` VARCHAR(191) NOT NULL,
    `field_work_practice_certificate` VARCHAR(191) NOT NULL,
    `student_card` VARCHAR(191) NOT NULL,
    `family_card` VARCHAR(191) NOT NULL,
    `id_card` VARCHAR(191) NOT NULL,

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
CREATE TABLE `Assessee_Job` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessee_id` INTEGER NOT NULL,
    `institution_name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `postal_code` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `phone_no` VARCHAR(191) NOT NULL,
    `job_email` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Assessee_Job_assessee_id_key`(`assessee_id`),
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

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE `Assessment` ADD CONSTRAINT `Assessment_occupation_id_fkey` FOREIGN KEY (`occupation_id`) REFERENCES `Occupation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessment_Schedule` ADD CONSTRAINT `Assessment_Schedule_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `Assessment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedule_Details` ADD CONSTRAINT `Schedule_Details_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `Assessment_Schedule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedule_Details` ADD CONSTRAINT `Schedule_Details_assessor_id_fkey` FOREIGN KEY (`assessor_id`) REFERENCES `Assessor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE `Result_Docs` ADD CONSTRAINT `Result_Docs_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `Result`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_Docs` ADD CONSTRAINT `Result_Docs_assessor_id_fkey` FOREIGN KEY (`assessor_id`) REFERENCES `Assessor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_Details` ADD CONSTRAINT `Result_Details_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `Result`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_Details` ADD CONSTRAINT `Result_Details_element_id_fkey` FOREIGN KEY (`element_id`) REFERENCES `Element`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessee_Job` ADD CONSTRAINT `Assessee_Job_assessee_id_fkey` FOREIGN KEY (`assessee_id`) REFERENCES `Assessee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessor_Details` ADD CONSTRAINT `Assessor_Details_assessor_id_fkey` FOREIGN KEY (`assessor_id`) REFERENCES `Assessor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
