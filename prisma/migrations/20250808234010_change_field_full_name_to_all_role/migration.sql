/*
  Warnings:

  - You are about to drop the column `full_name` on the `User` table. All the data in the column will be lost.
  - Added the required column `full_name` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_name` to the `Assessee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_name` to the `Assessor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Admin` ADD COLUMN `full_name` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Assessee` ADD COLUMN `full_name` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Assessor` ADD COLUMN `full_name` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `full_name`;
