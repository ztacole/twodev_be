/*
  Warnings:

  - You are about to drop the column `q10_yes` on the `result_ak03` table. All the data in the column will be lost.
  - You are about to drop the column `q1_yes` on the `result_ak03` table. All the data in the column will be lost.
  - You are about to drop the column `q2_yes` on the `result_ak03` table. All the data in the column will be lost.
  - You are about to drop the column `q3_yes` on the `result_ak03` table. All the data in the column will be lost.
  - You are about to drop the column `q4_yes` on the `result_ak03` table. All the data in the column will be lost.
  - You are about to drop the column `q5_yes` on the `result_ak03` table. All the data in the column will be lost.
  - You are about to drop the column `q6_yes` on the `result_ak03` table. All the data in the column will be lost.
  - You are about to drop the column `q7_yes` on the `result_ak03` table. All the data in the column will be lost.
  - You are about to drop the column `q8_yes` on the `result_ak03` table. All the data in the column will be lost.
  - You are about to drop the column `q9_yes` on the `result_ak03` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[header_id,question_id]` on the table `result_ak03` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `answer` to the `result_ak03` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question_id` to the `result_ak03` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `result_ak03` DROP COLUMN `q10_yes`,
    DROP COLUMN `q1_yes`,
    DROP COLUMN `q2_yes`,
    DROP COLUMN `q3_yes`,
    DROP COLUMN `q4_yes`,
    DROP COLUMN `q5_yes`,
    DROP COLUMN `q6_yes`,
    DROP COLUMN `q7_yes`,
    DROP COLUMN `q8_yes`,
    DROP COLUMN `q9_yes`,
    ADD COLUMN `answer` BOOLEAN NOT NULL,
    ADD COLUMN `question_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `result_ak03_question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `question` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `result_ak03_header_id_question_id_key` ON `result_ak03`(`header_id`, `question_id`);

-- AddForeignKey
ALTER TABLE `result_ak03` ADD CONSTRAINT `result_ak03_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `result_ak03_question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
