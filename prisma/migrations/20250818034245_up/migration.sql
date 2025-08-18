-- RedefineIndex
CREATE UNIQUE INDEX `admin_user_id_key` ON `admin`(`user_id`);
DROP INDEX `admin_user_id_keyy` ON `admin`;

-- RedefineIndex
CREATE UNIQUE INDEX `assessee_user_id_key` ON `assessee`(`user_id`);
DROP INDEX `assessee_user_id_keyy` ON `assessee`;

-- RedefineIndex
CREATE UNIQUE INDEX `assessee_job_assessee_id_key` ON `assessee_job`(`assessee_id`);
DROP INDEX `assessee_job_assessee_id_keyy` ON `assessee_job`;

-- RedefineIndex
CREATE UNIQUE INDEX `assessor_user_id_key` ON `assessor`(`user_id`);
DROP INDEX `assessor_user_id_keyy` ON `assessor`;

-- RedefineIndex
CREATE UNIQUE INDEX `user_email_key` ON `user`(`email`);
DROP INDEX `user_email_keyy` ON `user`;
