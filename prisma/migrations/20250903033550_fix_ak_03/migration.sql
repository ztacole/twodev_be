/*
  Warnings:

  - You are about to drop the column `component` on the `result_ak03` table. All the data in the column will be lost.
  - You are about to drop the column `is_ok` on the `result_ak03` table. All the data in the column will be lost.
  - Added the required column `q10_yes` to the `result_ak03` table without a default value. This is not possible if the table is not empty.
  - Added the required column `q1_yes` to the `result_ak03` table without a default value. This is not possible if the table is not empty.
  - Added the required column `q2_yes` to the `result_ak03` table without a default value. This is not possible if the table is not empty.
  - Added the required column `q3_yes` to the `result_ak03` table without a default value. This is not possible if the table is not empty.
  - Added the required column `q4_yes` to the `result_ak03` table without a default value. This is not possible if the table is not empty.
  - Added the required column `q5_yes` to the `result_ak03` table without a default value. This is not possible if the table is not empty.
  - Added the required column `q6_yes` to the `result_ak03` table without a default value. This is not possible if the table is not empty.
  - Added the required column `q7_yes` to the `result_ak03` table without a default value. This is not possible if the table is not empty.
  - Added the required column `q8_yes` to the `result_ak03` table without a default value. This is not possible if the table is not empty.
  - Added the required column `q9_yes` to the `result_ak03` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `result_ak03` DROP COLUMN `component`,
    DROP COLUMN `is_ok`,
    ADD COLUMN `q10_yes` BOOLEAN NOT NULL,
    ADD COLUMN `q1_yes` BOOLEAN NOT NULL,
    ADD COLUMN `q2_yes` BOOLEAN NOT NULL,
    ADD COLUMN `q3_yes` BOOLEAN NOT NULL,
    ADD COLUMN `q4_yes` BOOLEAN NOT NULL,
    ADD COLUMN `q5_yes` BOOLEAN NOT NULL,
    ADD COLUMN `q6_yes` BOOLEAN NOT NULL,
    ADD COLUMN `q7_yes` BOOLEAN NOT NULL,
    ADD COLUMN `q8_yes` BOOLEAN NOT NULL,
    ADD COLUMN `q9_yes` BOOLEAN NOT NULL;
