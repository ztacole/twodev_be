CREATE TABLE `admin` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`address` varchar(255) NOT NULL,
	`phone_no` varchar(255) NOT NULL,
	`birth_date` date NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_user_id_unique` UNIQUE(`user_id`)
);

CREATE TABLE `ak02_evidence` (
	`id` int AUTO_INCREMENT NOT NULL,
	`result_ak02_id` int NOT NULL,
	`evidence` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ak02_evidence_id` PRIMARY KEY(`id`)
);

CREATE TABLE `apl02_evidence` (
	`id` int AUTO_INCREMENT NOT NULL,
	`result_apl02_id` int NOT NULL,
	`evidence` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `apl02_evidence_id` PRIMARY KEY(`id`)
);

CREATE TABLE `assessee` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`identity_number` varchar(255) NOT NULL,
	`birth_date` date NOT NULL,
	`birth_location` varchar(255) NOT NULL,
	`gender` enum('male','female') NOT NULL,
	`nationality` varchar(255) NOT NULL,
	`phone_no` varchar(255) NOT NULL,
	`house_phone_no` varchar(255),
	`office_phone_no` varchar(255),
	`address` varchar(255) NOT NULL,
	`postal_code` varchar(255),
	`educational_qualifications` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessee_id` PRIMARY KEY(`id`)
);

CREATE TABLE `assessee_job` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessee_id` int NOT NULL,
	`institution_name` varchar(255) NOT NULL,
	`address` varchar(255) NOT NULL,
	`postal_code` varchar(255) NOT NULL,
	`position` varchar(255) NOT NULL,
	`phone_no` varchar(255) NOT NULL,
	`job_email` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessee_job_id` PRIMARY KEY(`id`),
	CONSTRAINT `assessee_job_assessee_id_unique` UNIQUE(`assessee_id`)
);

CREATE TABLE `assessment` (
	`id` int AUTO_INCREMENT NOT NULL,
	`occupation_id` int NOT NULL,
	`code` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessment_id` PRIMARY KEY(`id`)
);

CREATE TABLE `assessment_schedule` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessment_id` int NOT NULL,
	`start_date` timestamp NOT NULL DEFAULT (now()),
	`end_date` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessment_schedule_id` PRIMARY KEY(`id`)
);

CREATE TABLE `assessor` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`scheme_id` int NOT NULL,
	`no_reg_met` varchar(255) NOT NULL,
	`address` varchar(255) NOT NULL,
	`phone_no` varchar(255) NOT NULL,
	`birth_date` date NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessor_id` PRIMARY KEY(`id`),
	CONSTRAINT `assessor_user_id_unique` UNIQUE(`user_id`)
);

CREATE TABLE `assessor_detail` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessor_id` int NOT NULL,
	`tax_id_number` varchar(255) NOT NULL,
	`bank_book_cover` varchar(255) NOT NULL,
	`certificate` varchar(255) NOT NULL,
	`national_id` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessor_detail_id` PRIMARY KEY(`id`),
	CONSTRAINT `assessor_detail_assessor_id_unique` UNIQUE(`assessor_id`)
);

CREATE TABLE `element_apl02` (
	`id` int AUTO_INCREMENT NOT NULL,
	`uc_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `element_apl02_id` PRIMARY KEY(`id`)
);

CREATE TABLE `element_details_apl02` (
	`id` int AUTO_INCREMENT NOT NULL,
	`element_id` int NOT NULL,
	`description` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `element_details_apl02_id` PRIMARY KEY(`id`)
);

CREATE TABLE `element_details_ia` (
	`id` int AUTO_INCREMENT NOT NULL,
	`element_id` int NOT NULL,
	`description` text NOT NULL,
	`benchmark` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `element_details_ia_id` PRIMARY KEY(`id`)
);

