/*
  Warnings:

  - You are about to drop the column `end_date` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Assessment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Assessment` DROP COLUMN `end_date`,
    DROP COLUMN `start_date`,
    DROP COLUMN `status`;

-- CreateTable
CREATE TABLE `Assessment_Schedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `status` ENUM('Planned', 'Ongoing', 'Completed') NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Assessment_Schedule` ADD CONSTRAINT `Assessment_Schedule_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `Assessment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
