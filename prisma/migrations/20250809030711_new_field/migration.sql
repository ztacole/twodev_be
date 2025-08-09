/*
  Warnings:

  - A unique constraint covering the columns `[assessee_id]` on the table `Assessee_Job` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `job_email` to the `Assessee_Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postal_code` to the `Assessee_Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Assessee` ADD COLUMN `house_phone_no` VARCHAR(191) NULL,
    ADD COLUMN `office_phone_no` VARCHAR(191) NULL,
    ADD COLUMN `postal_code` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Assessee_Job` ADD COLUMN `job_email` VARCHAR(191) NOT NULL,
    ADD COLUMN `postal_code` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Assessee_Job_assessee_id_key` ON `Assessee_Job`(`assessee_id`);