CREATE TABLE `element_ia` (
	`id` int AUTO_INCREMENT NOT NULL,
	`uc_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `element_ia_id` PRIMARY KEY(`id`)
);

CREATE TABLE `group_ia01` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessment_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `group_ia01_id` PRIMARY KEY(`id`)
);

CREATE TABLE `group_ia02` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessment_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`scenario` text NOT NULL,
	`duration` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `group_ia02_id` PRIMARY KEY(`id`)
);

CREATE TABLE `group_ia03` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessment_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `group_ia03_id` PRIMARY KEY(`id`)
);

CREATE TABLE `ia02_pdf` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessment_id` int NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ia02_pdf_id` PRIMARY KEY(`id`),
	CONSTRAINT `ia02_pdf_assessment_id_unique` UNIQUE(`assessment_id`)
);

CREATE TABLE `ia02_tool` (
	`id` int AUTO_INCREMENT NOT NULL,
	`group_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ia02_tool_id` PRIMARY KEY(`id`)
);

CREATE TABLE `ia03_question` (
	`id` int AUTO_INCREMENT NOT NULL,
	`group_id` int NOT NULL,
	`question` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ia03_question_id` PRIMARY KEY(`id`)
);

CREATE TABLE `ia05_question` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessment_id` int NOT NULL,
	`order` int NOT NULL,
	`question` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ia05_question_id` PRIMARY KEY(`id`)
);

CREATE TABLE `ia07_question` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessment_id` int NOT NULL,
	`question` text NOT NULL,
	`answer_key` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ia07_question_id` PRIMARY KEY(`id`)
);

CREATE TABLE `occupation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scheme_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `occupation_id` PRIMARY KEY(`id`)
);

CREATE TABLE `question_option` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question_id` int NOT NULL,
	`option` text NOT NULL,
	`is_answer` boolean NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `question_option_id` PRIMARY KEY(`id`)
);

CREATE TABLE `result` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessment_id` int NOT NULL,
	`assessor_id` int NOT NULL,
	`assessee_id` int NOT NULL,
	`is_competent` boolean NOT NULL,
	`tuk` enum('sewaktu','tempat_kerja','mandiri') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `result_id` PRIMARY KEY(`id`)
);

CREATE TABLE `result_ak01` (
	`id` int AUTO_INCREMENT NOT NULL,
	`header_id` int NOT NULL,
	`evidence` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `result_ak01_id` PRIMARY KEY(`id`)
);

CREATE TABLE `result_ak01_header` (
	`id` int AUTO_INCREMENT NOT NULL,
	`result_id` int NOT NULL,
	`approved_assessee` boolean NOT NULL,
	`approved_assessor` boolean NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `result_ak01_header_id` PRIMARY KEY(`id`),
	CONSTRAINT `result_ak01_header_result_id_unique` UNIQUE(`result_id`)
);

CREATE TABLE `result_ak02` (
	`id` int AUTO_INCREMENT NOT NULL,
	`header_id` int NOT NULL,
	`uc_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `result_ak02_id` PRIMARY KEY(`id`)
);

CREATE TABLE `result_ak02_header` (
	`id` int AUTO_INCREMENT NOT NULL,
	`result_id` int NOT NULL,
	`approved_assessee` boolean NOT NULL,
	`approved_assessor` boolean NOT NULL,
	`is_competent` boolean NOT NULL,
	`follow_up` text,
	`comment` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `result_ak02_header_id` PRIMARY KEY(`id`),
	CONSTRAINT `result_ak02_header_result_id_unique` UNIQUE(`result_id`)
);

CREATE TABLE `result_ak03` (
	`id` int AUTO_INCREMENT NOT NULL,
	`header_id` int NOT NULL,
	`question` varchar(255) NOT NULL,
	`answer` boolean NOT NULL,
	`comment` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `result_ak03_id` PRIMARY KEY(`id`)
);

CREATE TABLE `result_ak03_header` (
	`id` int AUTO_INCREMENT NOT NULL,
	`result_id` int NOT NULL,
	`comment` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `result_ak03_header_id` PRIMARY KEY(`id`),
	CONSTRAINT `result_ak03_header_result_id_unique` UNIQUE(`result_id`)
);

CREATE TABLE `result_ak04` (
	`id` int AUTO_INCREMENT NOT NULL,
	`result_id` int NOT NULL,
	`approved_assessee` boolean NOT NULL,
	`q1_yes` boolean NOT NULL,
	`q2_yes` boolean NOT NULL,
	`q3_yes` boolean NOT NULL,
	`reason` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `result_ak04_id` PRIMARY KEY(`id`),
	CONSTRAINT `result_ak04_result_id_unique` UNIQUE(`result_id`)
);

