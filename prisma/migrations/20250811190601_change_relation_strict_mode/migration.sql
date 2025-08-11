-- DropForeignKey
ALTER TABLE `admin` DROP FOREIGN KEY `Admin_user_id_fkey`;

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
ALTER TABLE `element_details` DROP FOREIGN KEY `Element_Details_element_id_fkey`;

-- DropForeignKey
ALTER TABLE `occupation` DROP FOREIGN KEY `Occupation_scheme_id_fkey`;

-- DropForeignKey
ALTER TABLE `questionpg_details` DROP FOREIGN KEY `QuestionPG_Details_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `result` DROP FOREIGN KEY `Result_assessee_id_fkey`;

-- DropForeignKey
ALTER TABLE `result` DROP FOREIGN KEY `Result_assessment_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_details` DROP FOREIGN KEY `Result_Details_element_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_details` DROP FOREIGN KEY `Result_Details_result_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_docs` DROP FOREIGN KEY `Result_Docs_assessor_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_docs` DROP FOREIGN KEY `Result_Docs_result_id_fkey`;

-- DropForeignKey
ALTER TABLE `schedule_details` DROP FOREIGN KEY `Schedule_Details_assessor_id_fkey`;

-- DropForeignKey
ALTER TABLE `schedule_details` DROP FOREIGN KEY `Schedule_Details_schedule_id_fkey`;

-- DropForeignKey
ALTER TABLE `unit_competency` DROP FOREIGN KEY `Unit_Competency_assessment_id_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_role_id_fkey`;

-- DropIndex
DROP INDEX `Assessee_Answer_assessee_id_fkey` ON `assessee_answer`;

-- DropIndex
DROP INDEX `Assessee_Answer_question_id_fkey` ON `assessee_answer`;

-- DropIndex
DROP INDEX `Assessment_occupation_id_fkey` ON `assessment`;

-- DropIndex
DROP INDEX `Assessment_Question_assessment_id_fkey` ON `assessment_question`;

-- DropIndex
DROP INDEX `Assessment_Schedule_assessment_id_fkey` ON `assessment_schedule`;

-- DropIndex
DROP INDEX `Assessor_scheme_id_fkey` ON `assessor`;

-- DropIndex
DROP INDEX `Element_unit_competency_id_fkey` ON `element`;

-- DropIndex
DROP INDEX `Element_Details_element_id_fkey` ON `element_details`;

-- DropIndex
DROP INDEX `Occupation_scheme_id_fkey` ON `occupation`;

-- DropIndex
DROP INDEX `QuestionPG_Details_question_id_fkey` ON `questionpg_details`;

-- DropIndex
DROP INDEX `Result_assessee_id_fkey` ON `result`;

-- DropIndex
DROP INDEX `Result_assessment_id_fkey` ON `result`;

-- DropIndex
DROP INDEX `Result_Details_element_id_fkey` ON `result_details`;

-- DropIndex
DROP INDEX `Result_Details_result_id_fkey` ON `result_details`;

-- DropIndex
DROP INDEX `Result_Docs_assessor_id_fkey` ON `result_docs`;

-- DropIndex
DROP INDEX `Result_Docs_result_id_fkey` ON `result_docs`;

-- DropIndex
DROP INDEX `Schedule_Details_assessor_id_fkey` ON `schedule_details`;

-- DropIndex
DROP INDEX `Schedule_Details_schedule_id_fkey` ON `schedule_details`;

-- DropIndex
DROP INDEX `Unit_Competency_assessment_id_fkey` ON `unit_competency`;

-- DropIndex
DROP INDEX `User_role_id_fkey` ON `user`;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessee` ADD CONSTRAINT `Assessee_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessor` ADD CONSTRAINT `Assessor_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessor` ADD CONSTRAINT `Assessor_scheme_id_fkey` FOREIGN KEY (`scheme_id`) REFERENCES `Schemes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Admin` ADD CONSTRAINT `Admin_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Occupation` ADD CONSTRAINT `Occupation_scheme_id_fkey` FOREIGN KEY (`scheme_id`) REFERENCES `Schemes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Unit_Competency` ADD CONSTRAINT `Unit_Competency_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Element` ADD CONSTRAINT `Element_unit_competency_id_fkey` FOREIGN KEY (`unit_competency_id`) REFERENCES `Unit_Competency`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Element_Details` ADD CONSTRAINT `Element_Details_element_id_fkey` FOREIGN KEY (`element_id`) REFERENCES `Element`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessment` ADD CONSTRAINT `Assessment_occupation_id_fkey` FOREIGN KEY (`occupation_id`) REFERENCES `Occupation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessment_Schedule` ADD CONSTRAINT `Assessment_Schedule_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedule_Details` ADD CONSTRAINT `Schedule_Details_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `Assessment_Schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedule_Details` ADD CONSTRAINT `Schedule_Details_assessor_id_fkey` FOREIGN KEY (`assessor_id`) REFERENCES `Assessor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessment_Question` ADD CONSTRAINT `Assessment_Question_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionPG_Details` ADD CONSTRAINT `QuestionPG_Details_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `Assessment_Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessee_Answer` ADD CONSTRAINT `Assessee_Answer_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `Assessment_Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessee_Answer` ADD CONSTRAINT `Assessee_Answer_assessee_id_fkey` FOREIGN KEY (`assessee_id`) REFERENCES `Assessee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result` ADD CONSTRAINT `Result_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result` ADD CONSTRAINT `Result_assessee_id_fkey` FOREIGN KEY (`assessee_id`) REFERENCES `Assessee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_Docs` ADD CONSTRAINT `Result_Docs_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `Result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_Docs` ADD CONSTRAINT `Result_Docs_assessor_id_fkey` FOREIGN KEY (`assessor_id`) REFERENCES `Assessor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_Details` ADD CONSTRAINT `Result_Details_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `Result`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Result_Details` ADD CONSTRAINT `Result_Details_element_id_fkey` FOREIGN KEY (`element_id`) REFERENCES `Element`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessee_Job` ADD CONSTRAINT `Assessee_Job_assessee_id_fkey` FOREIGN KEY (`assessee_id`) REFERENCES `Assessee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessor_Details` ADD CONSTRAINT `Assessor_Details_assessor_id_fkey` FOREIGN KEY (`assessor_id`) REFERENCES `Assessor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
