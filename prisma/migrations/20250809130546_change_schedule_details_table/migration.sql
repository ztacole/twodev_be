/*
  Warnings:

  - You are about to drop the column `status` on the `assessment_schedule` table. All the data in the column will be lost.
  - You are about to drop the `assessment_details` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `assessment_details` DROP FOREIGN KEY `Assessment_Details_assessment_id_fkey`;

-- DropForeignKey
ALTER TABLE `assessment_details` DROP FOREIGN KEY `Assessment_Details_assessor_id_fkey`;

-- AlterTable
ALTER TABLE `assessment_schedule` DROP COLUMN `status`;

-- DropTable
DROP TABLE `assessment_details`;

-- CreateTable
CREATE TABLE `Schedule_Details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `schedule_id` INTEGER NOT NULL,
    `assessor_id` INTEGER NOT NULL,
    `location` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Schedule_Details` ADD CONSTRAINT `Schedule_Details_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `Assessment_Schedule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedule_Details` ADD CONSTRAINT `Schedule_Details_assessor_id_fkey` FOREIGN KEY (`assessor_id`) REFERENCES `Assessor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