CREATE TABLE `result_ak05` (
	`id` int AUTO_INCREMENT NOT NULL,
	`result_id` int NOT NULL,
	`approved_assessor` boolean NOT NULL,
	`is_competent` boolean NOT NULL,
	`description` varchar(255),
	`negative_positive_aspects` varchar(255),
	`rejection_notes` varchar(255),
	`improvement_suggestions` varchar(255),
	`notes` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `result_ak05_id` PRIMARY KEY(`id`),
	CONSTRAINT `result_ak05_result_id_unique` UNIQUE(`result_id`)
);

CREATE TABLE `result_apl02` (
	`id` int AUTO_INCREMENT NOT NULL,
	`result_apl02_id` int NOT NULL,
	`element_id` int NOT NULL,
	`is_competent` boolean NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `result_apl02_id` PRIMARY KEY(`id`),
	CONSTRAINT `result_apl02_result_apl02_id_element_id_unique` UNIQUE(`result_apl02_id`,`element_id`)
);

CREATE TABLE `result_apl02_header` (
	`id` int AUTO_INCREMENT NOT NULL,
	`result_id` int NOT NULL,
	`approved_assessee` boolean NOT NULL,
	`approved_assessor` boolean NOT NULL,
	`is_continue` boolean NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `result_apl02_header_id` PRIMARY KEY(`id`),
	CONSTRAINT `result_apl02_header_result_id_unique` UNIQUE(`result_id`)
);

CREATE TABLE `result_doc` (
	`id` int AUTO_INCREMENT NOT NULL,
	`result_id` int NOT NULL,
	`purpose` varchar(255) NOT NULL,
	`school_report_card` varchar(255) NOT NULL,
	`field_work_practice_certificate` varchar(255) NOT NULL,
	`student_card` varchar(255) NOT NULL,
	`family_card` varchar(255) NOT NULL,
	`id_card` varchar(255) NOT NULL,
	`approved` boolean NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `result_doc_id` PRIMARY KEY(`id`)
);

CREATE TABLE `result_ia01` (
	`id` int AUTO_INCREMENT NOT NULL,
	`header_id` int NOT NULL,
	`element_detail_id` int NOT NULL,
	`is_competent` boolean NOT NULL,
	`evaluation` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `result_ia01_id` PRIMARY KEY(`id`),
	CONSTRAINT `result_ia01_header_id_element_detail_id_unique` UNIQUE(`header_id`,`element_detail_id`)
);

CREATE TABLE `result_ia01_header` (
	`id` int AUTO_INCREMENT NOT NULL,
	`result_id` int NOT NULL,
	`approved_assessee` boolean NOT NULL,
	`approved_assessor` boolean NOT NULL,
	`is_competent` boolean NOT NULL,
	`group` varchar(255),
	`unit` varchar(255),
	`element` varchar(255),
	`kuk` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `result_ia01_header_id` PRIMARY KEY(`id`),
	CONSTRAINT `result_ia01_header_result_id_unique` UNIQUE(`result_id`)
);

CREATE TABLE `result_ia02_header` (
	`id` int AUTO_INCREMENT NOT NULL,
	`result_id` int NOT NULL,
	`approved_assessee` boolean NOT NULL,
	`approved_assessor` boolean NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `result_ia02_header_id` PRIMARY KEY(`id`),
	CONSTRAINT `result_ia02_header_result_id_unique` UNIQUE(`result_id`)
);

CREATE TABLE `result_ia03` (
	`id` int AUTO_INCREMENT NOT NULL,
	`header_id` int NOT NULL,
	`question_id` int NOT NULL,
	`answer` varchar(255) NOT NULL,
	`approved` boolean NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `result_ia03_id` PRIMARY KEY(`id`),
	CONSTRAINT `result_ia03_header_id_question_id_unique` UNIQUE(`header_id`,`question_id`)
);

CREATE TABLE `result_ia03_header` (
	`id` int AUTO_INCREMENT NOT NULL,
	`result_id` int NOT NULL,
	`approved_assessee` boolean NOT NULL,
	`approved_assessor` boolean NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `result_ia03_header_id` PRIMARY KEY(`id`),
	CONSTRAINT `result_ia03_header_result_id_unique` UNIQUE(`result_id`)
);

