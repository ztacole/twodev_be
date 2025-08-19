/*
  Warnings:

  - You are about to drop the column `assessor_id` on the `result_doc` table. All the data in the column will be lost.
  - You are about to drop the `assessee_answer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `assessment_question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `element` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `element_detail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `question_pg_detail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `result_detail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `unit_competency` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `assessee_answer` DROP FOREIGN KEY `assessee_answer_assessee_id_fkey`;

-- DropForeignKey
ALTER TABLE `assessee_answer` DROP FOREIGN KEY `assessee_answer_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `assessment_question` DROP FOREIGN KEY `assessment_question_assessment_id_fkey`;

-- DropForeignKey
ALTER TABLE `element` DROP FOREIGN KEY `element_unit_competency_id_fkey`;

-- DropForeignKey
ALTER TABLE `element_detail` DROP FOREIGN KEY `element_detail_element_id_fkey`;

-- DropForeignKey
ALTER TABLE `question_pg_detail` DROP FOREIGN KEY `question_pg_detail_question_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_detail` DROP FOREIGN KEY `result_detail_element_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_detail` DROP FOREIGN KEY `result_detail_result_id_fkey`;

-- DropForeignKey
ALTER TABLE `result_doc` DROP FOREIGN KEY `result_doc_assessor_id_fkey`;

-- DropForeignKey
ALTER TABLE `unit_competency` DROP FOREIGN KEY `unit_competency_assessment_id_fkey`;

-- DropIndex
DROP INDEX `result_doc_assessor_id_fkey` ON `result_doc`;

-- AlterTable
ALTER TABLE `result_doc` DROP COLUMN `assessor_id`;

-- DropTable
DROP TABLE `assessee_answer`;

-- DropTable
DROP TABLE `assessment_question`;

-- DropTable
DROP TABLE `element`;

-- DropTable
DROP TABLE `element_detail`;

-- DropTable
DROP TABLE `question_pg_detail`;

-- DropTable
DROP TABLE `result_detail`;

-- DropTable
DROP TABLE `unit_competency`;