CREATE TABLE `result_ia05` (
	`id` int AUTO_INCREMENT NOT NULL,
	`header_id` int NOT NULL,
	`option_id` int NOT NULL,
	`approved` boolean NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `result_ia05_id` PRIMARY KEY(`id`),
	CONSTRAINT `result_ia05_header_id_option_id_unique` UNIQUE(`header_id`,`option_id`)
);

CREATE TABLE `result_ia05_header` (
	`id` int AUTO_INCREMENT NOT NULL,
	`result_id` int NOT NULL,
	`approved_assessee` boolean NOT NULL,
	`approved_assessor` boolean NOT NULL,
	`is_achieved` boolean NOT NULL,
	`unit` varchar(255),
	`element` varchar(255),
	`kuk` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `result_ia05_header_id` PRIMARY KEY(`id`),
	CONSTRAINT `result_ia05_header_result_id_unique` UNIQUE(`result_id`)
);

CREATE TABLE `result_ia07` (
	`id` int AUTO_INCREMENT NOT NULL,
	`header_id` int NOT NULL,
	`question_id` int NOT NULL,
	`approved` boolean NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `result_ia07_id` PRIMARY KEY(`id`)
);

CREATE TABLE `result_ia07_header` (
	`id` int AUTO_INCREMENT NOT NULL,
	`result_id` int NOT NULL,
	`approved_assessee` boolean NOT NULL,
	`approved_assessor` boolean NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `result_ia07_header_id` PRIMARY KEY(`id`),
	CONSTRAINT `result_ia07_header_result_id_unique` UNIQUE(`result_id`)
);

CREATE TABLE `role` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `role_id` PRIMARY KEY(`id`)
);

CREATE TABLE `schedule_detail` (
	`id` int AUTO_INCREMENT NOT NULL,
	`schedule_id` int NOT NULL,
	`assessor_id` int NOT NULL,
	`location` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schedule_detail_id` PRIMARY KEY(`id`)
);

CREATE TABLE `scheme` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheme_id` PRIMARY KEY(`id`)
);

CREATE TABLE `uc_apl02` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessment_id` int NOT NULL,
	`unit_code` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `uc_apl02_id` PRIMARY KEY(`id`)
);

CREATE TABLE `uc_ia01` (
	`id` int AUTO_INCREMENT NOT NULL,
	`group_id` int NOT NULL,
	`unit_code` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `uc_ia01_id` PRIMARY KEY(`id`)
);

CREATE TABLE `uc_ia02` (
	`id` int AUTO_INCREMENT NOT NULL,
	`group_id` int NOT NULL,
	`unit_code` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `uc_ia02_id` PRIMARY KEY(`id`)
);

CREATE TABLE `uc_ia03` (
	`id` int AUTO_INCREMENT NOT NULL,
	`group_id` int NOT NULL,
	`unit_code` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `uc_ia03_id` PRIMARY KEY(`id`)
);

CREATE TABLE `user` (
	`id` int AUTO_INCREMENT NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`role_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);

ALTER TABLE `admin` ADD CONSTRAINT `admin_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `ak02_evidence` ADD CONSTRAINT `ak02_evidence_result_ak02_id_result_ak02_id_fk` FOREIGN KEY (`result_ak02_id`) REFERENCES `result_ak02`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `apl02_evidence` ADD CONSTRAINT `apl02_evidence_result_apl02_id_result_apl02_id_fk` FOREIGN KEY (`result_apl02_id`) REFERENCES `result_apl02`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `assessee` ADD CONSTRAINT `assessee_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `assessee_job` ADD CONSTRAINT `assessee_job_assessee_id_assessee_id_fk` FOREIGN KEY (`assessee_id`) REFERENCES `assessee`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `assessment` ADD CONSTRAINT `assessment_occupation_id_occupation_id_fk` FOREIGN KEY (`occupation_id`) REFERENCES `occupation`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `assessment_schedule` ADD CONSTRAINT `assessment_schedule_assessment_id_assessment_id_fk` FOREIGN KEY (`assessment_id`) REFERENCES `assessment`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `assessor` ADD CONSTRAINT `assessor_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `assessor` ADD CONSTRAINT `assessor_scheme_id_scheme_id_fk` FOREIGN KEY (`scheme_id`) REFERENCES `scheme`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `assessor_detail` ADD CONSTRAINT `assessor_detail_assessor_id_assessor_id_fk` FOREIGN KEY (`assessor_id`) REFERENCES `assessor`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `element_apl02` ADD CONSTRAINT `element_apl02_uc_id_uc_apl02_id_fk` FOREIGN KEY (`uc_id`) REFERENCES `uc_apl02`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `element_details_apl02` ADD CONSTRAINT `element_details_apl02_element_id_element_apl02_id_fk` FOREIGN KEY (`element_id`) REFERENCES `element_apl02`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `element_details_ia` ADD CONSTRAINT `element_details_ia_element_id_element_ia_id_fk` FOREIGN KEY (`element_id`) REFERENCES `element_ia`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `element_ia` ADD CONSTRAINT `element_ia_uc_id_uc_ia01_id_fk` FOREIGN KEY (`uc_id`) REFERENCES `uc_ia01`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `group_ia01` ADD CONSTRAINT `group_ia01_assessment_id_assessment_id_fk` FOREIGN KEY (`assessment_id`) REFERENCES `assessment`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `group_ia02` ADD CONSTRAINT `group_ia02_assessment_id_assessment_id_fk` FOREIGN KEY (`assessment_id`) REFERENCES `assessment`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `group_ia03` ADD CONSTRAINT `group_ia03_assessment_id_assessment_id_fk` FOREIGN KEY (`assessment_id`) REFERENCES `assessment`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `ia02_pdf` ADD CONSTRAINT `ia02_pdf_assessment_id_assessment_id_fk` FOREIGN KEY (`assessment_id`) REFERENCES `assessment`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `ia02_tool` ADD CONSTRAINT `ia02_tool_group_id_group_ia02_id_fk` FOREIGN KEY (`group_id`) REFERENCES `group_ia02`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `ia03_question` ADD CONSTRAINT `ia03_question_group_id_group_ia03_id_fk` FOREIGN KEY (`group_id`) REFERENCES `group_ia03`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `ia05_question` ADD CONSTRAINT `ia05_question_assessment_id_assessment_id_fk` FOREIGN KEY (`assessment_id`) REFERENCES `assessment`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `ia07_question` ADD CONSTRAINT `ia07_question_assessment_id_assessment_id_fk` FOREIGN KEY (`assessment_id`) REFERENCES `assessment`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `occupation` ADD CONSTRAINT `occupation_scheme_id_scheme_id_fk` FOREIGN KEY (`scheme_id`) REFERENCES `scheme`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `question_option` ADD CONSTRAINT `question_option_question_id_ia05_question_id_fk` FOREIGN KEY (`question_id`) REFERENCES `ia05_question`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result` ADD CONSTRAINT `result_assessment_id_assessment_id_fk` FOREIGN KEY (`assessment_id`) REFERENCES `assessment`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result` ADD CONSTRAINT `result_assessor_id_assessor_id_fk` FOREIGN KEY (`assessor_id`) REFERENCES `assessor`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result` ADD CONSTRAINT `result_assessee_id_assessee_id_fk` FOREIGN KEY (`assessee_id`) REFERENCES `assessee`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_ak01` ADD CONSTRAINT `result_ak01_header_id_result_ak01_header_id_fk` FOREIGN KEY (`header_id`) REFERENCES `result_ak01_header`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_ak01_header` ADD CONSTRAINT `result_ak01_header_result_id_result_id_fk` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_ak02` ADD CONSTRAINT `result_ak02_header_id_result_ak02_header_id_fk` FOREIGN KEY (`header_id`) REFERENCES `result_ak02_header`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_ak02` ADD CONSTRAINT `result_ak02_uc_id_uc_apl02_id_fk` FOREIGN KEY (`uc_id`) REFERENCES `uc_apl02`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_ak02_header` ADD CONSTRAINT `result_ak02_header_result_id_result_id_fk` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_ak03` ADD CONSTRAINT `result_ak03_header_id_result_ak03_header_id_fk` FOREIGN KEY (`header_id`) REFERENCES `result_ak03_header`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_ak03_header` ADD CONSTRAINT `result_ak03_header_result_id_result_id_fk` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_ak04` ADD CONSTRAINT `result_ak04_result_id_result_id_fk` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_ak05` ADD CONSTRAINT `result_ak05_result_id_result_id_fk` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_apl02` ADD CONSTRAINT `result_apl02_result_apl02_id_result_apl02_header_id_fk` FOREIGN KEY (`result_apl02_id`) REFERENCES `result_apl02_header`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_apl02` ADD CONSTRAINT `result_apl02_element_id_element_apl02_id_fk` FOREIGN KEY (`element_id`) REFERENCES `element_apl02`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_apl02_header` ADD CONSTRAINT `result_apl02_header_result_id_result_id_fk` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_doc` ADD CONSTRAINT `result_doc_result_id_result_id_fk` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_ia01` ADD CONSTRAINT `result_ia01_header_id_result_ia01_header_id_fk` FOREIGN KEY (`header_id`) REFERENCES `result_ia01_header`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_ia01` ADD CONSTRAINT `result_ia01_element_detail_id_element_details_ia_id_fk` FOREIGN KEY (`element_detail_id`) REFERENCES `element_details_ia`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_ia01_header` ADD CONSTRAINT `result_ia01_header_result_id_result_id_fk` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_ia02_header` ADD CONSTRAINT `result_ia02_header_result_id_result_id_fk` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_ia03` ADD CONSTRAINT `result_ia03_header_id_result_ia03_header_id_fk` FOREIGN KEY (`header_id`) REFERENCES `result_ia03_header`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_ia03` ADD CONSTRAINT `result_ia03_question_id_ia03_question_id_fk` FOREIGN KEY (`question_id`) REFERENCES `ia03_question`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_ia03_header` ADD CONSTRAINT `result_ia03_header_result_id_result_id_fk` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_ia05` ADD CONSTRAINT `result_ia05_header_id_result_ia05_header_id_fk` FOREIGN KEY (`header_id`) REFERENCES `result_ia05_header`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_ia05` ADD CONSTRAINT `result_ia05_option_id_question_option_id_fk` FOREIGN KEY (`option_id`) REFERENCES `question_option`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_ia05_header` ADD CONSTRAINT `result_ia05_header_result_id_result_id_fk` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_ia07` ADD CONSTRAINT `result_ia07_header_id_result_ia07_header_id_fk` FOREIGN KEY (`header_id`) REFERENCES `result_ia07_header`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_ia07` ADD CONSTRAINT `result_ia07_question_id_ia07_question_id_fk` FOREIGN KEY (`question_id`) REFERENCES `ia07_question`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `result_ia07_header` ADD CONSTRAINT `result_ia07_header_result_id_result_id_fk` FOREIGN KEY (`result_id`) REFERENCES `result`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `schedule_detail` ADD CONSTRAINT `schedule_detail_schedule_id_assessment_schedule_id_fk` FOREIGN KEY (`schedule_id`) REFERENCES `assessment_schedule`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `schedule_detail` ADD CONSTRAINT `schedule_detail_assessor_id_assessor_id_fk` FOREIGN KEY (`assessor_id`) REFERENCES `assessor`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `uc_apl02` ADD CONSTRAINT `uc_apl02_assessment_id_assessment_id_fk` FOREIGN KEY (`assessment_id`) REFERENCES `assessment`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `uc_ia01` ADD CONSTRAINT `uc_ia01_group_id_group_ia01_id_fk` FOREIGN KEY (`group_id`) REFERENCES `group_ia01`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `uc_ia02` ADD CONSTRAINT `uc_ia02_group_id_group_ia02_id_fk` FOREIGN KEY (`group_id`) REFERENCES `group_ia02`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `uc_ia03` ADD CONSTRAINT `uc_ia03_group_id_group_ia03_id_fk` FOREIGN KEY (`group_id`) REFERENCES `group_ia03`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `user` ADD CONSTRAINT `user_role_id_role_id_fk` FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON DELETE cascade ON UPDATE cascade;